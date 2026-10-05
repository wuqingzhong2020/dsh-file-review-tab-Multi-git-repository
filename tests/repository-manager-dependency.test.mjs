import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { Context } from '@deepseek-ai/cordis'
import { MultiGitRepoManager } from 'dsh-multi-git-repo-manager'
import { FileReviewService, inject } from '../lib/index.js'
import { FILE_REVIEW_INVOCATIONS } from '../src/typert-descriptors.ts'

test('review pins the manager release and delegates all workspace ownership to the shared service', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
  assert.equal(pkg.peerDependencies['dsh-multi-git-repo-manager'], '0.1.2')
  assert.notEqual(pkg.peerDependenciesMeta?.['dsh-multi-git-repo-manager']?.optional, true)
  assert.ok(inject.includes('multiGitRepoManager'))
  const ctx = new Context()
  try {
    const manager = new MultiGitRepoManager(ctx)
    const review = new FileReviewService(ctx, manager)
    const agent = { id: 'consumer', session: { header: { cwd: process.cwd() } } }
    assert.deepEqual(await review.workspace(agent), await manager.workspace(agent))
  } finally { await ctx.fiber.dispose() }
  for (const method of ['project', 'saveProject', 'directoryStart', 'setTemporaryRepositories', 'workspace']) {
    assert.ok(!FILE_REVIEW_INVOCATIONS.some(descriptor => descriptor.method === method), method)
  }
})
