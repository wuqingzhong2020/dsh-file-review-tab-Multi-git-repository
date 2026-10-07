import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import { execFileSync } from 'node:child_process'
import { Context } from '@deepseek-ai/cordis'
import { MultiGitRepoManager, writeProjectFile, previewProject } from 'dsh-multi-git-repo-manager'
import { FileReviewService } from '../lib/index.js'
import { gitReview, gitReviewDiff } from '../src/git-review.ts'
import {
  PROJECT_DIRECTORY,
  gitRepositoryFilter,
  isDirectorySelection,
  selectionIncludes,
  targetSelection,
} from '../src/client/review-target-selection.ts'

const root = await mkdtemp(join(tmpdir(), 'dsh-plain-review-'))
after(async () => { assert.ok(relative(tmpdir(), root).startsWith('dsh-plain-review-')); await rm(root, { recursive: true, force: true }) })
const plain = join(root, 'local'); const unknown = join(root, 'project', 'unknown')
await mkdir(plain); await mkdir(unknown, { recursive: true })
execFileSync('git', ['init', '-q', root]); execFileSync('git', ['-C', root, 'config', 'core.autocrlf', 'false'])
await writeFile(join(root, 'file.txt'), 'before\n'); await writeFile(join(plain, 'file.txt'), 'before\n')
execFileSync('git', ['-C', root, 'add', '.'])
execFileSync('git', ['-C', root, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', 'base'])
await writeFile(join(root, 'file.txt'), 'after\n'); await writeFile(join(plain, 'file.txt'), 'after\n'); await writeFile(join(unknown, 'file.txt'), 'after\n')
const configuration = { name: 'Mixed', root, enabled: true, includeProjectRoot: true, repositories: [], directories: [{ name: 'Local', path: 'local' }], discovery: { containers: ['project'] } }
await writeProjectFile(configuration, '')
const ctx = new Context(); const manager = new MultiGitRepoManager(ctx); const review = new FileReviewService(ctx, manager)
after(() => ctx.fiber.dispose())
const agent = { id: 'mixed', session: { header: { cwd: root } }, runMaintenance: fn => fn() }
const change = path => ({ path, diffs: [{ path, oldText: 'before\n', newText: 'after\n', oldStart: 1, newStart: 1 }] })

test('session undo and redo work for ordinary directories while undiscovered siblings stay untouched', async () => {
  const files = [change('local/file.txt'), change('project/unknown/file.txt')]
  assert.deepEqual((await review.status(agent, { action: 'undo', files })).files.map(file => file.state), ['applied', 'unsupported'])
  assert.deepEqual((await review.apply(agent, { action: 'undo', files })).files.map(file => file.state), ['undone', 'unsupported'])
  assert.equal(await readFile(join(plain, 'file.txt'), 'utf8'), 'before\n')
  assert.equal(await readFile(join(unknown, 'file.txt'), 'utf8'), 'after\n')
  assert.equal((await review.apply(agent, { action: 'redo', files: [files[0]] })).files[0].state, 'applied')
})

test('Git comparison and lazy diff refuse a nested plain directory tracked by the parent Git repository', async () => {
  const workspace = await previewProject(configuration)
  const result = await gitReview(workspace, root, { mode: 'unstaged' })
  assert.ok(result.files.some(file => file.path === 'file.txt'))
  assert.ok(!result.files.some(file => file.path.startsWith('local/')))
  await assert.rejects(gitReviewDiff(workspace, root, { mode: 'unstaged', repository: root, path: 'local/file.txt' }), /another target/)
})

test('all Git and all directory selections use the same Host ownership and never include unmanaged files', async () => {
  const workspace = await manager.workspace(agent)
  const owners = await manager.resolveTargetPaths(agent, ['file.txt', 'local/file.txt', 'project/unknown/file.txt'])
  for (const [value, expected] of [['*', [true, false, false]], ['@directories', [false, true, false]], ['?', [false, false, true]], [plain, [false, true, false]]])
    assert.deepEqual(owners.map(owner => selectionIncludes(targetSelection(value, workspace.targets), owner)), expected)
})

test('the current project directory selection aggregates Git, directory and undisclosed files inside the root', async () => {
  const workspace = await manager.workspace(agent)
  const outside = join(root, '..', 'outside-project.txt')
  const owners = await manager.resolveTargetPaths(agent, ['file.txt', 'local/file.txt', 'project/unknown/file.txt', outside])
  const project = targetSelection(PROJECT_DIRECTORY, workspace.targets, workspace.project.root)
  assert.deepEqual(owners.map(owner => selectionIncludes(project, owner)), [true, true, true, false])
  // A whole-project selection still allows Git comparisons and keeps every Git repository.
  assert.equal(isDirectorySelection(project), false)
  assert.equal(gitRepositoryFilter(PROJECT_DIRECTORY), '*')
  assert.equal(gitRepositoryFilter(plain), plain)
  assert.equal(selectionIncludes(project, undefined), false)
})
