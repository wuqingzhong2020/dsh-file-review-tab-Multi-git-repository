import type { CommentScope, ReviewCommentAnchor } from './review-comments.ts'
import type { DiscussionState } from './review-discussions.ts'
import { t } from './locales.ts'

const SCOPE_LABELS = {
  'last-turn': 'reviewLastTurn',
  session: 'reviewSession',
  pending: 'reviewPending',
  uncommitted: 'reviewUncommitted',
  unstaged: 'reviewUnstaged',
  staged: 'reviewStaged',
  commit: 'reviewCommit',
  branch: 'reviewBranch',
} as const

const DISCUSSION_LABELS = {
  submitting: 'discussionSubmitting',
  queued: 'discussionQueued',
  running: 'discussionRunning',
  answered: 'discussionAnswered',
  completed: 'discussionCompleted',
  cancelled: 'discussionCancelled',
  failed: 'discussionFailed',
  unknown: 'discussionUnknown',
  unlinked: 'discussionNoCorrelation',
} as const

export function commentScopeLabel(scope: CommentScope): string {
  return t(SCOPE_LABELS[scope])
}

export function discussionStateLabel(state: DiscussionState): string {
  return t(DISCUSSION_LABELS[state])
}

export function commentPositionLabel(anchor: ReviewCommentAnchor): string {
  const isRange =
    anchor.line !== null && anchor.endLine !== undefined && anchor.endLine !== anchor.line
  if (isRange) {
    return t('referenceRange', {
      side: t(anchor.side === 'old' ? 'diffOld' : 'diffNew'),
      start: anchor.line!,
      end: anchor.endLine!,
    })
  }
  const label =
    anchor.side === 'file'
      ? 'commentWholeFile'
      : anchor.side === 'old'
        ? 'commentOldLine'
        : 'commentNewLine'
  return t(label, { line: anchor.line ?? '' })
}
