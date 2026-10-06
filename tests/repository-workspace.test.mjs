import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, realpath, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import { MultiGitRepoManager, writeProjectFile } from 'dsh-multi-git-repo-manager'
import { FileReviewService } from '../lib/index.js'

test('review delegates external admission, revalidates removals and refuses junction escapes', async () => {
  const sandbox = await mkdtemp(join(tmpdir(), 'dsh-consumer-scope-'))
  const ctx = new Context()
  try {
    const root = join(sandbox, 'project'), external = join(sandbox, 'external'), unrelated = join(sandbox, 'unrelated')
    for (const path of [root, external, unrelated]) await mkdir(path)
    const project = { name: 'Project', root, enabled: true, includeProjectRoot: true,
      repositories: [], directories: [], discovery: { containers: [] } }
    await writeProjectFile(project, '')
    const manager = new MultiGitRepoManager(ctx)
    const calls = []
    // This real-service adapter implements both required read methods, with no scope copy.
    const reader = {
      workspace: agent => manager.workspace(agent),
      resolveTargetPaths: (agent, paths) => { calls.push(paths); return manager.resolveTargetPaths(agent, paths) },
    }
    const review = new FileReviewService(ctx, reader)
    const agent = { id: 'A', session: { header: { cwd: root } }, runMaintenance: task => task() }
    const allowed = join(external, 'README.md'), denied = join(unrelated, 'README.md')
    await writeFile(allowed, 'after\r\n'); await writeFile(denied, 'after\r\n')
    const change = path => ({ path, diffs: [{ path, oldText: 'before\n', newText: 'after\n', oldStart: 1, newStart: 1 }] })
    await manager.setTemporaryTargets(agent, [{ name: 'External', path: external, kind: 'directory' }])
    const result = await review.apply(agent, { action: 'undo', files: [change(allowed), change(denied)] })
    assert.deepEqual(result.files.map(file => file.state), ['undone', 'unsupported'])
    assert.equal(await readFile(allowed, 'utf8'), 'before\r\n')
    assert.equal(await readFile(denied, 'utf8'), 'after\r\n')
    assert.ok(calls.some(paths => paths.includes(allowed)))
    await manager.setTemporaryTargets(agent, [])
    const removed = await review.apply(agent, { action: 'redo', files: [change(allowed)] })
    assert.equal(removed.files[0].state, 'unsupported')
    assert.equal(await readFile(allowed, 'utf8'), 'before\r\n')
    await symlink(unrelated, join(root, 'escape'), process.platform === 'win32' ? 'junction' : 'dir')
    assert.equal((await review.apply(agent, { action: 'undo', files: [change('escape/README.md')] })).files[0].state, 'unsupported')
    assert.equal(await realpath(unrelated), unrelated)
  } finally {
    await ctx.fiber.dispose()
    assert.ok(relative(tmpdir(), sandbox).startsWith('dsh-consumer-scope-'))
    await rm(sandbox, { recursive: true, force: true })
  }
})

test('a consumer without required ownership capability cannot authorize operations from roots', async () => {
  const ctx = new Context()
  try {
    const review = new FileReviewService(ctx, { workspace: async () => ({ roots: [process.cwd()] }) })
    await assert.rejects(review.approvedRoots({ id: 'incomplete' }, 'README.md'), /resolveTargetPaths/)
  } finally { await ctx.fiber.dispose() }
})
