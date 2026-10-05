/**
 * Turn-tail summary of paths and hunks from mutation-tool results.
 * Sidebar navigation passes the selected paths and owning turn to the opener;
 * inspection and undo/redo requests keep the original reversible diff data.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { TurnTailOwnerProps } from '@deepseek-ai/dsh-client-ui-chat/client'
import type { FileReviewAction, FileReviewRequest, FileReviewResult } from '../change-types.ts'
import { basename, type ProducedFileReview } from './turn-deliverables.ts'
import type { NS } from './chat-locales.ts'
import { useReviewLocale } from './use-review-locale.ts'
import { localizeReviewMessage } from './message-locales.ts'
import { t as reviewText } from './locales.ts'
import { summarizeDiffs, type UnifiedDiffStats } from './UnifiedDiff.tsx'
import { addStats, isReversible } from './file-review-model.ts'
import { ProducedFilesSummary } from './produced-files-summary.tsx'
import { ResultToast, type NoticeFile, type ToggleNotice } from './produced-files-toast.tsx'

/** Matched file reviews plus the opener and locale supplied by the turn-tail slot. */
export type ProducedFilesProps = Pick<TurnTailOwnerProps, 'openFile' | 'turn'> & {
  matched: readonly ProducedFileReview[]
  /** Session workspace root (reserved; the chat card shows tool paths verbatim). */
  projectRoot?: string | undefined
  inspectChanges?: (request: FileReviewRequest) => Promise<FileReviewResult>
  applyChanges?: (request: FileReviewRequest) => Promise<FileReviewResult>
  /**
   * Open the plugin's sidebar tab with the given paths pre-expanded
   * (the 审查 button passes every produced path; a file chip passes its own).
   * The owning turn number rides along so the tab expands only this turn's
   * rows — a path that recurs in other turns stays collapsed there.
   */
  openInSidebarTab?: (paths: readonly string[], turn?: number) => void
} & PropsLocale<typeof NS>

const unavailableChanges = async (request: FileReviewRequest): Promise<FileReviewResult> => ({
  files: request.files.map(file => ({
    path: file.path,
    state: 'unsupported',
    changed: false,
    reason: 'Host file toggle is unavailable',
  })),
})

function noticeDescription(notice: ToggleNotice, t: ProducedFilesProps['t']): string | undefined {
  if (notice.descriptionKey) return t(notice.descriptionKey)
  if (notice.description === undefined) return undefined
  return localizeReviewMessage(notice.description)
}

