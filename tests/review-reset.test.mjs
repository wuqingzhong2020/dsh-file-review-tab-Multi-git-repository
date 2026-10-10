import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ReviewSessionState, reviewStateKey } from '../src/client/review-session-state.ts'
import { ReviewCommentStore } from '../src/client/review-comments.ts'
import { deriveSessionChanges, deriveSessionRoots, mergeRecordedTurns, lastTurnChanges } from '../src/client/session-changes.ts'
import { captureReviewBoundary, durableReviewSeqs, loadReviewHistory } from '../src/client/review-reset.ts'

function storage() {
  const values = new Map()
  return { values, fail: null, getItem(key) { return values.get(key) ?? null },
    setItem(key, raw) { if (this.fail?.(key, raw)) throw new Error('quota'); values.set(key, raw) },
    removeItem(key) { if (this.fail?.(key, null)) throw new Error('remove failed'); values.delete(key) } }
}
function locks() {
  const seats = new Map()
  return { request(name, options, run) {
    const seat = seats.get(name) ?? { readers: 0, writer: false, queue: [] }
    seats.set(name, seat)
    if (options.ifAvailable && (seat.writer || (options.mode === 'exclusive' && seat.readers) || seat.queue.length))
      return Promise.resolve().then(() => run(null))
    return new Promise((resolve, reject) => {
      const pump = () => {
        if (seat.writer) return
        while (seat.queue.length) {
          const task = seat.queue[0]
          if (task.mode === 'exclusive' && seat.readers) return
          seat.queue.shift()
          if (task.mode === 'exclusive') seat.writer = true
          else seat.readers++
          Promise.resolve().then(() => task.run({})).then(task.resolve, task.reject).finally(() => {
            if (task.mode === 'exclusive') seat.writer = false
            else seat.readers--
            pump()
          })
          if (task.mode === 'exclusive') return
        }
      }
      seat.queue.push({ mode: options.mode, run, resolve, reject })
      pump()
    })
  } }
}
const prefix = 'dsh-file-review-tab-multi-git-repository:'
const anchor = { scope: 'session', turn: 40, repository: 'D:/repo', repositoryName: 'repo',
  path: 'a.ts', absolutePath: 'D:/repo/a.ts', side: 'file', line: null, quote: '', before: '', after: '', revision: '' }
