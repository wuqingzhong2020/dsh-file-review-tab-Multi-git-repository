import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { LifecycleRecordCache, replayLifecycleHistory } from '../src/lifecycle-history.ts'
import { lifecycleBlock, SESSION_MAX_RECORDS } from '../src/lifecycle-record.ts'

function record(overrides = {}) {
  return {
    schemaVersion: 1,
    sessionId: 'session',
    recordId: randomUUID(),
    rootCallId: 'call',
    subCallId: 'call',
    name: 'write',
    path: 'a.txt',
    filename: 'D:/project/a.txt',
    before: null,
    after: { text: 'after', mode: 0o644, dev: 1, ino: 1 },
    complete: true,
    ...overrides,
  }
}

function event(record, overrides = {}) {
  return {
    type: 'tool/ptc-dispatch',
    data: {
      rootCallId: record.rootCallId,
      subCallId: record.subCallId,
      content: [lifecycleBlock(record)],
      ...overrides,
    },
  }
}

function change(...records) {
  return {
    path: records[0].path,
    diffs: records.map(record => ({
      path: record.path,
      recordId: record.recordId,
      oldText: record.before?.text ?? null,
      newText: record.after?.text ?? '',
    })),
  }
}

test('history trusts only matching accepted settlements and deduplicates durable/cache records', () => {
  const accepted = record()
  const rejected = record()
  const history = replayLifecycleHistory('session', [
    { type: 'tool/result', data: null },
    event(rejected, { isError: true }),
    event(rejected, { subCallId: 'different' }),
    event(record({ sessionId: 'other-session' })),
    event(accepted),
  ], [accepted])
  assert.deepEqual(history.records, [accepted])
  assert.equal(history.truncated, false)
})

test('indexed sequences reject reordering, duplicates, tampering and mixed legacy fragments', () => {
  const first = record()
  const second = record({ before: first.after, after: { ...first.after, text: 'second' } })
  const history = replayLifecycleHistory('session', [event(first), event(second)])
  assert.deepEqual(history.sequence(change(first, second)), [first, second])
  assert.deepEqual(history.sequence(change(second, first)), [])
  assert.deepEqual(history.sequence(change(first, first)), [])
  const altered = change(first)
  altered.diffs[0].newText = 'tampered'
  assert.deepEqual(history.sequence(altered), [])
  const mixed = change(first, second)
  delete mixed.diffs[1].recordId
  assert.deepEqual(history.sequence(mixed), [])
  assert.equal(history.sequence({ path: 'a.txt', diffs: [{ path: 'a.txt', oldText: 'a', newText: 'b' }] }), null)
})

test('record caps retain newest history and expose truncation without mutable service flags', () => {
  const records = Array.from({ length: SESSION_MAX_RECORDS + 1 }, () => record())
  const cache = new LifecycleRecordCache()
  for (const item of records) cache.add(item)
  assert.deepEqual([...cache.records()], records.slice(1))
  const history = replayLifecycleHistory('session', records.map(item => event(item)), cache.records())
  assert.deepEqual(history.records, records.slice(1))
  assert.equal(history.truncated, true)
  assert.equal(replayLifecycleHistory('session', []).truncated, false)
})

test('byte caps evict cache entries and retain explicit unsupported markers in durable replay', () => {
  const records = Array.from({ length: 72 }, () => record({
    after: { text: 'x'.repeat(240 * 1024), mode: 0o644, dev: 1, ino: 1 },
  }))
  const cache = new LifecycleRecordCache()
  for (const item of records) cache.add(item)
  const cached = [...cache.records()]
  assert.ok(cached.length < records.length)
  assert.equal(cached.at(-1), records.at(-1))
  const history = replayLifecycleHistory('session', records.map(item => event(item)))
  assert.equal(history.records.length, records.length)
  assert.equal(history.records[0].complete, false)
  assert.equal(history.records[0].after, null)
  assert.match(history.records[0].reason, /16 MiB/)
  assert.equal(history.records.at(-1).complete, true)

  // Replacing an existing entry must subtract its former byte cost.
  const replacement = record({ recordId: cached.at(-1).recordId })
  cache.add(replacement)
  assert.equal([...cache.records()].at(-1), replacement)
  assert.equal([...cache.records()].length, cached.length)
})
