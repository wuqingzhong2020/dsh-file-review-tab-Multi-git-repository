import { parseReviewComments, type ReviewComment } from './review-comments.ts'

export interface DiscussionReply { readonly id: string; readonly seq: number; readonly text: string; readonly interrupted: boolean }
export type DiscussionState = 'submitting' | 'queued' | 'running' | 'answered' | 'completed' | 'cancelled' | 'failed' | 'unknown' | 'unlinked'
export interface ReviewDiscussion {
  readonly id: string; readonly requestId: string; readonly parentId?: string | undefined
  readonly createdAt: number; readonly comments: readonly ReviewComment[]; readonly state: DiscussionState
  readonly userSeq?: number | undefined; readonly turn?: number | undefined
  readonly replies: readonly DiscussionReply[]; readonly readSeq: number; readonly resolved: readonly string[]
}
interface DiscussionStorage { getItem(key: string): string | null; setItem(key: string, value: string): void }
export interface DiscussionSnapshot { readonly records: readonly ReviewDiscussion[]; readonly storageError: boolean }
type EventValue = { type: string; seq: number; data: Record<string, unknown> }
const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' ? value as Record<string, unknown> : {}
const rpcId = (message: unknown): string => { const source = record(record(message).source); return source.kind === 'user' && typeof source.rpcId === 'string' ? source.rpcId : '' }
const textContent = (value: unknown): string => Array.isArray(value) ? value.filter(part => record(part).type === 'text' && typeof record(part).text === 'string').map(part => record(part).text).join('\n') : ''

export function parseReviewDiscussions(raw: string): readonly ReviewDiscussion[] {
  const data = record(JSON.parse(raw))
  if (data.version !== 1 || !Array.isArray(data.records)) throw new Error('Invalid discussions')
  const ids = new Set<string>()
  return data.records.map(item => {
    const entry = record(item)
    if (typeof entry.id !== 'string' || ids.has(entry.id) || typeof entry.requestId !== 'string' || typeof entry.createdAt !== 'number'
      || !['submitting', 'queued', 'running', 'answered', 'completed', 'cancelled', 'failed', 'unknown', 'unlinked'].includes(String(entry.state))
      || !Array.isArray(entry.replies) || !Array.isArray(entry.resolved) || !entry.resolved.every(id => typeof id === 'string') || typeof entry.readSeq !== 'number') throw new Error('Invalid discussion')
    ids.add(entry.id)
    const comments = parseReviewComments(JSON.stringify({ version: 1, comments: entry.comments }))
    if (!comments.length) throw new Error('Empty discussion')
    for (const reply of entry.replies) {
      const value = record(reply)
      if (typeof value.id !== 'string' || typeof value.seq !== 'number' || typeof value.text !== 'string' || typeof value.interrupted !== 'boolean') throw new Error('Invalid discussion reply')
    }
    for (const key of ['userSeq', 'turn']) if (entry[key] !== undefined && (typeof entry[key] !== 'number' || !Number.isSafeInteger(entry[key]) || entry[key] < 1)) throw new Error('Invalid discussion identity')
    if (entry.parentId !== undefined && typeof entry.parentId !== 'string') throw new Error('Invalid parent discussion')
    return { ...entry, comments, state: entry.state === 'submitting' ? 'unknown' : entry.state } as unknown as ReviewDiscussion
  })
}