const comment = { id: 'opinion', anchor, text: 'Keep A' }
const comments = JSON.stringify({ version: 1, comments: [comment] })
const emptyComments = '{"version":1,"comments":[]}'
const node = (seq, oldText, newText, callId = 'call-' + seq) => ({
  kind: 'tool-result', seq, callId, isError: false,
  call: { name: 'edit', argsRaw: JSON.stringify({ file_path: 'a.ts', old_string: oldText, new_string: newText }) },
})
test('migration preserves old slices, removes all legacy keys and atomically resets only this session', async () => {
  const db = storage(), mutex = locks(), id = 'atomic'
  db.setItem(prefix + 'comments:' + id, comments)
  db.setItem(prefix + 'discussions:' + id, JSON.stringify({ version: 1, records: [{
    id: 'discussion', requestId: 'request', createdAt: 1, comments: [comment], state: 'answered',
    replies: [{ id: 'reply', seq: 8, text: 'previous reply', interrupted: false }], readSeq: 0, resolved: [],
  }] }))
  db.setItem(prefix + 'confirmations:' + id, '{"version":2,"confirmed":[[40,"r1:0123456789abcdef"]]}')
  db.setItem('dsh-file-review-tab:archive:' + id, '{"open":true,"pages":3}')
  db.setItem(prefix + 'diff-view', 'global preferences')
  db.setItem(prefix + 'comments:another', comments)
  const state = new ReviewSessionState(id, db, mutex)
  await state.initialize()
  assert.equal(state.getSnapshot().ready, true)
  assert.equal(JSON.parse(state.getSnapshot().slices.archive).pages, 3)
  const store = new ReviewCommentStore(state.sliceStorage('comments'))
  await state.reset('initial', () => 200)
  assert.equal(store.getSnapshot().comments.length, 0)
  const saved = JSON.parse(db.getItem(reviewStateKey(id)))
  assert.equal(saved.reset.boundarySeq, 200)
  assert.equal(saved.reset.baseHostTurn, null)
  assert.notEqual(saved.generation, 'initial')
  assert.equal(saved.slices.comments, emptyComments)
  assert.equal(JSON.parse(saved.slices.discussions).records.length, 0)
  assert.deepEqual(JSON.parse(saved.slices.confirmations).confirmed, [])
  assert.deepEqual(JSON.parse(saved.slices.archive), { open: false, pages: 1 })
  assert.equal(db.getItem(prefix + 'diff-view'), 'global preferences')
  assert.equal(db.getItem(prefix + 'comments:another'), comments)
  assert.ok(![...db.values.values()].filter(value => value !== comments).some(value => value.includes('previous reply')))
  assert.equal(db.getItem('dsh-file-review-tab:archive:' + id), null)
})
test('failed atomic reset preserves the old authoritative payload and live draft store', async () => {
  const db = storage(), state = new ReviewSessionState('failure', db, locks())
  db.setItem(prefix + 'comments:failure', comments)
  // Reconstruct after writing legacy data.
  const loaded = new ReviewSessionState('failure', db, locks())
  await loaded.initialize()
  const store = new ReviewCommentStore(loaded.sliceStorage('comments'))
  const before = db.getItem(loaded.key)
  db.fail = (key, raw) => key === loaded.key && raw && JSON.parse(raw).reset !== null
  await assert.rejects(loaded.reset('initial', () => 100), /quota/)
  assert.equal(db.getItem(loaded.key), before)
  assert.equal(loaded.getSnapshot().generation, 'initial')
  assert.equal(store.getSnapshot().comments.length, 1)
  assert.equal(state.getSnapshot().generation, 'initial')
})
test('migration failures retain user data and cannot enable reset', async () => {
  const db = storage()
  db.setItem(prefix + 'comments:migration', comments)
  db.fail = (_key, value) => value === null
  const state = new ReviewSessionState('migration', db, locks())
  await state.initialize()
  assert.equal(state.canReset(), false)
  assert.equal(JSON.parse(db.getItem(state.key)).slices.comments, comments)
  assert.equal(db.getItem(prefix + 'comments:migration'), comments)
  await assert.rejects(state.reset('initial', () => 1), /remove failed/)
})
test('concurrent windows merge independent slices and an old queued writer cannot revive reset data', async () => {
  const db = storage(), mutex = locks()
  const a = new ReviewSessionState('windows', db, mutex), b = new ReviewSessionState('windows', db, mutex)
  await Promise.all([a.initialize(), b.initialize()])
  a.sliceStorage('comments').setItem('', comments)
  b.sliceStorage('confirmations').setItem('', '{"version":2,"confirmed":[[40,"r1:0123456789abcdef"]]}')
  await Promise.all([a.flush(), b.flush()])
  const saved = JSON.parse(db.getItem(a.key))
  assert.equal(JSON.parse(saved.slices.comments).comments.length, 1)
  assert.equal(JSON.parse(saved.slices.confirmations).confirmed.length, 1)
  await b.reset('initial', () => 200)
  a.sliceStorage('comments').setItem('', JSON.stringify({ version: 1, comments: [{ ...comment, text: 'stale' }] }))
  await a.flush()
  assert.equal(JSON.parse(db.getItem(a.key)).slices.comments, emptyComments)
  assert.equal(a.getSnapshot().generation, b.getSnapshot().generation)
})
test('shared operation permission blocks reset in another window and stale operations cannot start', async () => {
  const db = storage(), mutex = locks()
  const a = new ReviewSessionState('activity', db, mutex), b = new ReviewSessionState('activity', db, mutex)
  await Promise.all([a.initialize(), b.initialize()])
  const release = await a.acquireActivity()
  await assert.rejects(b.reset('initial', () => 100), /still running/)
  release()
  await b.reset('initial', () => 100)
  await assert.rejects(a.runActivity('initial', async () => assert.fail('old operation started')), /reset/)
})
test('without shared locks reset is unavailable while ordinary drafts remain usable', async () => {
  const db = storage(), state = new ReviewSessionState('no-locks', db)
  await state.initialize()
  state.sliceStorage('comments').setItem('', comments)
  await state.flush()
  assert.equal(state.canReset(), false)
  assert.equal(JSON.parse(db.getItem(state.key)).slices.comments, comments)
  await assert.rejects(state.reset('initial', () => 0), /locks/)
})
test('cutoff precedes aggregation, keeps actual A to B undo baseline and filters old recorded roots', () => {
  const snapshot = { nodes: [node(10, '', 'A', 'created'), node(50, 'A', 'B', 'edited')],
    turnEnds: new Map([[40, 20], [41, 60]]), partial: null, runningCalls: [] }
  const old = deriveSessionChanges(snapshot)
  assert.equal(old.length, 2)
  const reset = { boundarySeq: 20 }
  const turns = deriveSessionChanges(snapshot, reset, 'fresh')
  assert.equal(turns.length, 1)
  assert.equal(turns[0].turn, 41)
  assert.equal(turns[0].files[0].diffs[0].oldText, 'A')
  assert.equal(turns[0].files[0].diffs[0].newText, 'B')
  assert.equal(lastTurnChanges(snapshot, turns)[0].turn, 41)
  const roots = deriveSessionRoots(snapshot, reset)
  assert.deepEqual(roots.map(root => root.rootCallId), ['edited'])
  const merged = mergeRecordedTurns(turns, roots, [{ rootCallId: 'created', path: 'a.ts', before: null, after: 'A' }])
  assert.equal(merged, turns)
  assert.equal(deriveSessionChanges(snapshot, reset, 'fresh'), turns)
  assert.deepEqual(deriveSessionChanges(snapshot, { boundarySeq: 50 }, 'again'), [])
})
test('first turn base is persisted once and survives reload and repeated reset', async () => {
  const db = storage(), mutex = locks(), state = new ReviewSessionState('numbering', db, mutex)
  await state.initialize()
  await state.reset('initial', () => 200)
  const generation = state.getSnapshot().generation
  await state.establishBase(generation, 43)
  await state.establishBase(generation, 44)
  assert.equal(JSON.parse(db.getItem(state.key)).reset.baseHostTurn, 43)
  const reopened = new ReviewSessionState('numbering', db, mutex)
  await reopened.initialize()
  assert.equal(reopened.getSnapshot().reset.baseHostTurn, 43)
  await reopened.reset(generation, () => 300)
  assert.equal(reopened.getSnapshot().reset.baseHostTurn, null)
})
test('durable cursor ignores transient frames and rejects malformed durable identities', () => {
  assert.deepEqual(durableReviewSeqs([{ type: 'event', event: { seq: 20 } }, { type: 'transient', event: { seq: 21.8 } }]), [20])
  assert.throws(() => durableReviewSeqs([{ type: 'event', event: { seq: 2.5 } }]))
})
test('idle capture uses authoritative Inbox, reads latest events and changes no host state', () => {
  const window = { entries: [{ type: 'event', event: { seq: 60 } }], hasMore: false }
  let inbox = { 'next-turn': [], 'next-step': [] }
  const state = { removed: false, loadingOlder: false, openError: null, openState: 'open', blank: false,
    running: false, awaitingFirstTurn: false, pendingSubmissions: [] }
  const binding = { session: { getSnapshot: () => state, projections: { faceOf: key => {
    assert.equal(key, 'inbox'); return { getSnapshot: () => inbox }
  } } }, eventSource: { getSnapshot: () => window } }
  const sessions = { binding: () => binding }
  const ctx = { get: () => ({ binding: () => ({ snapshot: { getSnapshot: () => ({
    nodes: [], turnEnds: new Map(), partial: null, runningCalls: [],
  }) } }) }) }
  assert.equal(captureReviewBoundary(ctx, sessions, 'id'), 60)
  inbox = { 'next-turn': [{}], 'next-step': [] }
  assert.throws(() => captureReviewBoundary(ctx, sessions, 'id'))
  inbox = undefined
  assert.throws(() => captureReviewBoundary(ctx, sessions, 'id'))
})
test('history coverage loads through the reset boundary instead of numbering a late visible window', async () => {
  let window = { entries: [{ type: 'event', event: { seq: 200 } }], hasMore: true }
  const state = { loadingOlder: false, openError: null, openState: 'open' }
  const binding = { eventSource: { getSnapshot: () => window }, session: {
    getSnapshot: () => state, loadThrough: async seq => {
      assert.equal(seq, 100)
      window = { entries: [{ type: 'event', event: { seq: 100 } }, ...window.entries], hasMore: true }
    },
  } }
  await loadReviewHistory(binding, 100)
  binding.session.loadThrough = async () => {}
  window = { entries: [{ type: 'event', event: { seq: 300 } }], hasMore: true }
  await assert.rejects(loadReviewHistory(binding, 100))
})

