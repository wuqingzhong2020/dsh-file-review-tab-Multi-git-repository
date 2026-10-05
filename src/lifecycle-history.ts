/** Replay and index Host-owned lifecycle facts independently of filesystem operations. */
import type { FileReviewChange, RecordedMutation } from './change-types.ts'
import {
  lifecycleFromContent,
  lifecycleRecordBytes,
  incompleteLifecycle,
  SESSION_MAX_BYTES,
  SESSION_MAX_RECORDS,
  type LifecycleRecord,
} from './lifecycle-record.ts'

interface SessionEvent {
  type: string
  data: unknown
}

interface AcceptedSettlement {
  rootCallId: unknown
  subCallId: unknown
  content: readonly unknown[]
}

function objectValue(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object'
    ? value as Record<string, unknown>
    : undefined
}

/** Standard tools and nested dispatches carry different official event shapes. */
function acceptedSettlement(event: SessionEvent): AcceptedSettlement | undefined {
  const data = objectValue(event.data)
  if (!data) return undefined
  if (event.type === 'tool/ptc-dispatch') {
    if (data.isError) return undefined
    return {
      rootCallId: data.rootCallId,
      subCallId: data.subCallId,
      content: Array.isArray(data.content) ? data.content : [],
    }
  }
  if (event.type !== 'tool/result') return undefined
  const message = objectValue(data.message)
  if (!message || message.isError) return undefined
  const callId = objectValue(message.source)?.callId
  const content = Array.isArray(message.content) ? message.content : []
  return {
    rootCallId: callId,
    subCallId: callId,
    content: content.flatMap(block => {
      const result = objectValue(block)
      if (result?.isError) return []
      return Array.isArray(result?.content) ? result.content : [block]
    }),
  }
}

/** Bounded observation cache; durable session events remain the replay authority. */
export class LifecycleRecordCache {
  private readonly entries = new Map<string, { record: LifecycleRecord; bytes: number }>()
  private bytes = 0

  add(record: LifecycleRecord): void {
    const bytes = lifecycleRecordBytes(record)
    this.bytes -= this.entries.get(record.recordId)?.bytes ?? 0
    this.entries.set(record.recordId, { record, bytes })
    this.bytes += bytes
    while (this.entries.size > SESSION_MAX_RECORDS
      || (this.bytes > SESSION_MAX_BYTES && this.entries.size > 1)) {
      const oldest = this.entries.keys().next().value!
      this.bytes -= this.entries.get(oldest)!.bytes
      this.entries.delete(oldest)
    }
  }

  *records(): IterableIterator<LifecycleRecord> {
    for (const { record } of this.entries.values()) yield record
  }
}

/** One immutable lookup snapshot shared by every file in a status/apply request. */
export class LifecycleHistory {
  readonly records: readonly LifecycleRecord[]
  readonly truncated: boolean
  private readonly index: Map<string, { record: LifecycleRecord; position: number }>

  constructor(records: readonly LifecycleRecord[], truncated: boolean) {
    this.records = records
    this.truncated = truncated
    this.index = new Map(records.map((record, position) => [record.recordId, { record, position }]))
  }

  /** null selects the legacy path; an empty sequence rejects untrusted/mixed records. */
  sequence(file: FileReviewChange): LifecycleRecord[] | null {
    if (!file.diffs.some(diff => diff.recordId)) return null
    const records: LifecycleRecord[] = []
    let previousPosition = -1
    for (const diff of file.diffs) {
      const entry = diff.recordId ? this.index.get(diff.recordId) : undefined
      if (!entry || entry.position <= previousPosition) return []
      const { record } = entry
      if (record.path !== file.path
        || diff.path !== file.path
        || diff.oldText !== (record.before?.text ?? null)
        || diff.newText !== (record.after?.text ?? '')) return []
      previousPosition = entry.position
      records.push(record)
    }
    return records
  }
}

export function replayLifecycleHistory(
  sessionId: string,
  events: Iterable<SessionEvent>,
  cached: Iterable<LifecycleRecord> = [],
): LifecycleHistory {
  const records = new Map<string, LifecycleRecord>()
  for (const event of events) {
    const settlement = acceptedSettlement(event)
    if (!settlement) continue
    for (const record of lifecycleFromContent(settlement.content)) {
      if (record.sessionId === sessionId
        && record.rootCallId === settlement.rootCallId
        && record.subCallId === settlement.subCallId) {
        records.set(record.recordId, record)
      }
    }
  }
  for (const record of cached) records.set(record.recordId, record)

  let budget = SESSION_MAX_BYTES
  const bounded: LifecycleRecord[] = []
  for (const record of [...records.values()].reverse()) {
    if (bounded.length >= SESSION_MAX_RECORDS) break
    budget -= lifecycleRecordBytes(record)
    bounded.push(budget >= 0 ? record : incompleteLifecycle(
      record,
      'session lifecycle replay exceeds the 16 MiB budget',
    ))
  }
  return new LifecycleHistory(bounded.reverse(), records.size > SESSION_MAX_RECORDS)
}

export function lifecycleMutation(record: LifecycleRecord): RecordedMutation {
  return {
    rootCallId: record.rootCallId,
    subCallId: record.subCallId,
    name: record.name,
    path: record.path,
    before: record.before?.text ?? null,
    after: record.after?.text ?? '',
    recordId: record.recordId,
    complete: record.complete,
    ...(record.reason ? { reason: record.reason } : {}),
  }
}
