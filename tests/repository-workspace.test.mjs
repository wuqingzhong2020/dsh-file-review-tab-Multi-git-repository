import { after, test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, realpath, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, relative, sep } from 'node:path'
import { inside, parseRepositoryManifest, previewProject, resolveReviewWorkspace } from '../src/repository-workspace.ts'
import { absoluteReviewPath, fileRepository, normalizeReviewPath, relativeProjectDirectory, repositoryProjectPath, repositoryRelativePath } from '../src/client/repository-paths.ts'
import { readProjectFile, writeProjectFile, PROJECT_FILE_NAME } from '../src/repository-project-file.ts'
import { FileReviewService } from '../lib/index.js'

const directory = await mkdtemp(join(tmpdir(), 'dsh-review-repositories-'))
after(async () => {
  const child = relative(tmpdir(), directory)
  assert.ok(child.startsWith('dsh-review-repositories-') && !child.includes(sep))
  await rm(directory, { recursive: true, force: true })
})
const rootA = join(directory, 'project-a')
const rootB = join(directory, 'project-b')
const external = join(directory, 'external')
const unrelated = join(directory, 'unrelated')
for (const repo of [rootA, rootB, external, unrelated, join(rootA, 'libs', 'core'), join(rootB, 'libs', 'core')]) {
  await mkdir(join(repo, '.git'), { recursive: true })
  await writeFile(join(repo, '.git', 'HEAD'), 'ref: refs/heads/main\n')
}
const project = (root, extra = {}) => ({ name: '', root, includeProjectRoot: true, configFiles: [], repositories: [], ...extra })

test('undo crosses into an explicitly configured repo but refuses unrelated repos and junction escapes', async () => {
  const allowed = join(external, 'README.md')
  const denied = join(unrelated, 'README.md')
  await writeFile(allowed, 'after\r\n')
  await writeFile(denied, 'after\r\n')
  const projects = [project(rootA, { repositories: [external] })]
  const agent = { session: { header: { cwd: rootA } }, runMaintenance: async task => task() }
  const receiver = Object.assign(Object.create(FileReviewService.prototype), { workspace: async () => resolveReviewWorkspace(rootA, projects) })
  const change = path => ({ path, diffs: [{ path, oldText: 'before\n', newText: 'after\n', oldStart: 1, newStart: 1 }] })
  const result = await FileReviewService.prototype.apply.call(receiver, agent, { action: 'undo', files: [change(allowed), change(denied)] })
  assert.equal(result.files[0].state, 'undone')
  assert.equal(result.files[1].state, 'unsupported')
  assert.equal(await readFile(allowed, 'utf8'), 'before\r\n')
  assert.equal(await readFile(denied, 'utf8'), 'after\r\n')
  await symlink(unrelated, join(rootA, 'escape'), process.platform === 'win32' ? 'junction' : 'dir')
  const escaped = await FileReviewService.prototype.apply.call(receiver, agent, { action: 'undo', files: [change('escape/README.md')] })
  assert.equal(escaped.files[0].state, 'unsupported')
  assert.equal(await readFile(denied, 'utf8'), 'after\r\n')
})
