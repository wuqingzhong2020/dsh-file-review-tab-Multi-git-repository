import { parseReviewComments, type ReviewComment } from './review-comments.ts'
import { reconcileDiscussions } from './review-discussion-events.ts'

export { reconcileDiscussions } from './review-discussion-events.ts'

export interface DiscussionReply {
  readonly id: string
  readonly seq: number
  readonly text: string
  readonly interrupted: boolean
}

export type DiscussionState =
  | 'submitting'
  | 'queued'
  | 'running'
  | 'answered'
  | 'completed'
  | 'cancelled'
  | 'failed'
  | 'unknown'
  | 'unlinked'

export interface ReviewDiscussion {
  readonly id: string
  readonly requestId: string
  readonly parentId?: string | undefined
  readonly createdAt: number
  readonly comments: readonly ReviewComment[]
  readonly state: DiscussionState
  readonly userSeq?: number | undefined
  readonly turn?: number | undefined
  readonly replies: readonly DiscussionReply[]
  readonly readSeq: number
  readonly resolved: readonly string[]
}

interface DiscussionStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export interface DiscussionSnapshot {
  readonly records: readonly ReviewDiscussion[]
  readonly storageError: boolean
}

const DISCUSSION_STATES: readonly DiscussionState[] = [
  'submitting',
  'queued',
  'running',
  'answered',
  'completed',
  'cancelled',
  'failed',
  'unknown',
  'unlinked',
]
const ADMITTED_STATES: readonly DiscussionState[] = [
  'queued',
  'running',
  'answered',
  'completed',
  'cancelled',
]

export function isAdmittedDiscussionState(state: DiscussionState): boolean {
  return ADMITTED_STATES.includes(state)
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function validateReply(reply: unknown): void {
  const value = asRecord(reply)
  if (
    typeof value.id !== 'string' ||
    typeof value.seq !== 'number' ||
    typeof value.text !== 'string' ||
    typeof value.interrupted !== 'boolean'
  ) {
    throw new Error('Invalid discussion reply')
  }
}

export function parseReviewDiscussions(raw: string): readonly ReviewDiscussion[] {
  const data = asRecord(JSON.parse(raw))
  if (data.version !== 1 || !Array.isArray(data.records)) throw new Error('Invalid discussions')
  const ids = new Set<string>()
  return data.records.map(item => {
    const entry = asRecord(item)
    if (
      typeof entry.id !== 'string' ||
      ids.has(entry.id) ||
      typeof entry.requestId !== 'string' ||
      typeof entry.createdAt !== 'number' ||
      !DISCUSSION_STATES.includes(String(entry.state) as DiscussionState) ||
      !Array.isArray(entry.replies) ||
      !Array.isArray(entry.resolved) ||
      !entry.resolved.every(id => typeof id === 'string') ||
      typeof entry.readSeq !== 'number'
    ) {
      throw new Error('Invalid discussion')
    }
    ids.add(entry.id)
    const comments = parseReviewComments(JSON.stringify({ version: 1, comments: entry.comments }))
    if (comments.length === 0) throw new Error('Empty discussion')
    for (const reply of entry.replies) validateReply(reply)
    for (const key of ['userSeq', 'turn']) {
      const value = entry[key]
      if (
        value !== undefined &&
        (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1)
      ) {
        throw new Error('Invalid discussion identity')
      }
    }
    if (entry.parentId !== undefined && typeof entry.parentId !== 'string')
      throw new Error('Invalid parent discussion')
    // Keep persisted extra fields; in-flight sends reopen as uncertain after a restart.
    return {
      ...entry,
      comments,
      state: entry.state === 'submitting' ? 'unknown' : entry.state,
    } as unknown as ReviewDiscussion
  })
}

export class ReviewDiscussionStore {
  private snapshot: DiscussionSnapshot = { records: [], storageError: false }
  private readonly listeners = new Set<() => void>()
  private readonly storage: DiscussionStorage | undefined
  private readonly key: string

  constructor(storage?: DiscussionStorage, key = '') {
    this.storage = storage
    this.key = key
    try {
      const raw = storage?.getItem(key)
      if (raw) this.snapshot = { records: parseReviewDiscussions(raw), storageError: false }
    } catch {
      this.snapshot = { records: [], storageError: true }
    }
  }

  getSnapshot = (): DiscussionSnapshot => this.snapshot

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private publish(records: readonly ReviewDiscussion[]): void {
    let storageError = this.snapshot.storageError
    try {
      if (!this.storage) throw new Error('Storage unavailable')
      this.storage.setItem(this.key, JSON.stringify({ version: 1, records }))
      storageError = false
    } catch {
      storageError = true
    }
    this.snapshot = { records, storageError }
    for (const listener of this.listeners) listener()
  }

  begin(comments: readonly ReviewComment[], requestId: string, parentId?: string): string {
    const id = globalThis.crypto.randomUUID()
    this.publish([
      ...this.snapshot.records,
      {
        id,
        requestId,
        parentId,
        comments,
        createdAt: Date.now(),
        state: 'submitting',
        replies: [],
        readSeq: 0,
        resolved: [],
      },
    ])
    return id
  }

  settle(id: string, state: DiscussionState): void {
    this.publish(
      this.snapshot.records.map(discussion => {
        const canSettle =
          discussion.id === id &&
          (discussion.state === 'submitting' || discussion.state === 'unknown')
        return canSettle ? { ...discussion, state } : discussion
      }),
    )
  }

  read(id: string): void {
    this.publish(
      this.snapshot.records.map(discussion =>
        discussion.id === id
          ? { ...discussion, readSeq: discussion.replies.at(-1)?.seq ?? 0 }
          : discussion,
      ),
    )
  }

  resolve(id: string, commentId: string, resolved: boolean): void {
    this.publish(
      this.snapshot.records.map(discussion => {
        if (discussion.id !== id) return discussion
        const resolvedIds = resolved
          ? [...new Set([...discussion.resolved, commentId])]
          : discussion.resolved.filter(value => value !== commentId)
        return { ...discussion, resolved: resolvedIds }
      }),
    )
  }

  reconcile(entries: readonly unknown[]): void {
    const records = reconcileDiscussions(this.snapshot.records, entries)
    if (JSON.stringify(records) !== JSON.stringify(this.snapshot.records)) this.publish(records)
  }
}
