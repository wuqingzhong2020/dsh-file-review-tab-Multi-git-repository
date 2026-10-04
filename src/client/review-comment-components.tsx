import { useContext, useState } from 'react'
import type { FormEvent, KeyboardEvent, ReactNode } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionId, SessionSeq } from '@deepseek-ai/dsh-session/types'
import type { ReviewLocationResult } from '../review-location.ts'
import { usesWorkingTree } from '../review-scopes.ts'
import {
  COMMENT_TEXT_LIMIT,
  commentAnchorKey,
  commentFileKey,
  fileCommentAnchor,
  type ReviewComment,
  type ReviewCommentAnchor,
  type ReviewCommentTarget,
} from './review-comments.ts'
import {
  ReviewCommentsContext as Comments,
  type CommentComposer as Composer,
} from './review-comment-context.ts'
import {
  commentScopeLabel,
  commentPositionLabel as position,
  discussionStateLabel,
} from './review-comment-labels.ts'
import type { ReviewDiscussion } from './review-discussions.ts'
import { referenceRequest, reviewLocation } from './review-file-opener.ts'
import { t } from './locales.ts'
import css from './ReviewComments.module.css'

export function CommentEditor() {
  const context = useContext(Comments)
  if (!context?.composer) return null
  const { composer, setComposer, store, snapshot } = context
  const save = () => {
    if (!composer.text.trim() || snapshot.busy) return
    store.save(composer.anchor, composer.text, composer.id, composer.discussionId)
    setComposer(null)
  }
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    save()
  }
  const handleEditorKey = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      setComposer(null)
    } else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      save()
    }
  }
  return (
    <form className={css.card} data-review-comment-editor="" onSubmit={submit}>
      <div className={css.cardHeader}>
        <strong>{t('commentYou')}</strong>
        <small>{position(composer.anchor)}</small>
      </div>
      {composer.placement === 'list' && (
        <small className={css.meta}>
          {composer.anchor.repositoryName} · {composer.anchor.path} ·{' '}
          {commentScopeLabel(composer.anchor.scope)}
        </small>
      )}
      <textarea
        autoFocus
        aria-label={t('commentPlaceholder')}
        placeholder={t('commentPlaceholder')}
        value={composer.text}
        maxLength={COMMENT_TEXT_LIMIT}
        rows={3}
        disabled={snapshot.busy}
        onChange={event => {
          setComposer({ ...composer, text: event.target.value })
        }}
        onKeyDown={handleEditorKey}
      />
      <div className={css.actions}>
        <button
          className={css.button}
          type="button"
          onClick={() => {
            setComposer(null)
          }}
        >
          {t('projectCancel')}
        </button>
        <button
          className={`${css.button} ${css.primary}`}
          type="submit"
          disabled={!composer.text.trim() || snapshot.busy}
        >
          {t(composer.id ? 'commentSave' : 'commentAdd')}
        </button>
      </div>
    </form>
  )
}
type CurrentCommentAnchor = (
  anchor: ReviewCommentAnchor,
  line: number,
) => ReviewCommentAnchor | null

interface CommentCardProps {
  comment: ReviewComment
  placement: Composer['placement']
  showFile?: boolean
  currentAnchor?: CurrentCommentAnchor | undefined
}

