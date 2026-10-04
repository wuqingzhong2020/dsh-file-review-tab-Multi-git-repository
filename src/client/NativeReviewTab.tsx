import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { FileReviewTab } from './FileReviewTab.tsx'
import { ReviewNavigationProvider } from './review-navigation.tsx'
import { openReviewResource } from './sidebar-navigation.ts'
import { countChangedFiles, deriveSessionChanges, splitArchivedTurns } from './session-changes.ts'
import { t } from './locales.ts'
import { useReviewLocale } from './use-review-locale.ts'
import { discardFileReviewSeed } from './deep-link.ts'

interface ReviewScope { readonly ctx: Context; readonly reviewSessionId: SessionId; readonly sessions: ISessions }
type BodyProps = PropsRuntime<'sidebar.right.pane.tab'> & ReviewScope
type TitleProps = PropsRuntime<'sidebar.right.pane.tab.title'> & ReviewScope

export function FileReviewIcon({ size = 16 }: { readonly size?: number | undefined }) {
  return <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" fill="none"
    stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5.25 2.75h6l3.5 3.5v10a1 1 0 0 1-1 1h-8.5a1 1 0 0 1-1-1V3.75a1 1 0 0 1 1-1Z" />
    <path d="M11.25 2.75v3.5h3.5M7 10h5M7 13h5" />
  </svg>
}

/** Translate native session/tab information once, outside the review business components. */
export function NativeReviewTab({ ctx, reviewSessionId: sessionId, sessions: controller, useTabInfo }: BodyProps) {
  const { tab } = useTabInfo()
  useEffect(() => {
    const discard = () => discardFileReviewSeed(sessionId)
    tab.signal.addEventListener('abort', discard, { once: true })
    return () => tab.signal.removeEventListener('abort', discard)
  }, [tab.signal, sessionId])
  const list = controller.list
  const subscribe = useCallback((notify: () => void) => list.subscribe(notify), [list])
  const getSnapshot = useCallback(() => list.getSnapshot(), [list])
  const sessions = useSyncExternalStore(subscribe, getSnapshot)
  const cwd = sessions.byId[sessionId]?.cwd
  const openFile = useCallback((path: string) => {
    openReviewResource(tab.actions, sessionId, cwd, path, tab.signal)
  }, [tab.actions, tab.signal, sessionId, cwd])
  return <ReviewNavigationProvider openFile={openFile}>
    <FileReviewTab key={sessionId} ctx={ctx} sessionId={sessionId} cwd={cwd}
      visible={tab.visible} meta={tab.navigation.params} />
  </ReviewNavigationProvider>
}

/** Titles stay subscribed while the body is hidden; no stored-title mutation is needed. */
export function NativeReviewTitle({ ctx, reviewSessionId: sessionId, sessions }: TitleProps) {
  useReviewLocale()
  // Observe existing generations without retaining a session or loading its history.
  const retention = useMemo(() => sessions.retainInfo(sessionId), [sessions, sessionId])
  const subscribeRetention = useCallback((notify: () => void) => retention.subscribe(notify), [retention])
  const getRetention = useCallback(() => retention.getSnapshot(), [retention])
  useSyncExternalStore(subscribeRetention, getRetention, getRetention)
  const binding = sessions.binding(sessionId)
  const source = useMemo(() => {
    try { return binding ? ctx.uiConversation.binding(binding).snapshot : undefined }
    catch { return undefined /* A retired binding has no live conversation projection. */ }
  }, [ctx, binding])
  const subscribe = useCallback((notify: () => void) => source?.subscribe(notify) ?? (() => {}), [source])
  const getSnapshot = useCallback(() => source?.getSnapshot() ?? null, [source])
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  // Use actual snapshot revisions, not node counts: a completed tool can update an existing node.
  const count = useMemo(() => countChangedFiles(splitArchivedTurns(deriveSessionChanges(snapshot)).main), [snapshot])
  const title = t('tabTitle')
  return <span title={title} aria-label={title} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
    <FileReviewIcon /><span>{title}</span>
    {count > 0 && <small aria-label={t('reviewFiles', { count })}>{count}</small>}
  </span>
}
