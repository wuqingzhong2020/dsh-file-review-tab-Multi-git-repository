import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { serializeReviewPacket, parseReviewPacket, REVIEW_PACKET_PACKAGE } from '../src/client/review-comment-packet.ts'
import { aggregateDiffText } from '../src/client/aggregate-diff.ts'
import { ReviewDiffQueue, loadMissingReviewDiffs } from '../src/client/git-review-diff-loader.ts'
import { loadGitReviewReport } from '../src/client/git-review-report.ts'
import { ReviewInputBatches, reviewBatchReference } from '../src/client/review-input-batches.ts'
import { effectiveDiffLayout } from '../src/client/use-effective-layout.ts'
import { DiffViewStore, DIFF_VIEW_STORAGE_KEY, DEFAULT_DIFF_VIEW } from '../src/client/diff-view-preferences.ts'
import { bindProfileReviewPreferences, saveReviewPreferences } from '../src/client/profile-review-preferences.ts'
import { attachReviewInput, reviewInputSource, disposeReviewInput, registerReviewInputTracking, clearReviewInput } from '../src/client/review-input.ts'
import { commentStoreFor, discussionStoreFor } from '../src/client/review-comment-context.ts'
import { deriveSessionRoots, mergeRecordedTurns } from '../src/client/session-changes.ts'

const anchor = { scope: 'unstaged', repository: 'D:/core', repositoryName: 'core', path: 'a.ts', absolutePath: 'D:/core/a.ts', side: 'new', line: 2, endLine: 3, revision: 'revision', sourceKey: 'hunk', quote: '<tag>\nsecond', before: 'before', after: 'after' }
const comment = { id: 'opinion', anchor, text: 'Escape </dsh_review> and handle this' }
const packet = () => ({ package: REVIEW_PACKET_PACKAGE, version: 1, sessionId: 'session', batchId: randomUUID(), comments: [comment], context: 'The immutable review context' })
const memory = raw => ({ getItem: () => raw ?? null, setItem: (_key, value) => { raw = value } })
const observable = initial => {
  let value = initial; const listeners = new Set()
  return { getSnapshot: () => value, subscribe: fn => { listeners.add(fn); return () => listeners.delete(fn) }, set(next) { value = next; for (const fn of [...listeners]) fn() }, get count() { return listeners.size } }
}

test('only complete plugin envelopes project; user prose, references, malformed packets and legacy XML remain untouched', () => {
  const frozen = packet(), text = serializeReviewPacket(frozen)
  assert.ok(!text.includes('Escape </dsh_review>'))
  const projection = parseReviewPacket(text + '\n\nPlease fix these. @other')
  assert.deepEqual(projection.packet, frozen)
  assert.equal(projection.visibleText, 'Please fix these. @other')
  for (const invalid of ['ordinary message', '<file_review_comments>old</file_review_comments>', '```\n' + text + '\n```', text.replace('version="1"', 'version="2"'), text.replace('"version":1', '"version":2'), text.slice(0, -4), text.replace('"line":2', '"line":0')]) assert.equal(parseReviewPacket(invalid), null)
  assert.throws(() => serializeReviewPacket({ ...frozen, context: 'x'.repeat(512 * 1024) }), /512 KiB/)
})

test('adaptive layout preserves preferences at zero, narrow and wide widths', () => {
  assert.equal(effectiveDiffLayout('split', 0, true), 'split')
  assert.equal(effectiveDiffLayout('split', 479, true), 'unified')
  assert.equal(effectiveDiffLayout('split', 480, true), 'split')
  assert.equal(effectiveDiffLayout('split', 300, false), 'split')
  assert.equal(effectiveDiffLayout('unified', 1000, true), 'unified')
})

test('aggregate copy separates repositories/baselines, labels fragments and never hides missing/binary files', () => {
  const diff = { path: 'same.ts', oldText: 'old', newText: 'new', oldStart: 1, newStart: 1 }
  const text = aggregateDiffText([
    { repository: 'a', path: 'same.ts', source: 'turn 1', diffs: [diff, diff] },
    { repository: 'b', path: 'same.ts', source: 'HEAD -> index', diffs: [], note: 'Binary' },
  ])
  assert.match(text, /not a single applicable patch/); assert.match(text, /Operation 2/)
  assert.match(text, /Repository: "a"/); assert.match(text, /Repository: "b"/); assert.match(text, /Note: Binary/)
  assert.throws(() => aggregateDiffText(Array.from({ length: 257 }, () => ({ repository: '', path: '', source: '', diffs: [] }))), /256-file/)
  assert.throws(() => aggregateDiffText([{ repository: '', path: '', source: '', diffs: [], note: 'x'.repeat(2 * 1024 * 1024) }]), /2 MiB/)
})

