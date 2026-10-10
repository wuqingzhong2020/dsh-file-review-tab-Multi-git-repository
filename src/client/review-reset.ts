/** Read-only reset boundaries from the official Session event window and Inbox projection. */
import type { ISessions, SessionBinding } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionId, SessionSeq } from '@deepseek-ai/dsh-session/types'
import type { Context } from '@deepseek-ai/cordis'
import { normalizeSnapshot } from './snapshot-compat.ts'
import { t } from './locales.ts'

export function durableReviewSeqs(entries: readonly unknown[]): number[] {
  const seqs: number[] = []
  for (const raw of entries) {
    const entry = raw as { type?: unknown; event?: { seq?: unknown } }
    if (entry.type !== 'event') continue
    const seq = entry.event?.seq
    if (typeof seq !== 'number' || !Number.isSafeInteger(seq) || seq < 1) throw new Error(t('reviewResetNotReady'))
    seqs.push(seq)
  }
  return seqs
}
export function captureReviewBoundary(ctx: Context, sessions: ISessions, sessionId: string): number {
  const binding = sessions.binding(sessionId as SessionId)
  if (!binding) throw new Error(t('reviewResetNotReady'))
  const state = binding.session.getSnapshot()
  const window = binding.eventSource.getSnapshot()
  if (state.removed || state.loadingOlder || state.openError || (state.openState !== 'open' && !state.blank)
    || typeof window.hasMore !== 'boolean') throw new Error(t('reviewResetNotReady'))
  const inbox = binding.session.projections.faceOf('inbox').getSnapshot() as
    { 'next-turn'?: unknown; 'next-step'?: unknown } | undefined
  const seqs = durableReviewSeqs(window.entries)
  const empty = state.blank && seqs.length === 0 && !window.hasMore
  if (!empty && seqs.length === 0) throw new Error(t('reviewResetNotReady'))
  if (!empty && (!inbox || !Array.isArray(inbox['next-turn']) || !Array.isArray(inbox['next-step'])))
    throw new Error(t('reviewResetNotReady'))
  if (state.running || state.awaitingFirstTurn || state.pendingSubmissions.length
    || (Array.isArray(inbox?.['next-turn']) && inbox['next-turn'].length)
    || (Array.isArray(inbox?.['next-step']) && inbox['next-step'].length)) throw new Error(t('reviewResetBusy'))
  const ui = ctx.get('uiConversation') as { binding(id: SessionId): { snapshot: { getSnapshot(): unknown } } } | undefined
  const view = normalizeSnapshot(ui?.binding(sessionId as SessionId).snapshot.getSnapshot())
  if (!view) throw new Error(t('reviewResetNotReady'))
  if (view.partial !== null || view.runningCalls.length) throw new Error(t('reviewResetBusy'))
  return seqs.reduce((maximum, seq) => Math.max(maximum, seq), 0)
}
export function reviewHistoryCovered(binding: SessionBinding, boundarySeq: number): boolean {
  const state = binding.session.getSnapshot()
  const window = binding.eventSource.getSnapshot()
  if (state.loadingOlder || state.openError || state.removed) return false
  const seqs = durableReviewSeqs(window.entries)
  if (boundarySeq === 0 && state.blank && seqs.length === 0 && window.hasMore === false) return true
  if (state.openState !== 'open') return false
  if (seqs.reduce((maximum, seq) => Math.max(maximum, seq), 0) < boundarySeq) return false
  return window.hasMore === false || (seqs.length > 0 && seqs.reduce((minimum, seq) => Math.min(minimum, seq), Infinity) <= boundarySeq)
}
export async function loadReviewHistory(binding: SessionBinding, boundarySeq: number): Promise<void> {
  if (!reviewHistoryCovered(binding, boundarySeq))
    await binding.session.loadThrough((boundarySeq || 1) as SessionSeq)
  if (!reviewHistoryCovered(binding, boundarySeq)) throw new Error(t('reviewResetNotReady'))
}