test('failed ordinary saves retry every unsaved opinion before reset can proceed', async () => {
  const db = storage(), state = new ReviewSessionState('retry-save', db, locks())
  await state.initialize()
  db.fail = (key, raw) => key === state.key && raw !== null
  state.sliceStorage('comments').setItem('', comments)
  await state.flush()
  assert.equal(state.canReset(), false)
  assert.equal(state.getSnapshot().slices.comments, comments)
  db.fail = null
  state.sliceStorage('comments').setItem('', JSON.stringify({ version: 1,
    comments: [comment, { ...comment, id: 'second', text: 'Keep B' }] }))
  await state.flush()
  assert.deepEqual(JSON.parse(JSON.parse(db.getItem(state.key)).slices.comments).comments.map(item => item.id), ['opinion', 'second'])
  assert.equal(state.canReset(), true)
})

test('two windows changing different fields of one opinion preserve both changes', async () => {
  const db = storage(), mutex = locks()
  db.setItem(prefix + 'comments:fields', comments)
  const a = new ReviewSessionState('fields', db, mutex)
  await a.initialize()
  const b = new ReviewSessionState('fields', db, mutex)
  await b.initialize()
  a.sliceStorage('comments').setItem('', JSON.stringify({ version: 1, comments: [{ ...comment, text: 'new opinion' }] }))
  b.sliceStorage('comments').setItem('', JSON.stringify({ version: 1, comments: [{ ...comment, discussionId: 'follow-up' }] }))
  await Promise.all([a.flush(), b.flush()])
  const result = JSON.parse(JSON.parse(db.getItem(a.key)).slices.comments).comments[0]
  assert.equal(result.text, 'new opinion')
  assert.equal(result.discussionId, 'follow-up')
})