test('copy and expansion share one deduplicated four-request queue', async () => {
  const queue = new ReviewDiffQueue(); let active = 0, peak = 0, calls = 0
  const requests = Array.from({ length: 20 }, (_, index) => queue.load(String(index % 10), async () => {
    calls++; active++; peak = Math.max(peak, active)
    await new Promise(resolve => setTimeout(resolve, 3)); active--; return index
  }))
  assert.deepEqual(await Promise.all(requests), [...Array(10).keys(), ...Array(10).keys()])
  assert.equal(calls, 10); assert.equal(peak, 4)
})

test('an aborted queued fetch can be retried and does not poison expansion', async () => {
  const queue = new ReviewDiffQueue()
  await assert.rejects(queue.load('same', async () => { throw new Error('cancelled') }), /cancelled/)
  assert.equal(await queue.load('same', async () => 'retried'), 'retried')
})

test('trusted merging replaces the matching call without hiding uncaptured same-path edits', () => {
  const original = { path: 'a.ts', oldText: 'first', newText: 'second', sourceCallId: 'legacy' }
  const captured = { path: 'a.ts', oldText: 'second', newText: 'third', sourceCallId: 'captured' }
  const merged = mergeRecordedTurns([{ turn: 1, live: false, files: [{ path: 'a.ts', diffs: [original, captured] }] }], [{ rootCallId: 'captured', turn: 1, live: false }], [{ rootCallId: 'captured', subCallId: 'captured', path: 'a.ts', name: 'edit', before: 'second', after: 'third', recordId: randomUUID(), complete: true }])
  assert.equal(merged[0].files[0].diffs.length, 2)
  assert.deepEqual(merged[0].files[0].diffs[0], original)
  assert.ok(merged[0].files[0].diffs[1].recordId)
})

test('failed program roots still fetch independently accepted nested records', () => {
  const roots = deriveSessionRoots({ nodes: [{ kind: 'tool-result', callId: 'failed-program', seq: 1, isError: true }], turnEnds: new Map([[1, 2]]), partial: null, runningCalls: [] })
  assert.deepEqual(roots, [{ rootCallId: 'failed-program', turn: 1, live: false }])
})

function profileFixture({ writable = true, user, base, fail = false } = {}) {
  const local = new DiffViewStore(memory(JSON.stringify({ ...DEFAULT_DIFF_VIEW, layout: 'split', wrap: false, editorPath: 'D:/machine/Code.exe' })))
  const initial = { status: 'ready', value: { reviewSettings: { layout: 'unified', wrap: true, dock: true, adaptive: true, foldMessages: true } }, user, base, writable, revision: 7 }
  const form = observable(initial), writes = []
  form.mutate = async (ops, revision) => {
    writes.push({ ops, revision }); if (fail) return false
    const next = structuredClone(form.getSnapshot()); next.user ??= {}; next.user.reviewSettings ??= {}
    for (const op of ops) { next.user.reviewSettings[op.path[1]] = op.value; next.value.reviewSettings[op.path[1]] = op.value }
    next.revision++; form.set(next); return true
  }
  const mirror = observable({ view: { namespaces: [{ ns: 'custom-row-id', value: { reviewSettingsOwner: REVIEW_PACKET_PACKAGE } }] } })
  mirror.ensure = async () => {}
  const ctx = { configForms: { describe: () => mirror, get: id => { assert.equal(id, 'custom-row-id'); return form } } }
  return { local, writes, form, ctx, mirror }
}

test('Profile migration writes only portable fields and keeps explicit Profile values, both entries and cleanup in sync', async () => {
  const f = profileFixture({ user: { reviewSettings: { wrap: true } } })
  const dispose = bindProfileReviewPreferences(f.ctx, f.local)
  await new Promise(resolve => setTimeout(resolve, 0))
  assert.equal(f.local.getSnapshot().layout, 'split'); assert.equal(f.local.getSnapshot().wrap, true)
  assert.ok(f.writes[0].ops.every(op => !['editorPath', 'fontFamily'].includes(op.path[1])))
  assert.equal(await saveReviewPreferences(f.local, { layout: 'unified', fontSize: 15 }), true)
  assert.equal(f.form.getSnapshot().value.reviewSettings.layout, 'unified')
  assert.equal(f.local.getSnapshot().fontSize, 15); assert.equal(f.local.getSnapshot().editorPath, 'D:/machine/Code.exe')
  dispose(); assert.equal(f.mirror.count, 0); assert.equal(f.form.count, 0)
})

