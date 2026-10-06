import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, realpath, rename, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, relative, sep } from 'node:path'
import { gitReview, gitReviewDiff, parseGitNames } from '../src/git-review.ts'
import { FileReviewService } from '../lib/index.js'
import { previewProject, resolveManagedWorkspace } from 'dsh-multi-git-repo-manager'

const directory = await mkdtemp(join(tmpdir(), 'dsh-git-review-'))
after(async () => {
  const child = relative(tmpdir(), directory)
  assert.ok(child.startsWith('dsh-git-review-') && !child.includes(sep))
  await rm(directory, { recursive: true, force: true })
})
let seq = 0
function command(root, ...args) {
  return execFileSync('git', ['-C', root, '-c', 'user.name=Review test', '-c', 'user.email=review@example.invalid', '-c', 'commit.gpgsign=false', ...args], { encoding: 'utf8', windowsHide: true })
}
async function repo(unborn = false) {
  const root = join(directory, `repo-${++seq}`)
  await mkdir(root); command(root, 'init', '-b', 'main')
  if (!unborn) { await writeFile(join(root, 'file.txt'), 'before\n'); command(root, 'add', '.'); command(root, 'commit', '-m', 'Initial') }
  return root
}
const workspace = root => resolveManagedWorkspace(root, [])
const aggregate = (root, paths) => previewProject({ name: 'Fixture', root, enabled: true, includeProjectRoot: false,
  repositories: paths.map((path, index) => ({ name: String(index), path })), directories: [], discovery: { containers: [] } })
async function review(root, mode, extra = {}) { return gitReview(await workspace(root), root, { mode, ...extra }) }
async function detail(root, mode, path, extra = {}) { return gitReviewDiff(await workspace(root), root, { mode, repository: root, path, ...extra }) }
function text(diff, side) { return diff.diffs.map(hunk => hunk[side]).join('') }

test('staged, unstaged and combined views distinguish the same file and include untracked files', async () => {
  const root = await repo()
  await writeFile(join(root, 'file.txt'), 'staged\n'); command(root, 'add', 'file.txt')
  await writeFile(join(root, 'file.txt'), 'working\n')
  await writeFile(join(root, '新文件 空格.txt'), 'new\n')
  assert.deepEqual((await review(root, 'staged')).files.map(file => file.path), ['file.txt'])
  assert.equal((await review(root, 'unstaged')).files.length, 2)
  assert.equal((await review(root, 'uncommitted')).files.length, 2)
  assert.equal(text(await detail(root, 'staged', 'file.txt'), 'oldText'), 'before\n')
  assert.equal(text(await detail(root, 'staged', 'file.txt'), 'newText'), 'staged\n')
  assert.equal(text(await detail(root, 'unstaged', 'file.txt'), 'oldText'), 'staged\n')
  assert.equal(text(await detail(root, 'unstaged', 'file.txt'), 'newText'), 'working\n')
  assert.equal(text(await detail(root, 'uncommitted', 'file.txt'), 'oldText'), 'before\n')
  const untracked = await detail(root, 'uncommitted', '新文件 空格.txt')
  assert.equal(untracked.diffs[0].oldText, null)
  assert.equal(untracked.diffs[0].newText, 'new\n')
  assert.equal(await readFile(join(root, 'file.txt'), 'utf8'), 'working\n')
  assert.equal(command(root, 'show', ':file.txt'), 'staged\n')
})

test('a combined diff is empty when staged and unstaged changes cancel each other', async () => {
  const root = await repo()
  await writeFile(join(root, 'file.txt'), 'staged\n'); command(root, 'add', 'file.txt')
  await writeFile(join(root, 'file.txt'), 'before\n')
  assert.equal((await review(root, 'uncommitted')).files.length, 0)
  assert.equal((await review(root, 'staged')).files.length, 1)
  assert.equal((await review(root, 'unstaged')).files.length, 1)
})

test('full unchanged context comes from each actual Git comparison, including historical commits', async () => {
  const root = await repo()
  const before = Array.from({ length: 150 }, (_, index) => `original ${index + 1}`).join('\n') + '\n'
  await writeFile(join(root, 'file.txt'), before); command(root, 'add', '.'); command(root, 'commit', '-m', 'Long file')
  const staged = before.replace('original 80\n', 'staged 80\n')
  const working = staged.replace('original 120\n', 'working 120\n')
  await writeFile(join(root, 'file.txt'), staged); command(root, 'add', '.')
  await writeFile(join(root, 'file.txt'), working)
  const unstaged = await detail(root, 'unstaged', 'file.txt')
  assert.equal(text(unstaged, 'oldText'), staged); assert.equal(text(unstaged, 'newText'), working)
  assert.equal(unstaged.diffs[0].oldStart, 1)
  const index = await detail(root, 'staged', 'file.txt')
  assert.equal(text(index, 'oldText'), before); assert.equal(text(index, 'newText'), staged)
  const combined = await detail(root, 'uncommitted', 'file.txt')
  assert.equal(text(combined, 'oldText'), before); assert.equal(text(combined, 'newText'), working)
  command(root, 'commit', '-m', 'Staged version')
  const committed = await detail(root, 'commit', 'file.txt')
  assert.equal(text(committed, 'oldText'), before); assert.equal(text(committed, 'newText'), staged)
  assert.equal(await readFile(join(root, 'file.txt'), 'utf8'), working)
})

