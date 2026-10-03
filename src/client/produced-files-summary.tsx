/** Stateless turn summary; inspection and undo/redo remain in ProducedFiles. */
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { FileReviewAction } from '../change-types.ts'
import { basename, type ProducedFileReview } from './turn-deliverables.ts'
import type { NS } from './chat-locales.ts'
import type { UnifiedDiffStats } from './UnifiedDiff.tsx'
import css from './ProducedFiles.module.css'

/** Keep the turn-tail card compact; the sidebar tab always lists every file. */
const SHOWN_LIMIT = 6

interface ProducedFileStats {
  readonly review: ProducedFileReview
  readonly stats: UnifiedDiffStats
}

interface ProducedFilesSummaryProps {
  readonly reviews: readonly ProducedFileStats[]
  readonly totalStats: UnifiedDiffStats
  readonly allPaths: readonly string[]
  readonly hasReversibleFiles: boolean
  readonly toggleDisabled: boolean
  readonly togglePending: boolean
  readonly toggleAction: FileReviewAction
  readonly onToggle: () => void
  readonly onReview: (paths: readonly string[]) => void
  readonly t: PropsLocale<typeof NS>['t']
}

function summaryTitle(
  count: number,
  allDeleted: boolean,
  t: ProducedFilesSummaryProps['t'],
): string {
  if (allDeleted) {
    return count === 1
      ? t('produced.deletedOne')
      : t('produced.deletedAll', { count: String(count) })
  }
  return count === 1 ? t('produced.editedOne') : t('produced.edited', { count: String(count) })
}

function FileIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={css.icon}>
      <path d="M5.25 2.75h6l3.5 3.5v10a1 1 0 0 1-1 1h-8.5a1 1 0 0 1-1-1V3.75a1 1 0 0 1 1-1Z" />
      <path d="M11.25 2.75v3.5h3.5M7 10h5M7 13h5" />
    </svg>
  )
}

function ReviewIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={css.buttonIcon}>
      <path d="M4.5 3.5h8a1 1 0 0 1 1 1v3M6.5 6.5h4M6.5 9.5h2.25" />
      <path d="m10.5 13 1.5 1.5 3.5-4" />
    </svg>
  )
}

function Stats({ stats, label }: { readonly stats: UnifiedDiffStats; readonly label: string }) {
  return (
    <span className={css.stats} aria-label={label}>
      <span className={css.added}>+{stats.added}</span>
      <span className={css.removed}>-{stats.removed}</span>
    </span>
  )
}

export function ProducedFilesSummary({
  reviews,
  totalStats,
  allPaths,
  hasReversibleFiles,
  toggleDisabled,
  togglePending,
  toggleAction,
  onToggle,
  onReview,
  t,
}: ProducedFilesSummaryProps) {
  const shown = reviews.slice(0, SHOWN_LIMIT)
  const hidden = reviews.length - shown.length
  // A turn that only deleted files reads as a deletion summary, not an edit.
  const allDeleted = reviews.length > 0 && reviews.every(({ review }) => review.deleted === true)
  const statsMatter = totalStats.added > 0 || totalStats.removed > 0
  const actionLabel = toggleAction === 'undo' ? 'produced.undo' : 'produced.redo'
  const pendingLabel = toggleAction === 'undo' ? 'produced.undoing' : 'produced.redoing'
  return (
    <section className={css.card} aria-label={t('produced.summary')}>
      <header className={css.cardHeader}>
        <span className={css.fileIconWrap}>
          <FileIcon />
        </span>
        <div className={css.cardTitleBlock}>
          <span className={css.cardTitle}>{summaryTitle(reviews.length, allDeleted, t)}</span>
          {statsMatter && (
            <Stats
              stats={totalStats}
              label={t('review.stats', {
                added: String(totalStats.added),
                removed: String(totalStats.removed),
              })}
            />
          )}
        </div>
        <button
          type="button"
          className={css.toggleButton}
          disabled={toggleDisabled}
          title={!hasReversibleFiles ? t('produced.toggleUnavailable') : undefined}
          aria-label={t(actionLabel)}
          onClick={onToggle}
        >
          {t(togglePending ? pendingLabel : actionLabel)}
        </button>
        <button
          type="button"
          className={css.reviewButton}
          aria-label={t('produced.reviewAll')}
          onClick={() => {
            onReview(allPaths)
          }}
        >
          <ReviewIcon />
          {t('review.title')}
        </button>
      </header>
      <div className={css.fileList}>
        {shown.map(({ review, stats }) => (
          <button
            key={review.path}
            type="button"
            className={css.fileRow}
            title={review.path}
            aria-label={t('produced.review', { name: review.path })}
            onClick={() => {
              onReview([review.path])
            }}
          >
            <span className={css.fileName}>{basename(review.path)}</span>
            {review.deleted === true ? (
              <span className={css.deletedBadge}>{t('produced.deleted')}</span>
            ) : (
              <Stats
                stats={stats}
                label={t('review.stats', {
                  added: String(stats.added),
                  removed: String(stats.removed),
                })}
              />
            )}
          </button>
        ))}
        {hidden > 0 && (
          <div className={css.moreFiles}>
            {hidden === 1 ? t('produced.moreOne') : t('produced.more', { count: String(hidden) })}
          </div>
        )}
      </div>
    </section>
  )
}
