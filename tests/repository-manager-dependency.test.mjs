import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { Context } from '@deepseek-ai/cordis'
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { MultiGitRepoManager } from 'dsh-multi-git-repo-manager'
import { MULTI_GIT_REPO_MANAGER_SERVICE_NAME } from 'dsh-multi-git-repo-manager/service-names'
import { FileReviewService, inject } from '../lib/index.js'
import { FILE_REVIEW_INVOCATIONS } from '../src/typert-descriptors.ts'
import { FILE_REVIEW_SERVICE_NAME } from '../src/service-names.ts'

test('review pins the manager release and delegates all workspace ownership to the shared service', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
  assert.equal(pkg.peerDependencies['dsh-multi-git-repo-manager'], '0.1.3')
  assert.notEqual(pkg.peerDependenciesMeta?.['dsh-multi-git-repo-manager']?.optional, true)
  assert.ok(inject.includes('multiGitRepoManagerByWqz'))
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

test('package-owned services coexist with the original fileReview and another repository manager', async () => {
  const ctx = new Context()
  try {
    // Match the original plugin's real Cordis/Typert registration mechanism.
    const originalReview = new TypertRemoteService(ctx, 'fileReview')
    const originalManager = new TypertRemoteService(ctx, 'multiGitRepoManager')
    const manager = new MultiGitRepoManager(ctx)
    const review = new FileReviewService(ctx, manager)

    // Cordis returns contextual proxies, so compare stable identity markers.
    for (const [name, service] of [
      ['fileReview', originalReview],
      ['multiGitRepoManager', originalManager],
      [MULTI_GIT_REPO_MANAGER_SERVICE_NAME, manager],
      [FILE_REVIEW_SERVICE_NAME, review],
    ]) {
      service.registrationMarker = Symbol(name)
      assert.equal(ctx.get(name)?.registrationMarker, service.registrationMarker)
    }
    const agent = { id: 'coexistence', session: { header: { cwd: process.cwd() } } }
    assert.deepEqual(await review.workspace(agent), await manager.workspace(agent))
    for (const descriptor of FILE_REVIEW_INVOCATIONS) {
      assert.equal(descriptor.service, FILE_REVIEW_SERVICE_NAME)
      assert.equal(descriptor.namespace, FILE_REVIEW_SERVICE_NAME)
      assert.ok(descriptor.id.includes(`#${FILE_REVIEW_SERVICE_NAME}/`))
    }
  } finally { await ctx.fiber.dispose() }
})
