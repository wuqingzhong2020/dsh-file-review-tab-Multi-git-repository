import { FILE_REVIEW_REMOTE_NAMESPACE } from '../service-names.ts'
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import type { ConversationSnapshot } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { RecordedResult } from '../change-types.ts'
import { deriveSessionChanges, deriveSessionRoots, mergeRecordedTurns } from './session-changes.ts'
import type { FileReviewRemote } from './file-review-model.ts'

/** Observable target-neutral Conversation snapshot source (DSH 0.2). */
interface ConversationSource {
  getSnapshot(): ConversationSnapshot
  subscribe(listener: () => void): () => void
}

/** The slice of `ctx.uiConversation` this tab needs. */
interface UiConversationFace {
  binding(id: SessionId): { readonly snapshot: ConversationSource }
}

/** Read the conversation and merge Host-only nested Code Mode mutations. */
export function useFileReviewConversation(
  ctx: Context,
  sessions: ISessions,
  sessionId: string,
  visible: boolean,
  tick: number,
) {
  // Live target-neutral Conversation projection for THIS session. DSH 0.2
  // keeps Chat-owned transcript state under the `chat` entry of `views`.
  const uiConversation = (ctx as unknown as { get(name: string): unknown }).get(
    'uiConversation',
  ) as UiConversationFace | undefined
  let conversationSource: ConversationSource | undefined
  try {
    conversationSource = uiConversation?.binding(sessionId as SessionId).snapshot
  } catch {
    // The session may not have a binding yet (fresh/archived); the tab shows
    // its empty state and re-derives once a snapshot is available.
    conversationSource = undefined
  }
  const subscribe = useCallback(
    (listener: () => void) => visible ? conversationSource?.subscribe(listener) ?? (() => {}) : () => {},
    [conversationSource, visible],
  )
  const retainedSnapshot = useRef<ConversationSnapshot | null>(null)
  const getSnapshot = useCallback(() => {
    if (visible) retainedSnapshot.current = conversationSource?.getSnapshot() ?? null
    return retainedSnapshot.current
  }, [conversationSource, visible])
  const snapshot = useSyncExternalStore(subscribe, getSnapshot)

  // Code Mode (run_code) roots and their Host-recorded mutations: nested
  // dispatches carry no reuseable views, so each root's file changes are
  // fetched async and merged into the snapshot-derived turns below. The
  // fetch re-arms on the root set (a new run_code turn) or a manual refresh.
  const roots = useMemo(() => (snapshot === null ? [] : deriveSessionRoots(snapshot)), [snapshot])
  const rootsKey = useMemo(() => roots.map(root => root.rootCallId).join('|'), [roots])
  const [recorded, setRecorded] = useState<{
    sessionId: string
    rootsKey: string
    result: RecordedResult
  } | null>(null)
  useEffect(() => {
    if (!visible || roots.length === 0) return
    let active = true
    const timer = window.setTimeout(() => {
      const scope = sessions.scope(sessionId as SessionId)
      const remote = scope?.get(FILE_REVIEW_REMOTE_NAMESPACE) as FileReviewRemote | undefined
      if (scope === undefined || remote === undefined) {
        active = false
        return
      }
      remote
        .recorded({ rootCallIds: roots.map(root => root.rootCallId) })
        .then(result => {
          if (!result.ok || !active) return
          setRecorded({ sessionId, rootsKey, result: result.value })
        })
        .catch(() => {
          // Transient fetch failure: keep the previous record; the next
          // snapshot / refresh round retries.
        })
    }, 200)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, rootsKey, tick, sessions, sessionId, snapshot])

  const currentRecords = recorded?.sessionId === sessionId ? recorded : null
  const turns = useMemo(
    () => mergeRecordedTurns(deriveSessionChanges(snapshot), roots, currentRecords?.result.mutations ?? []),
    [snapshot, roots, currentRecords],
  )
  const ready = snapshot !== null && (roots.length === 0 || currentRecords?.rootsKey === rootsKey)
  return {
    snapshot,
    turns,
    recordedWarnings: currentRecords?.result.warnings ?? [],
    ready,
  }
}