export function CommentCard({
  comment,
  placement,
  showFile = false,
  currentAnchor,
}: CommentCardProps) {
  const context = useContext(Comments)
  const [location, setLocation] = useState<ReviewLocationResult | null>(null)
  const [checking, setChecking] = useState(false)
  if (!context) return null
  const { composer, snapshot, start, store } = context
  if (composer?.id === comment.id && composer.placement === placement) return <CommentEditor />
  const canRelocate =
    currentAnchor && comment.anchor.side === 'new' && usesWorkingTree(comment.anchor.scope)
  const checkLocation = () => {
    setChecking(true)
    void reviewLocation(
      context.ctx,
      context.sessionId,
      referenceRequest(comment.anchor),
      'locateReference',
    )
      .then(setLocation)
      .catch(() => setLocation({ state: 'error' }))
      .finally(() => setChecking(false))
  }
  const applyLocation = () => {
    if (!currentAnchor || !location || location.line === undefined) return
    setChecking(true)
    void reviewLocation(
      context.ctx,
      context.sessionId,
      referenceRequest(comment.anchor),
      'locateReference',
    )
      .then(result => {
        // Recheck before replacing the anchor; a file may change after the first lookup.
        if (result.line !== location.line || result.state !== location.state) {
          setLocation(result)
          return
        }
        const next = currentAnchor(comment.anchor, result.line!)
        if (next) {
          store.relocate(comment.id, next)
          setLocation(null)
        } else {
          setLocation({ state: 'changed' })
        }
      })
      .catch(() => setLocation({ state: 'error' }))
      .finally(() => setChecking(false))
  }
  return (
    <article className={css.card} data-review-comment="">
      <div className={css.cardHeader}>
        <strong>{t('commentYou')}</strong>
        <small>
          {position(comment.anchor)} · {t('commentDraft')}
        </small>
      </div>
      {showFile && (
        <>
          <small className={css.meta} title={comment.anchor.absolutePath}>
            {comment.anchor.repositoryName} · {comment.anchor.path} ·{' '}
            {commentScopeLabel(comment.anchor.scope)}
            {comment.anchor.turn === undefined ? '' : ` · ${t('turn', { n: comment.anchor.turn })}`}
          </small>
          {comment.anchor.side !== 'file' && (
            <pre className={css.quote}>{comment.anchor.quote}</pre>
          )}
        </>
      )}
      <p className={css.commentText}>{comment.text}</p>
      <div className={css.actions}>
        <button
          type="button"
          className={css.button}
          disabled={snapshot.busy}
          onClick={() => {
            start(comment.anchor, placement, comment)
          }}
        >
          {t('commentEdit')}
        </button>
        <button
          type="button"
          className={css.button}
          disabled={snapshot.busy}
          onClick={() => {
            store.remove(comment.id)
          }}
        >
          {t('projectRemoveRepo')}
        </button>
        {canRelocate && (
          <button
            type="button"
            className={css.button}
            disabled={snapshot.busy || checking}
            onClick={checkLocation}
          >
            {t('referenceRelocate')}
          </button>
        )}
      </div>
      {location && (
        <p className={css.meta} role="status">
          {t(
            location.state === 'exact'
              ? 'referenceExact'
              : location.state === 'moved'
                ? 'editorMoved'
                : location.state === 'ambiguous'
                  ? 'editorAmbiguous'
                  : 'editorChanged',
            { line: location.line ?? '' },
          )}
        </p>
      )}
      {currentAnchor &&
        (location?.state === 'moved' || location?.state === 'exact') &&
        location.line !== undefined && (
          <button
            type="button"
            className={css.button}
            disabled={snapshot.busy || checking}
            onClick={applyLocation}
          >
            {t('referenceRelocateApply', { line: location.line })}
          </button>
        )}
    </article>
  )
}
function commentMatchesAnchor(
  candidate: ReviewCommentAnchor,
  anchor: ReviewCommentAnchor,
): boolean {
  return (
    commentFileKey(candidate) === commentFileKey(anchor) &&
    candidate.revision === anchor.revision &&
    candidate.side === anchor.side &&
    candidate.line === anchor.line &&
    (!candidate.sourceKey || candidate.sourceKey === anchor.sourceKey)
  )
}
function CommentThread({ anchor }: { anchor: ReviewCommentAnchor }) {
  const context = useContext(Comments)
  if (!context) return null
  const key = commentAnchorKey(anchor)
  const comments = context.snapshot.comments.filter(item =>
    commentMatchesAnchor(item.anchor, anchor),
  )
  const editing =
    context.composer?.placement === 'inline' &&
    commentMatchesAnchor(context.composer.anchor, anchor)
  const discussions = context.discussions.records.filter(item =>
    item.comments.some(comment => commentMatchesAnchor(comment.anchor, anchor)),
  )
  if (!comments.length && !editing && !discussions.length) return null
  return (
    <div className={css.thread}>
      {comments.map(comment => (
        <CommentCard key={comment.id} comment={comment} placement="inline" />
      ))}
      {editing && !context.composer?.id && <CommentEditor key={key} />}
      {discussions.map(item => (
        <DiscussionCard key={item.id} discussion={item} anchor={anchor} />
      ))}
    </div>
  )
}
/** Inline comment affordance shared by historical tool diffs and working-tree diffs. */
export function ReviewCommentLine({
  anchor,
  alternateAnchor,
  children,
}: {
  anchor?: ReviewCommentAnchor | undefined
  alternateAnchor?: ReviewCommentAnchor | undefined
  children: (button: ReactNode) => ReactNode
}) {
  const context = useContext(Comments)
  if (!context || !anchor) return children(null)
  return (
    <>
      {children(
        <button
          type="button"
          className={css.lineAdd}
          title={t('commentAddLine')}
          aria-label={`${t('commentAddLine')} · ${position(anchor)}`}
          disabled={context.snapshot.busy}
          onClick={() => {
            context.start(anchor, 'inline')
          }}
        >
          +
        </button>,
      )}
      <CommentThread anchor={anchor} />
      {alternateAnchor && <CommentThread anchor={alternateAnchor} />}
    </>
  )
}
export function ReviewFileCommentButton({ target }: { target?: ReviewCommentTarget | undefined }) {
  const context = useContext(Comments)
  if (!context || !target) return null
  return (
    <button
      type="button"
      className={css.fileButton}
      disabled={context.snapshot.busy}
      onKeyDown={event => {
        event.stopPropagation()
      }}
      onClick={event => {
        event.stopPropagation()
        context.start(fileCommentAnchor(target), 'inline')
      }}
    >
      {t('commentAddFile')}
    </button>
  )
}
export function ReviewFileCommentThread({ target }: { target?: ReviewCommentTarget | undefined }) {
  return target ? <CommentThread anchor={fileCommentAnchor(target)} /> : null
}
export function ReviewOutdatedComments({
  target,
  revision,
  currentAnchor,
}: {
  target?: ReviewCommentTarget | undefined
  revision: string
  currentAnchor?: CurrentCommentAnchor | undefined
}) {
  const context = useContext(Comments)
  const comments =
    target &&
    context?.snapshot.comments.filter(
      item =>
        item.anchor.side !== 'file' &&
        commentFileKey(item.anchor) === commentFileKey(target) &&
        item.anchor.revision !== revision,
    )
  const discussions =
    target &&
    context?.discussions.records.filter(item =>
      item.comments.some(
        comment =>
          comment.anchor.side !== 'file' &&
          commentFileKey(comment.anchor) === commentFileKey(target) &&
          comment.anchor.revision !== revision,
      ),
    )
  if (!comments?.length && !discussions?.length) return null
  return (
    <div className={css.thread}>
      <small>{t('commentChanged')}</small>
      {comments?.map(comment => (
        <CommentCard
          key={comment.id}
          comment={comment}
          placement="inline"
          showFile
          currentAnchor={currentAnchor}
        />
      ))}
      {discussions?.map(item => (
        <DiscussionCard key={item.id} discussion={item} />
      ))}
    </div>
  )
}

