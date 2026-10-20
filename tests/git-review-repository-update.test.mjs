import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mergeGitRepositoryReview } from '../src/client/git-review-repository-update.ts'
import { ReviewDiffQueue } from '../src/client/git-review-diff-loader.ts'

test('repository update replaces added and removed files while preserving another repository and metadata', () => {
  const a = { name: 'core', path: 'A' }, b = { name: 'web', path: 'B' }
  const first = { repository: 'A', path: 'old.ts' }, other = { repository: 'B', path: 'same.ts' }
  const current = { repositories: [a, b], files: [first, other],
    comparisons: ['core: old', 'web: original'], warnings: ['global warning', 'core: stale', 'web: unchanged'] }
  const update = { repositories: [{ ...a, branch: 'new' }], files: [{ repository: 'A', path: 'new.ts' }],
    comparisons: ['core: latest'], warnings: [] }
  const merged = mergeGitRepositoryReview(current, 'A', update)
  assert.deepEqual(merged.files.map(file => file.path), ['new.ts', 'same.ts'])
  assert.equal(merged.files[1], other)
  assert.equal(merged.repositories[1], b)
  assert.deepEqual(merged.comparisons, ['web: original', 'core: latest'])
  assert.deepEqual(merged.warnings, ['global warning', 'web: unchanged'])
  assert.deepEqual(current.files, [first, other])
  const empty = mergeGitRepositoryReview(merged, 'A', { ...update, files: [] })
  assert.deepEqual(empty.files, [other])
})

test('failed or incorrectly scoped repository results do not replace the current list', () => {
  const current = { repositories: [], files: [{ repository: 'A', path: 'file' }], comparisons: [], warnings: [] }
  assert.throws(() => mergeGitRepositoryReview(current, 'A', {
    repositories: [], files: [{ repository: 'B', path: 'file' }], comparisons: [], warnings: [],
  }), /another repository/)
  assert.throws(() => mergeGitRepositoryReview(current, 'A', {
    repositories: [], files: [], comparisons: [], warnings: ['core: failed'],
  }), /failed/)
  assert.equal(current.files.length, 1)
})

test('invalidating one cached diff preserves other repositories and late old failures cannot erase its replacement', async () => {
  const queue = new ReviewDiffQueue()
  let rejectOld
  const old = queue.load('A', () => new Promise((_resolve, reject) => { rejectOld = reject }))
  const failed = assert.rejects(old, /old failure/)
  const other = queue.load('B', async () => 'other')
  await new Promise(resolve => setImmediate(resolve))
  queue.invalidate(['A'])
  const latest = queue.load('A', async () => 'latest')
  assert.equal(queue.load('B', () => assert.fail('other repository reloaded')), other)
  rejectOld(new Error('old failure'))
  await failed
  assert.equal(await latest, 'latest')
  assert.equal(queue.load('A', () => assert.fail('replacement cache erased')), latest)
})
