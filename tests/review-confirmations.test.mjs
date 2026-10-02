import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ReviewConfirmationStore, isTurnConfirmed, pendingTurnChanges, turnConfirmationRevision } from '../src/client/review-confirmations.ts'
import { ReviewCommentStore, commentAnchorKey, fileCommentAnchor, parseReviewComments } from '../src/client/review-comments.ts'

function storage() {
  const values = new Map()
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value) } }
}
function turn(number, paths = ['core/index.ts']) {
  return { turn: number, live: false, files: paths.map(path => ({ path, diffs: [{ path, oldStart: 1, newStart: 1, oldText: `before ${number}`, newText: `after ${number}` }] })) }
}

test('confirming the first three of five turns leaves exactly the last two, without modifying their undo hunks', () => {
  const store = new ReviewConfirmationStore(storage(), 'session-a')
  const turns = [1, 2, 3, 4, 5].map(number => turn(number))
  for (const item of turns.slice(0, 3)) assert.equal(store.setConfirmed(item, true), true)
  const pending = pendingTurnChanges(turns, store.getSnapshot().confirmed)
  assert.deepEqual(pending.map(item => item.turn), [4, 5])
  assert.equal(pending[0], turns[3]); assert.equal(pending[1].files[0].diffs, turns[4].files[0].diffs)
  assert.equal(turns.length, 5)
  store.setConfirmed(turns[1], false)
  assert.deepEqual(pendingTurnChanges(turns, store.getSnapshot().confirmed).map(item => item.turn), [2, 4, 5])
})

test('decisions survive reopening and remain isolated by session', () => {
  const disk = storage(); const first = turn(1)
  const store = new ReviewConfirmationStore(disk, 'session-a')
  store.setConfirmed(first, true)
  assert.equal(isTurnConfirmed(first, new ReviewConfirmationStore(disk, 'session-a').getSnapshot().confirmed), true)
  assert.equal(isTurnConfirmed(first, new ReviewConfirmationStore(disk, 'session-b').getSnapshot().confirmed), false)
  const reopened = new ReviewConfirmationStore(disk, 'session-a')
  reopened.setConfirmed(first, false)
  assert.equal(isTurnConfirmed(first, new ReviewConfirmationStore(disk, 'session-a').getSnapshot().confirmed), false)
})

test('new edits and late recorder results reopen the same confirmed turn; reordered files do not', () => {
  const store = new ReviewConfirmationStore(storage(), 'session-a')
  const first = turn(1, ['core/index.ts', 'editor/index.ts'])
  store.setConfirmed(first, true)
  const confirmed = store.getSnapshot().confirmed
  assert.equal(isTurnConfirmed({ ...first, files: [...first.files].reverse() }, confirmed), true)
  for (const next of [
    turn(1, ['core/index.ts', 'editor/index.ts', 'new.ts']),
    { ...first, files: [{ ...first.files[0], deleted: true }, first.files[1]] },
    { ...first, files: [{ ...first.files[0], diffs: [{ ...first.files[0].diffs[0], newText: 'later result' }] }, first.files[1]] },
    { ...first, files: [{ ...first.files[0], diffs: [{ ...first.files[0].diffs[0], oldStart: 20 }] }, first.files[1]] },
  ]) assert.equal(isTurnConfirmed(next, confirmed), false)
  assert.equal(isTurnConfirmed(turn(2, ['core/index.ts', 'editor/index.ts']), confirmed), false)
})

test('running and empty turns cannot be confirmed; previously stored decisions cannot hide running edits', () => {
  const store = new ReviewConfirmationStore(storage(), 'session-a'); const first = turn(1)
  assert.equal(store.setConfirmed({ ...first, live: true }, true), false)
  assert.equal(store.setConfirmed(turn(2, []), true), false)
  store.setConfirmed(first, true)
  const running = { ...first, live: true }
  assert.deepEqual(pendingTurnChanges([running], store.getSnapshot().confirmed), [running])
})

test('confirmation applies to the complete round across repositories rather than a filtered fragment', () => {
  const store = new ReviewConfirmationStore(storage(), 'session-a')
  const full = turn(1, ['core/index.ts', 'editor/index.ts'])
  const fragment = { ...full, files: [full.files[0]] }
  store.setConfirmed(fragment, true)
  assert.deepEqual(pendingTurnChanges([full], store.getSnapshot().confirmed), [full])
  store.setConfirmed(full, true)
  assert.deepEqual(pendingTurnChanges([full], store.getSnapshot().confirmed), [])
  assert.notEqual(turnConfirmationRevision(full), turnConfirmationRevision(fragment))
})

test('corrupt or unavailable storage cannot silently hide rounds; decisions remain usable in memory', () => {
  const first = turn(1)
  for (const raw of ['{broken', '{"version":2,"confirmed":[]}', JSON.stringify({ version: 1, confirmed: [[1, 'bogus']] }), JSON.stringify({ version: 1, confirmed: [[1, turnConfirmationRevision(first)], [1, turnConfirmationRevision(first)]] })]) {
    const store = new ReviewConfirmationStore({ getItem: () => raw, setItem: () => { throw new Error('quota') } }, 'session-a')
    assert.equal(store.getSnapshot().storageError, true)
    assert.deepEqual(pendingTurnChanges([first], store.getSnapshot().confirmed), [first])
    store.setConfirmed(first, true)
    assert.equal(isTurnConfirmed(first, store.getSnapshot().confirmed), true)
    assert.equal(store.getSnapshot().storageError, true)
  }
})

test('confirmation and cancellation notify all open review panes in the session', () => {
  const store = new ReviewConfirmationStore(storage(), 'session-a'); const first = turn(1)
  const events = []; const stop = store.subscribe(() => events.push(isTurnConfirmed(first, store.getSnapshot().confirmed)))
  store.setConfirmed(first, true); store.setConfirmed(first, false); stop(); store.setConfirmed(first, true)
  assert.deepEqual(events, [true, false])
})

test('pending review shares comment anchors with session ranges and confirming a turn preserves comment drafts', () => {
  const disk = storage(); const first = turn(1)
  const target = { scope: 'pending', turn: 1, repository: 'D:/project/core', repositoryName: 'core', path: 'index.ts', absolutePath: 'D:/project/core/index.ts' }
  const anchor = fileCommentAnchor(target)
  assert.equal(commentAnchorKey(anchor), commentAnchorKey({ ...anchor, scope: 'last-turn' }))
  assert.equal(commentAnchorKey(anchor), commentAnchorKey({ ...anchor, scope: 'session' }))
  const comments = new ReviewCommentStore(disk, 'comments:a')
  comments.save(anchor, 'Handle the error')
  const decisions = new ReviewConfirmationStore(disk, 'confirmations:a')
  decisions.setConfirmed(first, true)
  const restored = new ReviewCommentStore(disk, 'comments:a')
  assert.equal(restored.getSnapshot().comments[0].anchor.scope, 'pending')
  assert.equal(restored.getSnapshot().comments[0].text, 'Handle the error')
  assert.throws(() => parseReviewComments(JSON.stringify({ version: 1, comments: [{ ...restored.getSnapshot().comments[0], anchor: { ...anchor, turn: undefined } }] })))
})
