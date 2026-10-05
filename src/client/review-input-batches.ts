/** Frozen batches and submission locks, independent of the editor and Dock lifetime. */
import type { PendingSubmission } from '@deepseek-ai/dsh-api-session-controller/client'
import { commentStoreFor, discussionStoreFor } from './review-comment-context.ts'
import { parseReviewPacket, serializeReviewPacket, type ReviewCommentPacket } from './review-comment-packet.ts'
import { isAdmittedDiscussionState, ReviewDiscussionStore } from './review-discussions.ts'

const PENDING_BATCH_LIMIT = 256

interface Submission {
  removeAbort: () => void
  request?: { id: string; discussionId: string }
}

interface PendingBatch {
  packet: ReviewCommentPacket
  discussions: ReviewDiscussionStore
  /** Absent while attached; created only after acquiring the shared comment lock. */
  submission?: Submission
}

export function reviewBatchReference(packet: ReviewCommentPacket): string {
  return `${packet.sessionId}:${packet.batchId}`
}

function releaseSubmission(batch: PendingBatch): void {
  const submission = batch.submission
  if (!submission) return
  delete batch.submission
  submission.removeAbort()
  commentStoreFor(batch.packet.sessionId).release()
}

export class ReviewInputBatches {
  private readonly batches = new Map<string, PendingBatch>()
  private readonly listeners = new Set<() => void>()

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  private notify = (): void => {
    for (const listener of [...this.listeners]) listener()
  }

  sessionIds(): Set<string> {
    return new Set([...this.batches.values()].map(batch => batch.packet.sessionId))
  }

  canAttach(sessionId: string): boolean {
    return this.batches.size < PENDING_BATCH_LIMIT || [...this.batches.values()].some(batch =>
      batch.packet.sessionId === sessionId && !batch.submission,
    )
  }

  attach(packet: ReviewCommentPacket, discussionEnabled: boolean): void {
    for (const [ref, batch] of this.batches) {
      if (batch.packet.sessionId === packet.sessionId && !batch.submission) {
        this.batches.delete(ref)
      }
    }
    this.batches.set(reviewBatchReference(packet), {
      packet,
      discussions: discussionEnabled
        ? discussionStoreFor(packet.sessionId)
        : new ReviewDiscussionStore(),
    })
    this.notify()
  }

  serialize(ref: string, signal: AbortSignal): string {
    const batch = this.batches.get(ref)
    if (!batch || batch.submission || signal.aborted) {
      throw new Error('Review reference expired; attach the pending comments again')
    }
    const store = commentStoreFor(batch.packet.sessionId)
    if (!store.acquire()) throw new Error('Review comments are already being submitted')
    const abort = () => releaseSubmission(batch)
    batch.submission = { removeAbort: () => signal.removeEventListener('abort', abort) }
    signal.addEventListener('abort', abort, { once: true })
    try {
      return serializeReviewPacket(batch.packet) + '\n\n'
    } catch (error) {
      releaseSubmission(batch)
      throw error
    }
  }

  /** Admission acknowledges only the frozen comments, preserving edits made after attachment. */
  reconcile(sessionId: string, submissions: readonly PendingSubmission[], entries: readonly unknown[]): void {
    const echoes = new Map(submissions.flatMap(submission => {
      const parsed = parseReviewPacket(submission.text)
      return parsed ? [[parsed.packet.batchId, submission] as const] : []
    }))
    let removed = false
    for (const [ref, batch] of this.batches) {
      const submission = batch.submission
      if (batch.packet.sessionId !== sessionId || !submission) continue
      const echo = echoes.get(batch.packet.batchId)
      if (echo && !submission.request) {
        const id = String(echo.requestId)
        const discussionId = batch.discussions.begin(
          batch.packet.comments,
          id,
          batch.packet.comments[0]?.discussionId,
        )
        submission.request = { id, discussionId }
      }
      batch.discussions.reconcile(entries)
      const discussion = batch.discussions.getSnapshot().records.find(record =>
        record.id === submission.request?.discussionId,
      )
      if (discussion && isAdmittedDiscussionState(discussion.state)) {
        commentStoreFor(sessionId).acknowledge(batch.packet.comments)
      } else if (submission.request && !echo) {
        batch.discussions.settle(submission.request.discussionId, 'unknown')
      } else {
        continue
      }
      this.batches.delete(ref)
      releaseSubmission(batch)
      removed = true
    }
    // Dispose session listeners outside the event source's current notification.
    if (removed) queueMicrotask(this.notify)
  }

  remove(ref: string): void {
    const batch = this.batches.get(ref)
    this.batches.delete(ref)
    if (batch) releaseSubmission(batch)
    this.notify()
  }

  clear(): void {
    const batches = [...this.batches.values()]
    this.batches.clear()
    for (const batch of batches) releaseSubmission(batch)
    this.notify()
  }
}
