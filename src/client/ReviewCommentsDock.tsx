import { useMemo, useState, useSyncExternalStore } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import { commentStoreFor, discussionStoreFor } from './review-comment-context.ts'
import { attachReviewInput, clearReviewInput } from './review-input.ts'
import { submitReviewCommentBatch } from './review-comment-submission.ts'
import { useReviewDiscussionEvents, useAdmittedReviewComments } from './use-review-discussion-events.ts'
import { useDiffViewPreferences } from './DiffViewControls.tsx'
import type { ReviewComment } from './review-comments.ts'
import { t } from './locales.ts'
import { useReviewLocale } from './use-review-locale.ts'
import { commentPositionLabel, commentScopeLabel } from './review-comment-labels.ts'
import css from './ReviewComments.module.css'

type ReviewCommentsDockProps = PropsRuntime<'conversation.input.dock'> & {
  ctx: Context
  sessionId: string
}

function PendingCommentsPreview({ comments }: { comments: readonly ReviewComment[] }) {
  return (
    <details className={css.dockPreview}>
      <summary>{t('reviewPacketCount', { count: comments.length })}</summary>
      {comments.map(comment => (
        <article className={css.card} key={comment.id}>
          <strong>
            {comment.anchor.repositoryName} · {comment.anchor.path} · {commentPositionLabel(comment.anchor)}
          </strong>
          <small className={css.meta}>
            {commentScopeLabel(comment.anchor.scope)}
            {comment.anchor.turn !== undefined && ` · ${t('turn', { n: comment.anchor.turn })}`}
            {(comment.anchor.ref ?? comment.anchor.revision) && ` · ${comment.anchor.ref ?? comment.anchor.revision}`}
          </small>
          {comment.anchor.quote && <pre className={css.quote}>{comment.anchor.quote}</pre>}
          <p className={css.commentText}>{comment.text}</p>
        </article>
      ))}
    </details>
  )
}

export function ReviewCommentsDock({ ctx, sessionId, inputActions }: ReviewCommentsDockProps) {
  useReviewLocale()
  const store = useMemo(() => commentStoreFor(sessionId), [sessionId])
  const discussionStore = useMemo(() => discussionStoreFor(sessionId), [sessionId])
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
  const discussions = useSyncExternalStore(
    discussionStore.subscribe,
    discussionStore.getSnapshot,
    discussionStore.getSnapshot,
  )
  const preferences = useDiffViewPreferences()
  const [notice, setNotice] = useState('')
  const sessions = ctx.sessions as unknown as ISessions
  useReviewDiscussionEvents(ctx, sessionId, discussionStore)
  useAdmittedReviewComments(discussions, store)

  const attach = () => {
    try {
      const attached = attachReviewInput(ctx, sessions, sessionId, inputActions, preferences.discussionEnabled)
      setNotice(attached ? '' : t('reviewAttachUnavailable'))
    } catch (error) {
      setNotice(String(error))
    }
  }
  const submit = async () => {
    setNotice('')
    try {
      await store.submit(comments => submitReviewCommentBatch({
        ctx,
        sessionId,
        comments,
        discussions: discussions.records,
        discussionStore,
        discussionEnabled: preferences.discussionEnabled,
      }))
    } catch (error) {
      setNotice(String(error))
    }
  }
  if (!snapshot.comments.length || !preferences.dock) return null
  return (
    <section className={css.dock} data-review-comments-dock="">
      <div className={css.toolbar}>
        <PendingCommentsPreview comments={snapshot.comments} />
        <button className={css.button} disabled={snapshot.busy} onClick={attach}>
          {t('reviewAttach')}
        </button>
        <button className={css.button} disabled={snapshot.busy} onClick={() => { void submit() }}>
          {t(snapshot.busy ? 'commentSending' : 'commentSubmit')}
        </button>
        <button
          className={css.button}
          disabled={snapshot.busy}
          onClick={() => clearReviewInput(ctx, sessions, sessionId, inputActions)}
        >
          {t('reviewClear')}
        </button>
      </div>
      {notice && <p role="status" className={css.notice}>{notice}</p>}
    </section>
  )
}
