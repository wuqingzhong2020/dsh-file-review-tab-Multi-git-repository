import { useEffect, useMemo, useState } from 'react'
import { ARCHIVE_PAGE_TURNS, splitArchivedTurns, type TurnFileChanges } from './session-changes.ts'
import type { ReviewMode } from './file-review-model.ts'
import { sessionScopeBehavior } from './review-scope-model.ts'

const ARCHIVE_STORAGE_PREFIX = 'dsh-file-review-tab-multi-git-repository:archive:'
const LEGACY_ARCHIVE_STORAGE_PREFIX = 'dsh-file-review-tab:archive:'

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
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [archivePages, setArchivePages] = useState(1)
  // Archive UI state persists per session, so reopening a long session
  // doesn't re-mount everything the user already collapsed away.
  useEffect(() => {
    try {
      const storageKey = `${ARCHIVE_STORAGE_PREFIX}${sessionId}`
      let raw = window.localStorage.getItem(storageKey)
      if (raw === null) {
        raw = window.localStorage.getItem(`${LEGACY_ARCHIVE_STORAGE_PREFIX}${sessionId}`)
        if (raw !== null) window.localStorage.setItem(storageKey, raw)
      }
      const parsed =
        raw === null ? undefined : (JSON.parse(raw) as { open?: unknown; pages?: unknown })
      setArchiveOpen(parsed?.open === true)
      setArchivePages(
        typeof parsed?.pages === 'number' && Number.isInteger(parsed.pages) && parsed.pages >= 1
          ? parsed.pages
          : 1,
      )
    } catch {
      setArchiveOpen(false)
      setArchivePages(1)
    }
  }, [sessionId])
  useEffect(() => {
    try {
      window.localStorage.setItem(
        `${ARCHIVE_STORAGE_PREFIX}${sessionId}`,
        JSON.stringify({ open: archiveOpen, pages: archivePages }),
      )
    } catch {
      // Storage unavailable (private mode &c.): archive state stays in-memory.
    }
  }, [sessionId, archiveOpen, archivePages])
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
