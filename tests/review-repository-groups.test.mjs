import { test } from 'node:test'
import assert from 'node:assert/strict'
import { allFileContentsExpanded, repositoryGroupId, setFileContentsExpanded, setRepositoryGroupsCollapsed } from '../src/client/review-repository-groups.ts'
import { loadMissingReviewDiffs } from '../src/client/git-review-diff-loader.ts'

test('one repository command leaves other repositories, turns and sessions unchanged', () => {
  const root = repositoryGroupId('session-a', 3, 'D:/workspace')
  const child = repositoryGroupId('session-a', 3, 'D:/workspace/core')
  const otherTurn = repositoryGroupId('session-a', 2, 'D:/workspace')
  const otherSession = repositoryGroupId('session-b', 3, 'D:/workspace')
  const initial = new Set([child, otherTurn, otherSession])
  const collapsed = setRepositoryGroupsCollapsed(initial, [root], true)
  assert.deepEqual([...initial], [child, otherTurn, otherSession])
  assert.deepEqual([...collapsed], [child, otherTurn, otherSession, root])
  assert.deepEqual([...setRepositoryGroupsCollapsed(collapsed, [root], false)], [...initial])
})

test('a round command expands mixed file contents and collapses only its own files', () => {
  const visible = ['5|root/a.ts', '5|root/b.ts', '5|core/a.ts']
  const hidden = '5|filtered/a.ts'
  const previousTurn = '4|root/a.ts'
  const mixed = new Set([visible[0], hidden, previousTurn])
  assert.equal(allFileContentsExpanded(mixed, visible), false)
  const expanded = setFileContentsExpanded(mixed, visible, true)
  assert.equal(allFileContentsExpanded(expanded, visible), true)
  assert.deepEqual([...mixed], [visible[0], hidden, previousTurn])
  const collapsed = setFileContentsExpanded(expanded, visible, false)
  assert.equal(allFileContentsExpanded(collapsed, visible), false)
  assert.deepEqual([...collapsed], [hidden, previousTurn])
  assert.equal(allFileContentsExpanded(collapsed, []), false)
  assert.deepEqual([...setFileContentsExpanded(collapsed, [], true)], [...collapsed])
})

test('repository content expansion leaves other repositories and list visibility independent', () => {
  const firstRepository = ['root/a.ts', 'root/b.ts']
  const secondRepository = ['core/a.ts', 'core/b.ts']
  const collapsedLists = new Set(['core'])
  const open = setFileContentsExpanded(new Set([secondRepository[0]]), firstRepository, true)
  assert.equal(allFileContentsExpanded(open, firstRepository), true)
  assert.equal(allFileContentsExpanded(open, secondRepository), false)
  assert.equal(open.has(secondRepository[0]), true)
  assert.equal(open.has(secondRepository[1]), false)
  assert.deepEqual([...collapsedLists], ['core'])
  assert.deepEqual([...setFileContentsExpanded(open, firstRepository, false)], [secondRepository[0]])
})

test('bulk Git expansion fetches each queued file once and limits concurrent requests', async () => {
  const files = Array.from({ length: 17 }, (_, index) => 'file-' + index)
  const requested = new Set(['file-0'])
  const calls = []
  let active = 0
  let peak = 0
  const pending = loadMissingReviewDiffs([...files, ...files], file => file, requested, async file => {
    calls.push(file); active++; peak = Math.max(peak, active)
    await new Promise(resolve => setImmediate(resolve))
    active--
  })
  assert.equal(requested.size, files.length)
  await loadMissingReviewDiffs(files, file => file, requested, async () => { throw new Error('A queued diff must not be fetched again') })
  await pending
  assert.equal(calls.length, files.length - 1)
  assert.equal(new Set(calls).size, calls.length)
  assert.equal(peak, 4)
})

test('obsolete Git queues skip remaining files and the next comparison can reload them', async () => {
  const files = ['a', 'b', 'c', 'd', 'e', 'f']
  const calls = []
  let current = true
  await loadMissingReviewDiffs(files, file => file, new Set(), async file => {
    if (!current) return
    calls.push(file)
    current = false
  })
  assert.deepEqual(calls, ['a'])
  const next = []
  await loadMissingReviewDiffs(files, file => file, new Set(), async file => { next.push(file) })
  assert.equal(new Set(next).size, files.length)
})

test('group identity separates round and Git scope without delimiter collisions', () => {
  const keys = [
    repositoryGroupId('session', 3, 'D:/root'),
    repositoryGroupId('session', '3', 'D:/root'),
    repositoryGroupId('session', 'unstaged', 'D:/root'),
    repositoryGroupId('session', 'uncommitted', 'D:/root'),
    repositoryGroupId('a:b', 'c', 'D:/root'),
    repositoryGroupId('a', 'b:c', 'D:/root'),
  ]
  assert.equal(new Set(keys).size, keys.length)
  assert.deepEqual(JSON.parse(keys[0]), ['session', 3, 'D:/root'])
})
