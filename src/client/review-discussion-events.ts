import type { DiscussionReply, DiscussionState, ReviewDiscussion } from './review-discussions.ts'

interface DiscussionEvent {
  type: string
  seq: number
  data: Record<string, unknown>
}

interface DiscussionEventIndex {
  admitted: Map<string, { seq: number; turn: number | undefined }>
  replies: Map<number, DiscussionReply[]>
  endings: Map<number, string>
  cancelled: Set<string>
  queued: Set<string>
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function userRequestId(message: unknown): string {
  const source = asRecord(asRecord(message).source)
  return source.kind === 'user' && typeof source.rpcId === 'string' ? source.rpcId : ''
}

function assistantText(content: unknown): string {
  if (!Array.isArray(content)) return ''
  return content
    .filter(part => asRecord(part).type === 'text' && typeof asRecord(part).text === 'string')
    .map(part => asRecord(part).text)
    .join('\n')
}

function orderedEvents(entries: readonly unknown[]): DiscussionEvent[] {
  return entries
    .map(entry => asRecord(asRecord(entry).event ?? entry))
    .filter(event => typeof event.type === 'string' && typeof event.seq === 'number')
    .map(event => ({
      type: String(event.type),
      seq: Number(event.seq),
      data: asRecord(event.data),
    }))
    .sort((left, right) => left.seq - right.seq)
}

/** Build request/turn indexes once; inbox edits must be replayed in sequence order. */
function indexDiscussionEvents(entries: readonly unknown[]): DiscussionEventIndex {
  const admitted: DiscussionEventIndex['admitted'] = new Map()
  const replies: DiscussionEventIndex['replies'] = new Map()
  const endings = new Map<number, string>()
  const cancelled = new Set<string>()
  const pending: Record<string, unknown[]> = { 'next-turn': [], 'next-step': [] }
  let turn: number | undefined

  for (const event of orderedEvents(entries)) {
    const { data } = event
    switch (event.type) {
      case 'turn/start':
        if (typeof data.turn === 'number') turn = data.turn
        break
      case 'user/message': {
        const requestId = userRequestId(data)
        if (requestId) admitted.set(requestId, { seq: event.seq, turn })
        break
      }
      case 'turn/end':
        if (typeof data.turn === 'number') {
          const reason =
            typeof data.reason === 'string' ? data.reason : String(asRecord(data.reason).kind)
          endings.set(data.turn, reason)
          if (turn === data.turn) turn = undefined
        }
        break
      case 'assistant/message': {
        if (typeof data.turn !== 'number') break
        const message = asRecord(data.message)
        const text = assistantText(message.content)
        if (!text) break
        const turnReplies = replies.get(data.turn) ?? []
        turnReplies.push({
          id: typeof message.id === 'string' ? message.id : `seq:${event.seq}`,
          seq: event.seq,
          text,
          interrupted: data.interrupted === true,
        })
        replies.set(data.turn, turnReplies)
        break
      }
      case 'agent/inbox/spliced': {
        const inbox = pending[String(data.target)]
        if (!inbox || typeof data.start !== 'number' || !Array.isArray(data.inserted)) break
        const removed = inbox.splice(data.start, Number(data.removedCount ?? 0), ...data.inserted)
        if (data.outcome === 'canceled') {
          for (const message of removed) {
            const requestId = userRequestId(message)
            if (requestId) cancelled.add(requestId)
          }
        }
        break
      }
    }
  }
  const queued = new Set(Object.values(pending).flat().map(userRequestId).filter(Boolean))
  return { admitted, replies, endings, cancelled, queued }
}

/** A recorded answer takes precedence over the turn's eventual ending reason. */
function discussionState(
  discussion: ReviewDiscussion,
  events: DiscussionEventIndex,
  userSeq: number | undefined,
  turn: number | undefined,
  replies: readonly DiscussionReply[],
): DiscussionState {
  if (events.cancelled.has(discussion.requestId) && userSeq === undefined) return 'cancelled'
  if (replies.length > 0) return 'answered'
  const ending = turn === undefined ? undefined : events.endings.get(turn)
  if (ending !== undefined) {
    if (/abort|cancel|stop|interrupt/i.test(ending)) return 'cancelled'
    if (/error|fail/i.test(ending)) return 'failed'
    return 'completed'
  }
  if (userSeq !== undefined) return 'running'
  if (events.queued.has(discussion.requestId)) return 'queued'
  return discussion.state
}

/** Reconcile durable request -> user event -> turn -> assistant messages, never the latest unrelated reply. */
export function reconcileDiscussions(
  records: readonly ReviewDiscussion[],
  entries: readonly unknown[],
): readonly ReviewDiscussion[] {
  const events = indexDiscussionEvents(entries)
  return records.map(discussion => {
    if (!discussion.requestId) return discussion
    const admission = events.admitted.get(discussion.requestId)
    // Established identities survive truncated history; absent events cannot infer a new turn.
    const turn = admission?.turn ?? discussion.turn
    const userSeq = admission?.seq ?? discussion.userSeq
    const incoming =
      turn === undefined || userSeq === undefined
        ? []
        : (events.replies.get(turn) ?? []).filter(reply => reply.seq > userSeq)
    const repliesById = new Map(discussion.replies.map(reply => [reply.id, reply]))
    for (const reply of incoming) repliesById.set(reply.id, reply)
    const replies = [...repliesById.values()].sort((left, right) => left.seq - right.seq)
    const state = discussionState(discussion, events, userSeq, turn, replies)
    return { ...discussion, state, userSeq, turn, replies }
  })
}