test('read-only/refused migration keeps old local values; explicit composition values win', async () => {
  for (const options of [{ writable: false }, { fail: true }]) {
    const f = profileFixture(options), dispose = bindProfileReviewPreferences(f.ctx, f.local)
    await new Promise(resolve => setTimeout(resolve, 0))
    assert.equal(f.local.getSnapshot().layout, 'split'); dispose()
  }
  const f = profileFixture({ base: { reviewSettings: { layout: 'unified', wrap: true, dock: true, adaptive: true, foldMessages: true } } })
  const dispose = bindProfileReviewPreferences(f.ctx, f.local)
  assert.equal(f.writes.length, 0); assert.equal(f.local.getSnapshot().layout, 'unified'); dispose()
  assert.ok(DIFF_VIEW_STORAGE_KEY.includes(REVIEW_PACKET_PACKAGE))
})

test('frozen main-input batch uses the shared lock, observes real request identity, preserves later edits and survives Dock unmount', async () => {
  const id = randomUUID(), store = commentStoreFor(id), history = discussionStoreFor(id)
  store.save(anchor, 'first opinion')
  const inputState = observable({ draft: 'Please handle this @file', draftRev: 1, phase: 'plain', occurrences: [], attachmentIds: ['image'] })
  const input = { state: inputState }
  const events = observable({ entries: [] }), session = observable({ pendingSubmissions: [] })
  const scope = { bail: (_scope, name, request) => {
    assert.equal(name, 'slash/input-insert-reference')
    inputState.set({ ...inputState.getSnapshot(), draftRev: 2, occurrences: [{ ...request.reference, offset: 0, length: request.reference.clipboardText.length }] }); return true
  } }
  const binding = { ctx: scope, eventSource: events }
  const list = observable({ byId: {} })
  const sessions = { binding: key => key === id ? binding : undefined, scope: () => scope, sessionOf: () => session, list }
  const ctx = { get: name => name === 'inputTriggers' ? {} : undefined, conversation: { input: { for: () => input } } }
  const actions = { captureInsertion: () => ({ start: 7, end: 7, draftRev: 1 }), insertText: (_text, span) => { assert.equal(span.start, 9); return true } }
  const dispose = registerReviewInputTracking(sessions)
  assert.equal(attachReviewInput(ctx, sessions, id, actions), true)
  const ref = inputState.getSnapshot().occurrences[0].ref
  const batch = store.getSnapshot().comments
  store.save(anchor, 'edited after attachment', batch[0].id)
  const codec = reviewInputSource().codec
  const text = await codec.serialize(ref, new AbortController().signal)
  assert.equal(parseReviewPacket(text).packet.comments[0].text, 'first opinion')
  assert.equal(await store.submit(async () => assert.fail('duplicate send')), false)
  await assert.rejects(codec.serialize(ref, new AbortController().signal), /expired/)
  assert.equal(inputState.getSnapshot().draft, 'Please handle this @file')
  assert.deepEqual(inputState.getSnapshot().attachmentIds, ['image'])
  session.set({ pendingSubmissions: [{ requestId: 'real-request', text }] })
  assert.equal(history.getSnapshot().records[0].requestId, 'real-request')
  events.set({ entries: [{ event: { type: 'user/message', seq: 4, data: { source: { kind: 'user', rpcId: 'real-request' }, content: [{ type: 'text', text }] } } }] })
  assert.equal(store.getSnapshot().busy, false)
  assert.equal(store.getSnapshot().comments[0].text, 'edited after attachment')
  dispose(); disposeReviewInput(); assert.equal(events.count, 0); assert.equal(session.count, 0)
  store.clear()
})

test('clearing opinions removes only the plugin reference through the guarded input action', () => {
  const id = randomUUID(), store = commentStoreFor(id); store.save(anchor, 'opinion')
  const scope = {}, state = { draftRev: 3, occurrences: [{ source: 'other', offset: 0, length: 8 }, { source: REVIEW_PACKET_PACKAGE + ':comments', ref: 'batch', offset: 12, length: 10 }] }
  const sessions = { binding: () => ({ ctx: scope }) }
  const ctx = { conversation: { input: { for: () => ({ state: { getSnapshot: () => state } }) } } }
  let received
  clearReviewInput(ctx, sessions, id, { insertText: (text, span) => { received = { text, span }; return true } })
  assert.deepEqual(received, { text: '', span: { start: 5, end: 6, draftRev: 3 } })
  assert.equal(store.getSnapshot().comments.length, 0)
})

