import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { parseArchive, reviewStateFor } from './review-session-state.ts'
import type { SetStateAction } from 'react'
import { ARCHIVE_PAGE_TURNS, splitArchivedTurns, type TurnFileChanges } from './session-changes.ts'
import type { ReviewMode } from './file-review-model.ts'
import { sessionScopeBehavior } from './review-scope-model.ts'

/** Pending queues page newest-first; other session scopes use a saved archive. */
export function useFileReviewArchive(
  sessionId: string,
  filteredTurns: readonly TurnFileChanges[],
  reviewMode: ReviewMode,
  pendingPages: number,
) {
  const pendingQueue = sessionScopeBehavior(reviewMode).pagination === 'pending'
  // Older completed turns mount only after the archive opens, one page at a time.
  const { main: mainTurns, archived: archivedTurns } = useMemo(() => {
    if (!pendingQueue) return splitArchivedTurns(filteredTurns)
    // Pending turns always stay in the review queue, sorted newest-first.
    const main = [...filteredTurns]
      .sort((left, right) => right.turn - left.turn)
      .slice(0, pendingPages * ARCHIVE_PAGE_TURNS)
    return { main, archived: [] }
  }, [filteredTurns, pendingQueue, pendingPages])
  const pendingRemaining = pendingQueue ? filteredTurns.length - mainTurns.length : 0
  const store = useMemo(() => reviewStateFor(sessionId), [sessionId])
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
  const archive = useMemo(() => parseArchive(state.slices.archive), [state.slices.archive])
  const archiveOpen = archive.open
  const archivePages = archive.pages
  const update = useCallback((field: 'open' | 'pages', value: SetStateAction<boolean> | SetStateAction<number>) => {
    const current = parseArchive(store.getSnapshot().slices.archive)
    const next = typeof value === 'function' ? (value as (previous: boolean | number) => boolean | number)(current[field]) : value
    store.sliceStorage('archive').setItem('', JSON.stringify({ ...current, [field]: next }))
  }, [store])
  const setArchiveOpen = useCallback((value: SetStateAction<boolean>) => update('open', value), [update])
  const setArchivePages = useCallback((value: SetStateAction<number>) => update('pages', value), [update])
  // Collapsed ⇒ nothing from the archive mounts; open ⇒ the loaded pages only.
  const archivedVisible = useMemo(
    () => (archiveOpen ? archivedTurns.slice(0, archivePages * ARCHIVE_PAGE_TURNS) : []),
    [archiveOpen, archivePages, archivedTurns],
  )
  const archivedRemaining = archivedTurns.length - archivedVisible.length
  const renderedTurns = useMemo(
    () => [...mainTurns, ...archivedVisible],
    [mainTurns, archivedVisible],
  )

  return {
    mainTurns,
    archivedTurns,
    archivedVisible,
    renderedTurns,
    pendingRemaining,
    archivedRemaining,
    archiveOpen,
    setArchiveOpen,
    setArchivePages,
  }
}
