import { useMemo, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import { commentAnchorKey } from './review-comments.ts'
import {
  ReviewCommentsContext as Comments,
  commentStoreFor,
  discussionStoreFor,
  type CommentComposer,
  type ReviewCommentsContext,
} from './review-comment-context.ts'
import { CommentCard, CommentEditor, DiscussionCard } from './review-comment-components.tsx'
import { submitReviewCommentBatch } from './review-comment-submission.ts'
import {
  useAdmittedReviewComments,
  useReviewDiscussionEvents,
} from './use-review-discussion-events.ts'
import { useDiffViewPreferences } from './DiffViewControls.tsx'
import { t } from './locales.ts'
import { useReviewLocale } from './use-review-locale.ts'
import { localizeReviewMessage } from './message-locales.ts'
import css from './ReviewComments.module.css'

export { commentScopeLabel } from './review-comment-labels.ts'
export {
  ReviewCommentLine,
  ReviewFileCommentButton,
  ReviewFileCommentThread,
  ReviewOutdatedComments,
  useReviewInteractions,
} from './review-comment-components.tsx'

interface ReviewCommentsProviderProps {
  ctx: Context
  sessionId: string
  children: ReactNode
  controls?: ReactNode
}
interface SubmissionNotice {
  key: 'commentSent' | 'commentSendFailed'
  details?: string
}

/** Compose draft/discussion stores with the toolbar; card rendering and request handling live separately. */
export function ReviewCommentsProvider({
  ctx,
  sessionId,
  children,
  controls,
}: ReviewCommentsProviderProps) {
  useReviewLocale()
  const store = useMemo(() => commentStoreFor(sessionId), [sessionId])
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
  const preferences = useDiffViewPreferences()
  const discussionStore = useMemo(() => discussionStoreFor(sessionId), [sessionId])
  const discussions = useSyncExternalStore(
    discussionStore.subscribe,
    discussionStore.getSnapshot,
    discussionStore.getSnapshot,
  )
  const [composer, setComposer] = useState<CommentComposer | null>(null)
  const [open, setOpen] = useState(false)
  const [discussionOpen, setDiscussionOpen] = useState(false)
  const [notice, setNotice] = useState<SubmissionNotice | null>(null)
  useReviewDiscussionEvents(ctx, sessionId, discussionStore)
  useAdmittedReviewComments(discussions, store)

  const start: ReviewCommentsContext['start'] = (anchor, placement, comment, discussionId) => {
    if (snapshot.busy) return
    setComposer({
      anchor,
      placement,
      id: comment?.id,
      text: comment?.text ?? '',
      discussionId: discussionId ?? comment?.discussionId,
    })
    setOpen(placement === 'list')
    setNotice(null)
  }

  const submit = async () => {
    if (composer || snapshot.busy) return
    setNotice(null)
    try {
      const sent = await store.submit(comments =>
        submitReviewCommentBatch({
          ctx,
          sessionId,
          comments,
          discussions: discussions.records,
          discussionStore,
          discussionEnabled: preferences.discussionEnabled,
        }),
      )
      if (sent) {
        setNotice({ key: 'commentSent' })
        setOpen(false)
      }
    } catch (cause) {
      setNotice({
        key: 'commentSendFailed',
        details: cause instanceof Error ? cause.message : String(cause),
      })
    }
  }

  const toggleComments = () => {
    setOpen(!open)
    if (!open && composer) setComposer({ ...composer, placement: 'list' })
  }
  const hasUnreadDiscussion = discussions.records.some(
    discussion => (discussion.replies.at(-1)?.seq ?? 0) > discussion.readSeq,
  )
  return (
    <Comments.Provider
      value={{
        snapshot,
        store,
        composer,
        setComposer,
        start,
        discussions,
        discussionStore,
        ctx,
        sessionId,
      }}
    >
      <div className={css.toolbar}>
        <button type="button" className={css.button} aria-expanded={open} onClick={toggleComments}>
          {t('commentPending', { count: snapshot.comments.length })}
        </button>
        <button
          type="button"
          className={`${css.button} ${css.primary}`}
          disabled={!snapshot.comments.length || snapshot.busy || composer !== null}
          title={composer ? t('commentFinishEditing') : t('commentSendHint')}
          onClick={() => {
            void submit()
          }}
        >
          {t(snapshot.busy ? 'commentSending' : 'commentSubmit')}
        </button>
        {composer && <small>{t('commentFinishEditing')}</small>}
        <button
          type="button"
          className={css.button}
          aria-expanded={discussionOpen}
          onClick={() => setDiscussionOpen(!discussionOpen)}
        >
          {t('discussionList', { count: discussions.records.length })}
          {hasUnreadDiscussion ? ' •' : ''}
        </button>
        {controls}
      </div>
      {notice && (
        <p className={css.notice} role="status">
          {t(notice.key)}
          {notice.details ? `: ${localizeReviewMessage(notice.details)}` : ''}
        </p>
      )}
      {snapshot.storageError && (
        <p className={css.notice} role="alert">
          {t('commentStorageError')}
        </p>
      )}
      {discussions.storageError && (
        <p className={css.notice} role="alert">
          {t('discussionStorageError')}
        </p>
      )}
      {discussionOpen && (
        <div
          className={css.summary}
          aria-label={t('discussionList', { count: discussions.records.length })}
        >
          <small>{t('discussionHint')}</small>
          {!discussions.records.length && <p>{t('discussionEmpty')}</p>}
          {[...discussions.records].reverse().map(discussion => (
            <DiscussionCard key={discussion.id} discussion={discussion} />
          ))}
        </div>
      )}
      {open && (
        <div className={css.summary} aria-label={t('commentList')}>
          <small>{t('commentDraftHint')}</small>
          {snapshot.comments.length === 0 && !composer && <p>{t('commentEmpty')}</p>}
          {snapshot.comments.map(comment => (
            <CommentCard key={comment.id} comment={comment} placement="list" showFile />
          ))}
          {composer?.placement === 'list' && !composer.id && (
            <CommentEditor key={commentAnchorKey(composer.anchor)} />
          )}
        </div>
      )}
      {children}
    </Comments.Provider>
  )
}