test('late Profile discovery and migration cannot reattach listeners after disposal', async () => {
  const f = profileFixture()
  const discovery = Promise.withResolvers()
  const migration = Promise.withResolvers()
  f.mirror.ensure = () => discovery.promise
  f.form.mutate = () => migration.promise
  const dispose = bindProfileReviewPreferences(f.ctx, f.local)
  assert.equal(f.form.count, 1)
  dispose()
  discovery.resolve()
  migration.resolve(true)
  await new Promise(resolve => setTimeout(resolve, 0))
  assert.equal(f.form.count, 0)
  assert.equal(f.mirror.count, 0)
  assert.equal(f.local.getSnapshot().layout, 'split')
})

test('an aborted batch releases its listener and retry binds to a fresh official request', () => {
  const id = randomUUID()
  const store = commentStoreFor(id)
  const batches = new ReviewInputBatches()
  store.save(anchor, 'retry opinion')
  const frozen = { ...packet(), sessionId: id, comments: store.getSnapshot().comments }
  const ref = reviewBatchReference(frozen)
  batches.attach(frozen, true)
  const first = new AbortController()
  batches.serialize(ref, first.signal)
  batches.reconcile(id, [{ requestId: 'first-request', text: serializeReviewPacket(frozen) }], [])
  first.abort()
  assert.equal(store.getSnapshot().busy, false)
  const retry = new AbortController()
  const text = batches.serialize(ref, retry.signal)
  batches.reconcile(id, [{ requestId: 'retry-request', text }], [])
  const discussion = discussionStoreFor(id).getSnapshot().records.at(-1)
  assert.equal(discussion.requestId, 'retry-request')
  batches.reconcile(id, [], [{ event: {
    type: 'user/message', seq: 4,
    data: { source: { kind: 'user', rpcId: 'retry-request' }, content: [{ type: 'text', text }] },
  } }])
  assert.equal(store.getSnapshot().busy, false)
  assert.equal(store.getSnapshot().comments.length, 0)
  assert.equal(batches.sessionIds().size, 0)
  // A stale abort cannot release a different sender's newly acquired lock.
  store.save(anchor, 'next batch')
  assert.equal(store.acquire(), true)
  retry.abort()
  assert.equal(store.getSnapshot().busy, true)
  store.release()
  store.clear()
  batches.clear()
})

test('batch disposal releases active submission locks without acknowledging unsent comments', () => {
  const id = randomUUID()
  const store = commentStoreFor(id)
  const batches = new ReviewInputBatches()
  store.save(anchor, 'keep this')
  const frozen = { ...packet(), sessionId: id, comments: store.getSnapshot().comments }
  batches.attach(frozen, false)
  batches.serialize(reviewBatchReference(frozen), new AbortController().signal)
  assert.equal(store.getSnapshot().busy, true)
  batches.clear()
  assert.equal(store.getSnapshot().busy, false)
  assert.equal(store.getSnapshot().comments.length, 1)
  store.clear()
})

test('Git report keeps display order despite out-of-order results and includes failed files', async () => {
  const files = ['first', 'failed', 'binary'].map(path => ({ repository: 'repo', path }))
  const first = Promise.withResolvers()
  const pending = loadGitReviewReport(files, {
    source: 'HEAD -> index',
    ensureActive() {},
    async load(file) {
      if (file.path === 'first') return first.promise
      if (file.path === 'failed') throw new Error('Cannot read file')
      first.resolve({ diffs: [], binary: false })
      return { diffs: [], binary: true }
    },
  })
  const report = await pending
  assert.deepEqual(report.map(file => file.path), ['first', 'failed', 'binary'])
  assert.match(report[1].note, /Cannot read file/)
  assert.equal(report[2].note, 'Binary file')
})

test('bulk loaders stop scheduling after failure and reject a stale comparison', async () => {
  const active = Promise.withResolvers()
  const calls = []
  await assert.rejects(loadMissingReviewDiffs(
    [0, 1, 2, 3, 4, 5], String, new Set(), async file => {
      calls.push(file)
      if (file === 0) throw new Error('cancelled')
      await active.promise
    },
  ), /cancelled/)
  active.resolve()
  await new Promise(resolve => setTimeout(resolve, 0))
  assert.deepEqual(calls, [0, 1, 2, 3])
  let current = true
  await assert.rejects(loadGitReviewReport([{ repository: 'repo', path: 'a' }], {
    source: 'HEAD',
    ensureActive() { if (!current) throw new Error('comparison changed') },
    async load() { current = false; return { diffs: [] } },
  }), /comparison changed/)
})
