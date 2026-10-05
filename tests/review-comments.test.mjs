import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ReviewCommentStore, commentAnchorKey, commentFileKey, fileCommentAnchor, formatReviewComments, lineCommentAnchor, parseReviewComments, reviewDiffRevision } from '../src/client/review-comments.ts'
import { sendReviewComments } from '../src/client/review-comments-send.ts'

const target = { scope: 'last-turn', turn: 3, repository: 'D:/project/core', repositoryName: 'core', path: 'src/index.ts', absolutePath: 'D:/project/core/src/index.ts' }
const lines = [
  { kind: 'context', oldNumber: 8, newNumber: 8, text: 'before' },
  { kind: 'del', oldNumber: 9, newNumber: null, text: 'old call' },
  { kind: 'add', oldNumber: null, newNumber: 9, text: 'new call' },
  { kind: 'context', oldNumber: 10, newNumber: 10, text: 'after' },
]
function storage() {
  const values = new Map()
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value) } }
}
test('deleted and new lines quote their respective sides, with real line numbers and surrounding context', () => {
  const old = lineCommentAnchor(target, lines[1], lines, 'rev')
  const next = lineCommentAnchor(target, lines[2], lines, 'rev')
  assert.equal(old.side, 'old'); assert.equal(old.line, 9); assert.equal(old.quote, 'old call')
  assert.equal(next.side, 'new'); assert.equal(next.line, 9); assert.equal(next.quote, 'new call')
  assert.equal(old.before, 'before'); assert.equal(old.after, 'after')
  assert.equal(next.before, 'before'); assert.equal(next.after, 'after')
})
test('last turn and this session share comments, while turns, Git baselines, repositories and revisions stay distinct', () => {
  const anchor = lineCommentAnchor(target, lines[2], lines, 'rev')
  assert.equal(commentAnchorKey(anchor), commentAnchorKey({ ...anchor, scope: 'session', absolutePath: 'd:\\PROJECT\\core\\src\\index.ts' }))
  for (const different of [{ turn: 4 }, { scope: 'uncommitted' }, { scope: 'unstaged' }, { repository: 'D:/other/core', absolutePath: 'D:/other/core/src/index.ts' }, { revision: 'changed' }, { side: 'old' }]) {
    assert.notEqual(commentAnchorKey(anchor), commentAnchorKey({ ...anchor, ...different }))
  }
  assert.notEqual(commentFileKey({ ...target, scope: 'uncommitted' }), commentFileKey({ ...target, scope: 'unstaged' }))
})
test('snapshot identity changes when hunk contents or source line numbers change', () => {
  const diff = { path: 'file.ts', oldText: 'old', newText: 'new', oldStart: 2, newStart: 3 }
  assert.equal(reviewDiffRevision([diff]), reviewDiffRevision([{ ...diff }]))
  assert.notEqual(reviewDiffRevision([diff]), reviewDiffRevision([{ ...diff, newText: 'later' }]))
  assert.notEqual(reviewDiffRevision([diff]), reviewDiffRevision([{ ...diff, newStart: 4 }]))
})
test('comment drafts survive reopening, support several opinions on one line, edits and removal', () => {
  const disk = storage(); const store = new ReviewCommentStore(disk, 'session-a')
  const anchor = lineCommentAnchor(target, lines[2], lines, 'rev')
  store.save(anchor, 'first'); store.save(anchor, 'second')
  const [first, second] = store.getSnapshot().comments
  assert.equal(store.getSnapshot().comments.length, 2)
  store.save(first.anchor, 'updated', first.id); store.remove(second.id)
  assert.equal(new ReviewCommentStore(disk, 'session-a').getSnapshot().comments[0].text, 'updated')
  assert.equal(new ReviewCommentStore(disk, 'session-b').getSnapshot().comments.length, 0)
  assert.throws(() => parseReviewComments(JSON.stringify({ version: 1, comments: [{ ...first, anchor: { ...anchor, line: null } }] })))
})
test('failed host admission retains drafts; successful submission clears once and prevents double submission', async () => {
  const store = new ReviewCommentStore(storage(), 'draft')
  store.save(fileCommentAnchor(target), 'fix this file')
  await assert.rejects(store.submit(async () => { throw new Error('offline') }), /offline/)
  assert.equal(store.getSnapshot().comments.length, 1); assert.equal(store.getSnapshot().busy, false)
  let resolve; let sent = 0
  const pending = store.submit(async batch => { sent++; assert.equal(batch.length, 1); await new Promise(done => { resolve = done }) })
  assert.equal(store.getSnapshot().busy, true)
  assert.equal(await store.submit(async () => { sent++ }), false)
  store.remove(store.getSnapshot().comments[0].id)
  assert.equal(store.getSnapshot().comments.length, 1)
  resolve(); assert.equal(await pending, true)
  assert.equal(sent, 1); assert.equal(store.getSnapshot().comments.length, 0)
})
test('storage corruption and write failures surface while preserving usable in-memory comments', () => {
  const store = new ReviewCommentStore({ getItem: () => '{broken', setItem: () => { throw new Error('quota') } }, 'draft')
  assert.equal(store.getSnapshot().storageError, true)
  store.save(fileCommentAnchor(target), 'recoverable')
  assert.equal(store.getSnapshot().comments.length, 1); assert.equal(store.getSnapshot().storageError, true)
})
test('batch messages include exact repository/file/source/side/context and safely fence reference code', () => {
  const old = lineCommentAnchor(target, { ...lines[1], text: '```example' }, lines, 'rev')
  const message = formatReviewComments([{ id: 'one', anchor: old, text: 'Handle failure' }, { id: 'two', anchor: fileCommentAnchor({ ...target, scope: 'unstaged' }), text: 'Validate file' }], {
    introduction: 'Read current files first.', repository: 'Repository', file: 'File', source: 'Source', reference: 'Code', opinion: 'Feedback', scope: scope => scope,
    turn: turn => `turn ${turn}`, position: anchor => anchor.side === 'file' ? 'whole file' : `${anchor.side}:${anchor.line}`,
  })
  assert.match(message, /D:\/project\/core\/src\/index.ts/)
  assert.match(message, /last-turn · turn 3 · old:9/)
  assert.match(message, /````text/); assert.match(message, /Handle failure/); assert.match(message, /unstaged/)
})
test('conversation submission resolves the intended session scope without overwriting its composer draft', async () => {
  const calls = []; let draft = 'existing composer text'; let composerWrites = 0
  const input = { for: () => ({ setDraft: text => { composerWrites++; draft = text } }) }
  const ctx = { sessions: { scope: id => ({
    get: name => name === 'conversation' ? { input, send: async text => { calls.push({ id, text }) } } : undefined,
    get conversation() { throw new Error('cannot get property "conversation" without inject') },
  }) } }
  await sendReviewComments(ctx, 'session-a', 'review batch')
  assert.deepEqual(calls, [{ id: 'session-a', text: 'review batch' }]); assert.equal(draft, 'existing composer text'); assert.equal(composerWrites, 0)
  await assert.rejects(sendReviewComments({ sessions: { scope: () => undefined } }, 'missing', 'feedback'), /unavailable/)
})