/** Shared explicit actions; standalone diff viewers can still copy references without a provider. */
export function useReviewInteractions() {
  return useContext(Comments)
}

export function DiscussionCard({
  discussion,
  anchor,
}: {
  discussion: ReviewDiscussion
  anchor?: ReviewCommentAnchor
}) {
  const context = useContext(Comments)
  if (!context) return null
  const { discussionStore, start, snapshot, ctx, sessionId } = context
  const comments = anchor
    ? discussion.comments.filter(item => commentMatchesAnchor(item.anchor, anchor))
    : discussion.comments
  const unread = (discussion.replies.at(-1)?.seq ?? 0) > discussion.readSeq
  const stateLabel = discussionStateLabel(discussion.state)
  const readOriginal = () => {
    const sessions = (ctx as Context & { sessions: ISessions }).sessions
    const session =
      typeof sessions.binding === 'function'
        ? sessions.binding(sessionId as SessionId)?.session
        : undefined
    void session?.loadThrough(discussion.userSeq as SessionSeq).catch(() => {})
  }
  return (
    <article
      className={css.card}
      data-review-discussion=""
      data-discussion-state={discussion.state}
    >
      <div className={css.cardHeader}>
        <strong>{stateLabel}</strong>
        <small>
          {discussion.turn
            ? t('turn', { n: discussion.turn })
            : new Date(discussion.createdAt).toLocaleString()}
        </small>
        {unread && <span className={css.unread}>{t('discussionUnread')}</span>}
      </div>
      {comments.map(comment => (
        <div key={comment.id} className={css.discussionOpinion}>
          <small className={css.meta}>
            {comment.anchor.repositoryName} · {comment.anchor.path} · {position(comment.anchor)} ·{' '}
            {t(
              discussion.resolved.includes(comment.id)
                ? 'discussionResolved'
                : 'discussionUnresolved',
            )}
          </small>
          {comment.anchor.quote && <pre className={css.quote}>{comment.anchor.quote}</pre>}
          <p className={css.commentText}>{comment.text}</p>
          <div className={css.actions}>
            <button
              type="button"
              className={css.button}
              onClick={() =>
                discussionStore.resolve(
                  discussion.id,
                  comment.id,
                  !discussion.resolved.includes(comment.id),
                )
              }
            >
              {t(
                discussion.resolved.includes(comment.id) ? 'discussionReopen' : 'discussionResolve',
              )}
            </button>
            <button
              type="button"
              className={css.button}
              disabled={snapshot.busy}
              onClick={() => start(comment.anchor, 'list', undefined, discussion.id)}
            >
              {t('discussionReply')}
            </button>
          </div>
        </div>
      ))}
      {discussion.replies.length > 0 && (
        <details
          className={css.discussionReplies}
          onToggle={event => {
            if (event.currentTarget.open) discussionStore.read(discussion.id)
          }}
        >
          <summary>{t('discussionResponse')}</summary>
          <small>{t('discussionHint')}</small>
          {discussion.replies.map(reply => (
            <div key={reply.id}>
              <p className={css.commentText}>{reply.text}</p>
              {reply.interrupted && <small>{t('discussionInterrupted')}</small>}
            </div>
          ))}
        </details>
      )}
      <div className={css.actions}>
        {unread && (
          <button
            type="button"
            className={css.button}
            onClick={() => discussionStore.read(discussion.id)}
          >
            {t('discussionRead')}
          </button>
        )}
        {discussion.userSeq !== undefined && (
          <button type="button" className={css.button} onClick={readOriginal}>
            {t('discussionReadOriginal')}
          </button>
        )}
      </div>
    </article>
  )
}