test('committed review supports the root commit and a selected earlier commit', async () => {
  const root = await repo()
  const initial = command(root, 'rev-parse', 'HEAD').trim()
  assert.equal(text(await detail(root, 'commit', 'file.txt'), 'newText'), 'before\n')
  await writeFile(join(root, 'file.txt'), 'next\n'); command(root, 'add', '.'); command(root, 'commit', '-m', 'Second')
  const result = await review(root, 'commit')
  assert.equal(result.repositories[0].commits.length, 2)
  assert.equal(text(await detail(root, 'commit', 'file.txt'), 'oldText'), 'before\n')
  assert.equal(text(await detail(root, 'commit', 'file.txt', { ref: initial }), 'oldText'), '')
})

test('branch review uses the merge base and excludes uncommitted edits', async () => {
  const root = await repo()
  command(root, 'checkout', '-b', 'feature')
  await writeFile(join(root, 'feature.txt'), 'feature\n'); command(root, 'add', '.'); command(root, 'commit', '-m', 'Feature')
  await writeFile(join(root, 'file.txt'), 'uncommitted\n')
  const result = await review(root, 'branch', { ref: 'main' })
  assert.deepEqual(result.files.map(file => file.path), ['feature.txt'])
  assert.equal(text(await detail(root, 'branch', 'feature.txt', { ref: 'main' }), 'newText'), 'feature\n')
  assert.deepEqual((await review(root, 'branch')).files.map(file => file.path), ['feature.txt'])
  assert.equal(text(await detail(root, 'branch', 'feature.txt'), 'newText'), 'feature\n')
})

test('renames, deletions, binary files and missing final newlines render correctly', async () => {
  const root = await repo()
  await rename(join(root, 'file.txt'), join(root, 'renamed 空格.txt')); command(root, 'add', '-A')
  const renamed = (await review(root, 'staged')).files[0]
  assert.equal(renamed.status, 'R'); assert.equal(renamed.oldPath, 'file.txt')
  assert.equal((await detail(root, 'staged', renamed.path)).diffs.length, 0)
  command(root, 'commit', '-m', 'Rename')
  await writeFile(join(root, 'renamed 空格.txt'), 'without newline')
  assert.equal(text(await detail(root, 'unstaged', renamed.path), 'newText'), 'without newline')
  await writeFile(join(root, 'binary.bin'), Buffer.from([0, 1, 2]))
  assert.equal((await detail(root, 'uncommitted', 'binary.bin')).binary, true)
  await rm(join(root, renamed.path))
  assert.equal((await review(root, 'unstaged')).files.find(file => file.path === renamed.path).status, 'D')
  assert.equal(text(await detail(root, 'unstaged', renamed.path), 'newText'), '')
})

test('unborn repositories review index and working tree without HEAD', async () => {
  const root = await repo(true)
  await writeFile(join(root, 'file.txt'), 'staged\n'); command(root, 'add', '.')
  await writeFile(join(root, 'file.txt'), 'working\n')
  assert.equal(text(await detail(root, 'staged', 'file.txt'), 'newText'), 'staged\n')
  assert.equal(text(await detail(root, 'uncommitted', 'file.txt'), 'newText'), 'working\n')
  assert.equal((await review(root, 'commit')).warnings.length, 1)
  await rm(join(root, 'file.txt'))
  assert.equal((await review(root, 'uncommitted')).files.length, 0)
  assert.equal((await review(root, 'staged')).files.length, 1)
})

test('embedded repository files are reviewed by their own repository without a duplicate directory row', async () => {
  const parent = await repo(); const child = join(parent, 'child')
  await mkdir(child); command(child, 'init', '-b', 'main')
  await writeFile(join(child, 'new.txt'), 'child change\n')
  const ws = await aggregate(parent, [parent, child])
  const result = await gitReview(ws, parent, { mode: 'uncommitted' })
  assert.deepEqual(result.files.map(file => [file.repository, file.path]), [[await realpath(child), 'new.txt']])
})

test('multiple repositories remain isolated and endpoint refuses arbitrary roots and traversals', async () => {
  const a = await repo(); const b = await repo()
  await writeFile(join(a, 'file.txt'), 'A\n'); await writeFile(join(b, 'file.txt'), 'B\n')
  const ws = await aggregate(directory, [a, b])
  assert.equal((await gitReview(ws, a, { mode: 'unstaged' })).files.length, 2)
  assert.equal((await gitReview(ws, a, { mode: 'unstaged', repository: b })).files.length, 1)
  await assert.rejects(gitReview(await workspace(a), a, { mode: 'staged', repository: b }), /outside/)
  await assert.rejects(detail(a, 'unstaged', '../file.txt'), /Invalid/)
  await assert.rejects(detail(a, 'unstaged', join(b, 'file.txt')), /Invalid/)
  const receiver = Object.create(FileReviewService.prototype)
  receiver.workspace = async () => workspace(a)
  const agent = { session: { header: { cwd: a } } }
  assert.equal((await receiver.gitReview(agent, { mode: 'unstaged' })).files.length, 1)
  await assert.rejects(receiver.gitReviewDiff(agent, { mode: 'unstaged', repository: b, path: 'file.txt' }), /outside/)
})

test('zero-delimited Git paths preserve tabs and newlines and rename metadata', () => {
  const files = parseGitNames('M\0tab\tname\n.txt\0R100\0old.txt\0new.txt\0', 'root')
  assert.equal(files[0].path, 'tab\tname\n.txt'); assert.equal(files[1].oldPath, 'old.txt'); assert.equal(files[1].path, 'new.txt')
  assert.deepEqual(parseGitNames('U\0conflict.txt\0M\0conflict.txt\0', 'root').map(file => file.status), ['U'])
})
