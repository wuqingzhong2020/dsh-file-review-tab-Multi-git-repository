import { useState } from 'react'
import { useReviewFileOpener } from './review-navigation.tsx'
import type { GitReviewDiff, GitReviewFile as GitReviewFileChange } from '../git-review-types.ts'
import { UnifiedDiff } from './UnifiedDiff.tsx'
import { t } from './locales.ts'
import { localizeReviewMessage } from './message-locales.ts'
import { resolveSessionPath } from './session-changes.ts'
import { ReviewFileCommentButton, ReviewFileCommentThread } from './ReviewComments.tsx'
import type { ReviewCommentTarget } from './review-comments.ts'
import css from './FileReviewTab.module.css'

interface GitReviewFileProps {
  readonly file: GitReviewFileChange
  readonly target: ReviewCommentTarget
  readonly sourceKey: string
  readonly open: boolean
  readonly diff: GitReviewDiff | string | null | undefined
  readonly onToggle: () => void
}

/** Controlled Git file display; comparison requests and loading stay in the panel. */
export function GitReviewFile({
  file,
  target,
  sourceKey,
  open,
  diff,
  onToggle,
}: GitReviewFileProps) {
  const openFile = useReviewFileOpener()
  const [openError, setOpenError] = useState<string | null>(null)
  const openInEditor = () => {
    setOpenError(null)
    try { openFile(resolveSessionPath(file.repository, file.path)) }
    catch (error) { setOpenError(error instanceof Error ? error.message : t('sidebarOpenFailed')) }
  }
  return (
    <li className={css.fileItem}>
      <div className={css.fileRow}>
        <button
          className={css.gitFileName}
          type="button"
          aria-expanded={open}
          title={file.path}
          onClick={onToggle}
        >
          <span>{open ? '⌄' : '›'}</span>
          <span className={css.fileName}>
            {file.oldPath ? `${file.oldPath} → ${file.path}` : file.path}
          </span>
        </button>
        <span className={css.stateBadge}>{file.status}</span>
        {file.binary ? (
          <span className={css.stateBadge}>{t('reviewBinary')}</span>
        ) : (
          <span className={css.stats}>
            <span className={css.added}>+{file.added}</span>
            <span className={css.removed}>-{file.removed}</span>
          </span>
        )}
        <ReviewFileCommentButton target={target} />
        {file.status !== 'D' && (
          <button
            className={`${css.smallButton} ${css.editorButton}`}
            type="button"
            onClick={openInEditor}
          >
            {t('openInEditor')}
          </button>
        )}
      </div>
      <ReviewFileCommentThread target={target} />
      {openError && <p role="alert">{t('sidebarOpenFailed')} {openError}</p>}
      {open && (
        <div className={css.diffWrap}>
          <GitReviewFileDiff diff={diff} sourceKey={sourceKey} target={target} />
        </div>
      )}
    </li>
  )
}

function GitReviewFileDiff({
  diff,
  sourceKey,
  target,
}: {
  readonly diff: GitReviewDiff | string | null | undefined
  readonly sourceKey: string
  readonly target: ReviewCommentTarget
}) {
  if (diff === null || diff === undefined) return <p>{t('reviewLoading')}</p>
  if (typeof diff === 'string') return <p role="alert">{localizeReviewMessage(diff)}</p>
  if (diff.diffs.length === 0) {
    return (
      <p>
        {diff.binary ? t('reviewBinaryHint') : t('reviewMetadataOnly')}
        {diff.note ? ` (${localizeReviewMessage(diff.note)})` : ''}
      </p>
    )
  }
  return (
    <UnifiedDiff
      diffs={diff.diffs}
      sourceKey={sourceKey}
      reviewTarget={target}
      contextLines={3}
      showCopyButton
      showFileHeaders={false}
      labels={{
        copy: t('copy'),
        copied: t('copied'),
        expandContext: (count, remaining) => t('expandContext', { count, remaining }),
        collapseContext: t('collapseContext'),
        unavailableContext: count => t('unavailableContext', { count }),
      }}
    />
  )
}