test('corrupt legacy records disable reset without replacing or removing the source', async () => {
  const db = storage(), key = prefix + 'comments:corrupt'
  db.setItem(key, '{invalid')
  const state = new ReviewSessionState('corrupt', db, locks())
  await state.initialize()
  assert.equal(state.getSnapshot().invalid, true)
  assert.equal(state.canReset(), false)
  assert.equal(db.getItem(state.key), null)
  assert.equal(db.getItem(key), '{invalid')
  await assert.rejects(state.reset('initial', () => 0))
})

test('a genuine empty cold session covers the zero reset boundary without loading nonexistent history', async () => {
  const binding = { eventSource: { getSnapshot: () => ({ entries: [], hasMore: false }) },
    session: { getSnapshot: () => ({ blank: true, openState: 'cold', loadingOlder: false, openError: null }),
      loadThrough: () => assert.fail('empty history was loaded') } }
  await loadReviewHistory(binding, 0)
})

test('failed base writes do not publish a fabricated display origin', async () => {
  const db = storage(), state = new ReviewSessionState('base-failure', db, locks())
  await state.initialize()
  await state.reset('initial', () => 5)
  const generation = state.getSnapshot().generation
  db.fail = (key, raw) => key === state.key && raw && JSON.parse(raw).reset.baseHostTurn !== null
  await assert.rejects(state.establishBase(generation, 3), /quota/)
  assert.equal(state.getSnapshot().reset.baseHostTurn, null)
  db.fail = null
  await state.establishBase(generation, 3)
  assert.equal(state.getSnapshot().reset.baseHostTurn, 3)
})
