/** Official reference codec + session admission tracking, with no draft replacement. */
import type { Context } from '@deepseek-ai/cordis'
import type { InputTriggerSource } from '@deepseek-ai/dsh-client-ui-input-trigger/client'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { InputActions, InputState } from '@deepseek-ai/dsh-client-ui-conversation/client'
import { commentStoreFor, discussionStoreFor } from './review-comment-context.ts'
import { formatReviewSubmission } from './review-comment-submission.ts'
import { REVIEW_PACKET_PACKAGE, serializeReviewPacket, type ReviewCommentPacket } from './review-comment-packet.ts'
import { ReviewInputBatches, reviewBatchReference } from './review-input-batches.ts'
import { t } from './locales.ts'

export const REVIEW_INPUT_SOURCE = `${REVIEW_PACKET_PACKAGE}:comments`
const REFERENCE_CLIPBOARD_TEXT = '[审查意见 / Review comments]'
const batches = new ReviewInputBatches()

export function reviewInputSource(): InputTriggerSource {
  return {
    name: REVIEW_INPUT_SOURCE,
    trigger: '@',
    candidates: async () => [],
    onPick: () => undefined,
    codec: {
      clipboardText: () => REFERENCE_CLIPBOARD_TEXT,
      serialize: async (ref, signal) => batches.serialize(ref, signal),
    },
  }
}

/** Prepend a frozen batch, then restore the caret after accounting for the new chip. */
export function attachReviewInput(
  ctx: Context,
  sessions: ISessions,
  sessionId: string,
  actions: InputActions,
  discussionEnabled = true,
): boolean {
  const binding = sessions.binding(sessionId as SessionId)
  if (!binding || !ctx.get('inputTriggers')) return false
  const snapshot = commentStoreFor(sessionId).getSnapshot()
  if (snapshot.busy || !snapshot.comments.length || !batches.canAttach(sessionId)) return false
  const input = ctx.conversation.input.for(binding.ctx)
  const state = input.state.getSnapshot() as InputState
  if (state.phase !== 'plain' || state.occurrences.some(item => item.source === REVIEW_INPUT_SOURCE)) {
    return false
  }
  const packet: ReviewCommentPacket = {
    package: REVIEW_PACKET_PACKAGE,
    version: 1,
    sessionId,
    batchId: globalThis.crypto.randomUUID(),
    comments: snapshot.comments,
    context: formatReviewSubmission(
      snapshot.comments,
      discussionStoreFor(sessionId).getSnapshot().records,
    ),
  }
  // Validate the entire payload before changing the editor.
  serializeReviewPacket(packet)
  const span = actions.captureInsertion()
  // Envelopes are leading so the renderer has a strict, unambiguous parse boundary.
  const inserted = binding.ctx.bail(binding.ctx, 'slash/input-insert-reference', {
    reference: {
      source: REVIEW_INPUT_SOURCE,
      ref: reviewBatchReference(packet),
      label: t('reviewPacketCount', { count: packet.comments.length }),
      clipboardText: REFERENCE_CLIPBOARD_TEXT,
    },
    span: { ...span, start: 0, end: 0 },
  })
  if (inserted !== true) return false
  const updated = input.state.getSnapshot() as InputState
  const caret = span.end + 2 // One compact reference symbol and its separator.
  actions.insertText('', { start: caret, end: caret, draftRev: updated.draftRev })
  batches.attach(packet, discussionEnabled)
  return true
}

/** Observe real request identities from the official pending submissions and durable events. */
export function bindReviewInputAdmission(sessions: ISessions, sessionId: string): () => void {
  const binding = sessions.binding(sessionId as SessionId)
  const scope = sessions.scope(sessionId as SessionId)
  const session = scope ? sessions.sessionOf(scope) : undefined
  if (!binding || !session) return () => {}
  const sync = () => batches.reconcile(
    sessionId,
    session.getSnapshot().pendingSubmissions,
    binding.eventSource.getSnapshot().entries,
  )
  const offSession = session.subscribe(sync)
  const offEvents = binding.eventSource.subscribe(sync)
  sync()
  return () => {
    offSession()
    offEvents()
  }
}

export function clearReviewInput(
  ctx: Context,
  sessions: ISessions,
  sessionId: string,
  actions: InputActions,
): void {
  const binding = sessions.binding(sessionId as SessionId)
  const store = commentStoreFor(sessionId)
  if (store.getSnapshot().busy) return
  if (binding) {
    const state = ctx.conversation.input.for(binding.ctx).state.getSnapshot() as InputState
    const occurrence = state.occurrences.find(item => item.source === REVIEW_INPUT_SOURCE)
    if (occurrence) {
      // Display labels expand in occurrences, but editor actions address one symbol per chip.
      const expandedBefore = state.occurrences
        .filter(item => item.offset < occurrence.offset)
        .reduce((sum, item) => sum + item.length - 1, 0)
      const start = occurrence.offset - expandedBefore
      if (!actions.insertText('', { start, end: start + 1, draftRev: state.draftRev })) return
      batches.remove(occurrence.ref)
    }
  }
  store.clear()
}

export function disposeReviewInput(): void {
  batches.clear()
}

/** Track in-flight batches even after the user leaves their chat or hides the Dock. */
export function registerReviewInputTracking(sessions: ISessions): () => void {
  const bindings = new Map<string, { identity: unknown; dispose: () => void }>()
  const sync = () => {
    const wanted = batches.sessionIds()
    for (const [id, binding] of bindings) {
      if (!wanted.has(id) || sessions.binding(id as SessionId) !== binding.identity) {
        binding.dispose()
        bindings.delete(id)
      }
    }
    for (const id of wanted) {
      if (bindings.has(id)) continue
      const identity = sessions.binding(id as SessionId)
      if (identity) {
        bindings.set(id, { identity, dispose: bindReviewInputAdmission(sessions, id) })
      }
    }
  }
  const offBatches = batches.subscribe(sync)
  const offList = sessions.list.subscribe(sync)
  sync()
  return () => {
    offList()
    offBatches()
    for (const binding of bindings.values()) binding.dispose()
    bindings.clear()
  }
}
