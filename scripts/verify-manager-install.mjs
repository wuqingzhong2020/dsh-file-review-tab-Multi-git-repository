/** Install both release artifacts in a temporary profile, without local repo links. */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, realpath, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, relative, resolve, sep } from 'node:path'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { Context } from '@deepseek-ai/cordis'

const pkg = JSON.parse(await readFile('package.json', 'utf8'))
const managerName = 'dsh-multi-git-repo-manager'
const managerRoot = resolve('../dsh-multi-git-repo-manager')
const managerPkg = JSON.parse(await readFile(join(managerRoot, 'package.json'), 'utf8'))
const managerArchive = resolve(managerRoot, 'dist', `${managerName}-${managerPkg.version}.tgz`)
const reviewArchive = resolve('dist', `${pkg.name}-${pkg.version}.tgz`)
const npm = execFileSync(process.platform === 'win32' ? 'where.exe' : 'which', ['npm'], { encoding: 'utf8' }).trim().split(/\r?\n/)[0].replace(/npm(?:\.cmd)?$/, 'node_modules/npm/bin/npm-cli.js')
const profile = await mkdtemp(join(tmpdir(), 'dsh-manager-install-'))
try {
  await writeFile(join(profile, 'package.json'), JSON.stringify({ private: true, type: 'module',
    dependencies: { [managerName]: pathToFileURL(managerArchive).href, [pkg.name]: pathToFileURL(reviewArchive).href },
    dsh: { profile: { bundles: [managerName, pkg.name] } },
  }))
  const pnpm = process.argv.includes('--pnpm') ? process.env.npm_execpath : undefined
  if (process.argv.includes('--pnpm')) assert.ok(pnpm?.endsWith('.mjs') || pnpm?.endsWith('.js'), 'Run this check through pnpm test:install --pnpm')
  const installArgs = pnpm
    ? [pnpm, 'install', '--ignore-scripts', '--config.autoInstallPeers=false', '--no-frozen-lockfile']
    : [npm, 'install', '--ignore-scripts', '--legacy-peer-deps', '--no-audit', '--no-fund', '--package-lock=false']
  execFileSync(process.execPath, installArgs, {
    cwd: profile, encoding: 'utf8', stdio: 'pipe', timeout: 120000,
  })
  // Host peers come from the existing test runtime; plugin packages themselves are real tgz installs.
  for (const name of new Set([...Object.keys(pkg.peerDependencies), ...Object.keys(managerPkg.peerDependencies)])) {
    const destination = join(profile, 'node_modules', name)
    if (existsSync(destination)) continue
    const source = await realpath(resolve('node_modules', name))
    await mkdir(resolve(destination, '..'), { recursive: true })
    await symlink(source, destination, process.platform === 'win32' ? 'junction' : 'dir')
  }
  const installedRequire = createRequire(join(profile, 'package.json'))
  const managerEntry = installedRequire.resolve(managerName)
  assert.ok(relative(profile, managerEntry).startsWith(`node_modules${sep}`), 'Manager resolved outside the temporary install')
  const installedManager = JSON.parse(await readFile(installedRequire.resolve(managerName + '/package.json'), 'utf8'))
  const installedReview = JSON.parse(await readFile(installedRequire.resolve(pkg.name + '/package.json'), 'utf8'))
  assert.equal(installedManager.version, '0.1.3')
  assert.equal(installedReview.peerDependencies[managerName], '0.1.3')
  const manager = await import(pathToFileURL(managerEntry))
  const review = await import(pathToFileURL(installedRequire.resolve(pkg.name)))
  const ctx = new Context()
  try {
    await ctx.plugin(manager, { projects: [] }).await()
    const service = new review.FileReviewService(ctx, ctx.get('multiGitRepoManagerByWqz'))
    const agent = { id: 'installed', session: { header: { cwd: profile } } }
    assert.deepEqual(await service.workspace(agent), await ctx.get('multiGitRepoManagerByWqz').workspace(agent))
  } finally { await ctx.fiber.dispose() }
  console.log(`PASS (${pnpm ? 'pnpm' : 'npm'}): both tgz packages install together, resolve the pinned 0.1.3 dependency, and share the real Host service.`)
} finally {
  const child = relative(tmpdir(), profile)
  assert.ok(child.startsWith('dsh-manager-install-') && !child.includes(sep))
  await rm(profile, { recursive: true, force: true })
}
