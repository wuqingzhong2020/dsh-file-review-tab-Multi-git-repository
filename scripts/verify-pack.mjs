import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { USER_GUIDE_IMAGES } from '../src/user-guide.ts'

const pkg = JSON.parse(await readFile('package.json', 'utf8'))
await mkdir('dist', { recursive: true })
// npm's CLI entry avoids shell execution and works on Windows as well as Unix.
const npm = process.env.npm_execpath
const command = npm && /npm-cli\.js$/.test(npm) ? npm : execFileSync(process.platform === 'win32' ? 'where.exe' : 'which', ['npm'], { encoding: 'utf8' }).trim().split(/\r?\n/)[0].replace(/npm(?:\.cmd)?$/, 'node_modules/npm/bin/npm-cli.js')
const result = JSON.parse(execFileSync(process.execPath, [command, 'pack', '--json', '--pack-destination', 'dist'], { encoding: 'utf8' }))[0]
const files = new Set(result.files.map(file => file.path))
for (const path of ['LICENSE', 'README.md', 'README.en.md', 'cordis.patch.yml', 'lib/index.js', 'lib/client.js', 'lib/remote.js', 'lib/typert.host.js', 'docs/ARCHITECTURE.md', 'docs/REPOSITORY_MANAGER.md', 'docs/RELEASING.md', 'docs/USER_GUIDE.md', 'docs/USER_GUIDE.en.md', 'docs/releases/version.md']) assert.ok(files.has(path), `Missing package entry: ${path}`)
for (const image of USER_GUIDE_IMAGES) assert.ok(files.has(`docs/image/${image}`), `Missing package image: ${image}`)
for (const [entry, target] of Object.entries(pkg.exports)) {
  if (typeof target === 'string') assert.ok(files.has(target.replace(/^\.\//, '')), entry)
  else for (const path of Object.values(target)) assert.ok(files.has(path.replace(/^\.\//, '')), entry)
}
assert.ok(![...files].some(path => path.includes('TEMP_REF_FEATURE') || path.startsWith('tests/') || path.startsWith('node_modules/')))
assert.ok(!Object.keys(pkg.dependencies).some(name => /better-sidebar|file-review-tab|left0ver/.test(name)))
assert.equal(pkg.peerDependencies['dsh-multi-git-repo-manager'], '0.1.4')
assert.equal(pkg.version, '0.3.5')
assert.notEqual(pkg.peerDependenciesMeta?.['dsh-multi-git-repo-manager']?.optional, true)
for (const name of ['@deepseek-ai/dsh-client-ui-input-trigger', '@deepseek-ai/dsh-client-ui-plugin-manager', '@deepseek-ai/dsh-client-ui-settings']) {
  assert.equal(pkg.peerDependenciesMeta[name].optional, true)
  assert.ok(!pkg.dsh.client.inject.includes(name), `Optional enhancement made mandatory: ${name}`)
}
const client = await readFile('lib/client.js', 'utf8')
const imports = [...client.matchAll(/require\("([^"]+)"\)/g)].map(match => match[1])
assert.ok(imports.every(name => ['react', 'react/jsx-runtime', '@deepseek-ai/dsh-client-ui-primitives'].includes(name)), `Unexpected browser imports: ${imports}`)
const path = resolve('dist', result.filename)
const archived = new Set(execFileSync('tar', ['-tzf', path], { encoding: 'utf8' }).trim().split(/\r?\n/).map(name => name.replace(/^package\//, '')))
assert.deepEqual(archived, files, 'Actual archive differs from the pack manifest')
for (const file of ['lib/index.js', 'lib/client.js', 'lib/typert.host.js', 'lib/remote.js']) {
  assert.deepEqual(execFileSync('tar', ['-xOf', path, 'package/' + file], { maxBuffer: 8 * 1024 * 1024 }), await readFile(file), `Stale bundled artifact: ${file}`)
}
const hash = createHash('sha256').update(await readFile(path)).digest('hex')
await writeFile(path + '.sha256', `${hash}  ${result.filename}\n`)
console.log(`PASS: ${files.size} packaged entries; exports, ${USER_GUIDE_IMAGES.length} images, optional official peers and temporary-plan exclusion verified.\n${path}\nSHA256 ${hash}`)
