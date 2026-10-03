import { useEffect } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { ReviewCommentStore } from './review-comments.ts'
import {
  isAdmittedDiscussionState,
  type DiscussionSnapshot,
  type ReviewDiscussionStore,
} from './review-discussions.ts'

/** Reattach when the host replaces a session binding, including after reconnect. */
export function useReviewDiscussionEvents(
  ctx: Context,
  sessionId: string,
  store: ReviewDiscussionStore,
): void {
  useEffect(() => {
    const sessions = (ctx as Context & { sessions: ISessions }).sessions
    let source: NonNullable<ReturnType<ISessions['binding']>>['eventSource'] | undefined
    let unsubscribe: (() => void) | undefined

    const attach = () => {
      const next =
        typeof sessions.binding === 'function'
          ? sessions.binding(sessionId as SessionId)?.eventSource
          : undefined
      if (source === next) return
      unsubscribe?.()
      source = next
      if (!next) return
      const sync = () => store.reconcile(next.getSnapshot().entries)
      unsubscribe = next.subscribe(sync)
      sync()
    }

    attach()
    const unsubscribeList = sessions.list?.subscribe(attach)
    return () => {
      unsubscribe?.()
      unsubscribeList?.()
    }
  }, [ctx, sessionId, store])
}

/** Preserve newly edited drafts while removing the exact opinions accepted by the host. */
export function useAdmittedReviewComments(
  discussions: DiscussionSnapshot,
  store: ReviewCommentStore,
): void {
  useEffect(() => {
    for (const discussion of discussions.records) {
      if (discussion.userSeq !== undefined || isAdmittedDiscussionState(discussion.state)) {
        store.acknowledge(discussion.comments)
      }
    }
  }, [discussions, store])
}