/** Reconcile durable request -> user event -> turn -> assistant messages, never the latest unrelated reply. */
export function reconcileDiscussions(records: readonly ReviewDiscussion[], entries: readonly unknown[]): readonly ReviewDiscussion[] {
  const events: EventValue[] = entries.map(item => record(record(item).event ?? item)).filter(item => typeof item.type === 'string' && typeof item.seq === 'number').map(item => ({ type: String(item.type), seq: Number(item.seq), data: record(item.data) })).sort((a, b) => a.seq - b.seq)
  const admitted = new Map<string, { seq: number; turn: number | undefined }>()
  const replies = new Map<number, DiscussionReply[]>(), endings = new Map<number, string>(), cancelled = new Set<string>()
  const pending: Record<string, unknown[]> = { 'next-turn': [], 'next-step': [] }
  let turn: number | undefined
  for (const event of events) {
    const data = event.data
    if (event.type === 'turn/start' && typeof data.turn === 'number') turn = data.turn
    else if (event.type === 'user/message') {
      const id = rpcId(data)
      if (id) admitted.set(id, { seq: event.seq, turn })
    } else if (event.type === 'turn/end' && typeof data.turn === 'number') { endings.set(data.turn, typeof data.reason === 'string' ? data.reason : String(record(data.reason).kind)); if (turn === data.turn) turn = undefined }
    else if (event.type === 'assistant/message' && typeof data.turn === 'number') {
      const message = record(data.message), text = textContent(message.content)
      if (!text) continue
      const list = replies.get(data.turn) ?? []
      list.push({ id: typeof message.id === 'string' ? message.id : `seq:${event.seq}`, seq: event.seq, text, interrupted: data.interrupted === true })
      replies.set(data.turn, list)
    } else if (event.type === 'agent/inbox/spliced') {
      const list = pending[String(data.target)]
      if (!list || typeof data.start !== 'number' || !Array.isArray(data.inserted)) continue
      const removed = list.splice(data.start, Number(data.removedCount ?? 0), ...data.inserted)
      if (data.outcome === 'canceled') for (const item of removed) { const id = rpcId(item); if (id) cancelled.add(id) }
    }
  }
  const queued = new Set(Object.values(pending).flat().map(rpcId).filter(Boolean))
  return records.map(item => {
    if (!item.requestId) return item
    const user = admitted.get(item.requestId)
    // Stored admission survives history window truncation. No new association is guessed.
    const ownTurn = user?.turn ?? item.turn, userSeq = user?.seq ?? item.userSeq
    const incoming = ownTurn === undefined || userSeq === undefined ? [] : (replies.get(ownTurn) ?? []).filter(reply => reply.seq > userSeq)
    const all = new Map(item.replies.map(reply => [reply.id, reply]))
    for (const reply of incoming) all.set(reply.id, reply)
    const combined = [...all.values()].sort((a, b) => a.seq - b.seq)
    const ending = ownTurn === undefined ? undefined : endings.get(ownTurn)
    const state: DiscussionState = cancelled.has(item.requestId) && userSeq === undefined ? 'cancelled'
      : combined.length ? 'answered' : ending !== undefined ? /abort|cancel|stop|interrupt/i.test(ending) ? 'cancelled' : /error|fail/i.test(ending) ? 'failed' : 'completed'
        : userSeq !== undefined ? 'running' : queued.has(item.requestId) ? 'queued' : item.state
    return { ...item, state, userSeq, turn: ownTurn, replies: combined }
  })
}

export class ReviewDiscussionStore {
  private snapshot: DiscussionSnapshot = { records: [], storageError: false }
  private readonly listeners = new Set<() => void>()
  private readonly storage: DiscussionStorage | undefined
  private readonly key: string
  constructor(storage?: DiscussionStorage, key = '') {
    this.storage = storage; this.key = key
    try { const raw = storage?.getItem(key); if (raw) this.snapshot = { records: parseReviewDiscussions(raw), storageError: false } }
    catch { this.snapshot = { records: [], storageError: true } }
  }
  getSnapshot = (): DiscussionSnapshot => this.snapshot
  subscribe = (listener: () => void): (() => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener) } }
  private publish(records: readonly ReviewDiscussion[]): void {
    let storageError = this.snapshot.storageError
    try { if (!this.storage) throw new Error('Storage unavailable'); this.storage.setItem(this.key, JSON.stringify({ version: 1, records })); storageError = false } catch { storageError = true }
    this.snapshot = { records, storageError }; for (const listener of this.listeners) listener()
  }
  begin(comments: readonly ReviewComment[], requestId: string, parentId?: string): string {
    const id = globalThis.crypto.randomUUID()
    this.publish([...this.snapshot.records, { id, requestId, parentId, comments, createdAt: Date.now(), state: 'submitting', replies: [], readSeq: 0, resolved: [] }]); return id
  }
  settle(id: string, state: DiscussionState): void { this.publish(this.snapshot.records.map(item => item.id === id && (item.state === 'submitting' || item.state === 'unknown') ? { ...item, state } : item)) }
  read(id: string): void { this.publish(this.snapshot.records.map(item => item.id === id ? { ...item, readSeq: item.replies.at(-1)?.seq ?? 0 } : item)) }
  resolve(id: string, commentId: string, resolved: boolean): void { this.publish(this.snapshot.records.map(item => item.id === id ? { ...item, resolved: resolved ? [...new Set([...item.resolved, commentId])] : item.resolved.filter(value => value !== commentId) } : item)) }
  reconcile(entries: readonly unknown[]): void {
    const records = reconcileDiscussions(this.snapshot.records, entries)
    if (JSON.stringify(records) !== JSON.stringify(this.snapshot.records)) this.publish(records)
  }
}