/** Render one turn's produced files as a summary card opening the sidebar tab. */
export function ProducedFiles({
  matched: reviews,
  openFile,
  turn: turnLocation,
  inspectChanges = unavailableChanges,
  applyChanges = unavailableChanges,
  openInSidebarTab,
  t,
}: ProducedFilesProps) {
  useReviewLocale()
  // The owning turn number (TurnLocation.turn) rides every deep link so the
  // sidebar tab expands this turn's rows only.
  const turnNumber = turnLocation.turn
  const [toggleAction, setToggleAction] = useState<FileReviewAction>('undo')
  const [statusPending, setStatusPending] = useState(true)
  const [togglePending, setTogglePending] = useState(false)
  const [toast, setToast] = useState<ToggleNotice | null>(null)
  const [navigationError, setNavigationError] = useState<string | null>(null)
  const toastSeqRef = useRef(0)

  const reviewsWithStats = useMemo(
    () =>
      reviews.map(review => ({
        review,
        stats: summarizeDiffs(review.diffs),
      })),
    [reviews],
  )
  const totalStats = useMemo(
    () =>
      reviewsWithStats.reduce<UnifiedDiffStats>((total, item) => addStats(total, item.stats), {
        added: 0,
        removed: 0,
      }),
    [reviewsWithStats],
  )
  // Deleted paths carry no hunks and cannot be inspected or toggled; they are
  // display vocabulary on the chips only.
  const toggleFiles = useMemo(
    () =>
      reviews
        .filter(review => review.deleted !== true)
        .map(review => ({ path: review.path, diffs: review.diffs })),
    [reviews],
  )
  const reversiblePaths = useMemo(
    () => new Set(reviews.filter(isReversible).map(review => review.path)),
    [reviews],
  )
  const hasReversibleFiles = reversiblePaths.size > 0
  const allPaths = useMemo(() => reviews.map(review => review.path), [reviews])

  const showToast = useCallback((notice: Omit<ToggleNotice, 'seq'>) => {
    toastSeqRef.current += 1
    setToast({ seq: toastSeqRef.current, ...notice })
  }, [])

  const phaseForResult = useCallback(
    (result: FileReviewResult, currentAction: FileReviewAction): FileReviewAction => {
      if (reversiblePaths.size === 0) return 'undo'
      const byPath = new Map(result.files.map(file => [file.path, file]))
      const target = currentAction === 'undo' ? 'undone' : 'applied'
      return [...reversiblePaths].every(path => byPath.get(path)?.state === target)
        ? currentAction === 'undo'
          ? 'redo'
          : 'undo'
        : currentAction
    },
    [reversiblePaths],
  )

  useEffect(() => {
    let active = true
    setStatusPending(true)
    void inspectChanges({ action: 'undo', files: toggleFiles })
      .then(result => {
        if (!active) return
        const allUndone =
          reversiblePaths.size > 0 &&
          [...reversiblePaths].every(
            path => result.files.find(file => file.path === path)?.state === 'undone',
          )
        setToggleAction(allUndone ? 'redo' : 'undo')
      })
      .catch(() => {
        // The action remains usable after a transient inspection failure; execution
        // performs the same Host-side checks again.
      })
      .finally(() => {
        if (active) setStatusPending(false)
      })
    return () => {
      active = false
    }
  }, [inspectChanges, reversiblePaths, toggleFiles])

  const runToggle = useCallback(() => {
    if (statusPending || togglePending || !hasReversibleFiles) return
    const action = toggleAction
    setTogglePending(true)
    void applyChanges({ action, files: toggleFiles })
      .then(result => {
        setToggleAction(phaseForResult(result, action))
        const targetState = action === 'undo' ? 'undone' : 'applied'
        const byPath = new Map(result.files.map(file => [file.path, file]))
        const failures: NoticeFile[] = toggleFiles.flatMap(file => {
          const outcome = byPath.get(file.path)
          if (outcome?.state === targetState) return []
          return [{ path: file.path }]
        })
        if (failures.length === 0) {
          showToast({
            tone: 'success',
            title: action === 'undo' ? 'produced.undoSuccess' : 'produced.redoSuccess',
            files: [],
          })
          return
        }
        showToast({
          tone: 'error',
          title: action === 'undo' ? 'produced.undoPartial' : 'produced.redoPartial',
          descriptionKey:
            action === 'undo'
              ? 'produced.undoPartialDescription'
              : 'produced.redoPartialDescription',
          files: failures,
        })
      })
      .catch((error: unknown) => {
        showToast({
          tone: 'error',
          title: action === 'undo' ? 'produced.undoError' : 'produced.redoError',
          description: error instanceof Error ? error.message : String(error),
          files: [],
        })
      })
      .finally(() => {
        setTogglePending(false)
      })
  }, [
    applyChanges,
    hasReversibleFiles,
    phaseForResult,
    showToast,
    t,
    statusPending,
    toggleAction,
    toggleFiles,
    togglePending,
  ])

  return (
    <>
      <ProducedFilesSummary
        reviews={reviewsWithStats}
        totalStats={totalStats}
        allPaths={allPaths}
        hasReversibleFiles={hasReversibleFiles}
        toggleDisabled={statusPending || togglePending || !hasReversibleFiles}
        togglePending={togglePending}
        toggleAction={toggleAction}
        onToggle={runToggle}
        onReview={paths => {
          setNavigationError(null)
          try { openInSidebarTab?.(paths, turnNumber) }
          catch (error) {
            console.error('[file-review] review navigation failed:', error)
            setNavigationError(error instanceof Error ? error.message : reviewText('sidebarUnavailable'))
          }
        }}
        t={t}
      />

      {navigationError && <p role="alert">{navigationError}</p>}

      {toast !== null && (
        <ResultToast
          key={toast.seq}
          notice={{ ...toast, title: t(toast.title), description: noticeDescription(toast, t) }}
          closeLabel={t('produced.noticeClose')}
          dismissLabel={t('produced.noticeDismiss')}
          fileListLabel={t('produced.skippedFiles', { count: String(toast.files.length) })}
          fileOpenLabel={path => t('produced.open', { name: basename(path) })}
          openFile={openFile}
          onDone={() => {
            setToast(current => (current?.seq === toast.seq ? null : current))
          }}
        />
      )}
    </>
  )
}
