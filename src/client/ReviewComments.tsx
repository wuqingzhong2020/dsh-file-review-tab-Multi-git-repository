import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import {
  COMMENT_TEXT_LIMIT, commentAnchorKey, commentFileKey, fileCommentAnchor,
  formatReviewComments, ReviewCommentStore,
  type CommentScope, type ReviewComment, type ReviewCommentAnchor, type ReviewCommentSnapshot, type ReviewCommentTarget,
} from './review-comments.ts'
import { ReviewSendFailure, sendReviewComments } from './review-comments-send.ts'
import { t } from './locales.ts'
import { useReviewLocale } from './use-review-locale.ts'
import { localizeReviewMessage } from './message-locales.ts'
import css from './ReviewComments.module.css'
import { useDiffViewPreferences } from './DiffViewControls.tsx'
import { ReviewDiscussionStore, type ReviewDiscussion, type DiscussionSnapshot } from './review-discussions.ts'
import { referenceRequest, reviewLocation } from './review-file-opener.ts'
import type { ReviewLocationResult } from '../review-location.ts'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionId, SessionSeq } from '@deepseek-ai/dsh-session/types'

const stores = new Map<string, ReviewCommentStore>()
const discussionStores = new Map<string, ReviewDiscussionStore>()
function discussionStoreFor(sessionId: string): ReviewDiscussionStore {
  let store = discussionStores.get(sessionId)
  if (!store) {
    let storage: Storage | undefined
    try { storage = window.localStorage } catch { /* Keep records in memory and expose the storage warning. */ }
    store = new ReviewDiscussionStore(storage, `dsh-file-review-tab-multi-git-repository:discussions:${sessionId}`)
    discussionStores.set(sessionId, store)
  }
  return store
}
function storeFor(sessionId: string): ReviewCommentStore {
  let store = stores.get(sessionId)
  if (!store) {
    let storage: Storage | undefined
    try { storage = window.localStorage } catch { /* In-memory drafts remain usable. */ }
    store = new ReviewCommentStore(storage, `dsh-file-review-tab-multi-git-repository:comments:${sessionId}`)
    stores.set(sessionId, store)
  }
  return store
}
export function commentScopeLabel(scope: CommentScope): string {
  return t(({ 'last-turn': 'reviewLastTurn', session: 'reviewSession', pending: 'reviewPending', uncommitted: 'reviewUncommitted', unstaged: 'reviewUnstaged', staged: 'reviewStaged', commit: 'reviewCommit', branch: 'reviewBranch' } as const)[scope])
}
function position(anchor: ReviewCommentAnchor): string {
  if (anchor.line !== null && anchor.endLine !== undefined && anchor.endLine !== anchor.line) return t('referenceRange', { side: t(anchor.side === 'old' ? 'diffOld' : 'diffNew'), start: anchor.line, end: anchor.endLine })
  return t(anchor.side === 'file' ? 'commentWholeFile' : anchor.side === 'old' ? 'commentOldLine' : 'commentNewLine', { line: anchor.line ?? '' })
}
interface Composer { anchor: ReviewCommentAnchor; id?: string | undefined; discussionId?: string | undefined; text: string; placement: 'inline' | 'list' }
interface CommentsContext {
  snapshot: ReviewCommentSnapshot
  store: ReviewCommentStore
  composer: Composer | null
  setComposer: (value: Composer | null) => void
  start: (anchor: ReviewCommentAnchor, placement: Composer['placement'], comment?: ReviewComment, discussionId?: string) => void
  discussions: DiscussionSnapshot; discussionStore: ReviewDiscussionStore
  ctx: Context; sessionId: string
}
const Comments = createContext<CommentsContext | null>(null)

export function ReviewCommentsProvider({ ctx, sessionId, children, controls }: { ctx: Context; sessionId: string; children: ReactNode; controls?: ReactNode }) {
  useReviewLocale()
  const store = useMemo(() => storeFor(sessionId), [sessionId])
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
  const preferences = useDiffViewPreferences()
  const discussionStore = useMemo(() => discussionStoreFor(sessionId), [sessionId])
  const discussions = useSyncExternalStore(discussionStore.subscribe, discussionStore.getSnapshot, discussionStore.getSnapshot)
  const [composer, setComposer] = useState<Composer | null>(null)
  const [open, setOpen] = useState(false)
  const [discussionOpen, setDiscussionOpen] = useState(false)
  const [notice, setNotice] = useState<{ key: 'commentSent' | 'commentSendFailed'; details?: string } | null>(null)
  useEffect(() => {
    const sessions = (ctx as Context & { sessions: ISessions }).sessions
    let source: NonNullable<ReturnType<ISessions['binding']>>['eventSource'] | undefined
    let unsubscribe: (() => void) | undefined
    const attach = () => {
      const next = typeof sessions.binding === 'function' ? sessions.binding(sessionId as SessionId)?.eventSource : undefined
      if (source === next) return
      unsubscribe?.(); source = next
      if (next) { const sync = () => discussionStore.reconcile(next.getSnapshot().entries); unsubscribe = next.subscribe(sync); sync() }
    }
    attach()
    const unsubscribeList = sessions.list?.subscribe(attach)
    return () => { unsubscribe?.(); unsubscribeList?.() }
  }, [ctx, sessionId, discussionStore])
  useEffect(() => {
    for (const discussion of discussions.records) if (discussion.userSeq !== undefined || ['queued', 'running', 'answered', 'completed', 'cancelled'].includes(discussion.state)) store.acknowledge(discussion.comments)
  }, [discussions, store])
  const start: CommentsContext['start'] = (anchor, placement, comment, discussionId) => {
    if (snapshot.busy) return
    setComposer({ anchor, placement, id: comment?.id, text: comment?.text ?? '', discussionId: discussionId ?? comment?.discussionId })
    setOpen(placement === 'list')
    setNotice(null)
  }
  const submit = async () => {
    if (composer || snapshot.busy) return
    setNotice(null)
    try {
      const sent = await store.submit(async comments => {
        let message = formatReviewComments(comments, {
          introduction: t('commentPrompt'), repository: t('repository'), file: t('commentFile'), source: t('commentSource'),
          reference: t('commentReference'), opinion: t('commentOpinion'), scope: commentScopeLabel,
          turn: turn => t('turn', { n: turn }), position,
        })
        for (const parentId of new Set(comments.map(item => item.discussionId).filter(Boolean))) {
          const parent = discussions.records.find(item => item.id === parentId)
          if (parent) message += `\n\n${t('discussionReply')}:\n${parent.comments.map(item => item.text).join('\n')}\n${t('discussionResponse')}:\n${parent.replies.map(item => item.text).join('\n').slice(0, 20000)}`
        }
        let id: string | undefined
        try {
          await sendReviewComments(ctx, sessionId, message, preferences.discussionEnabled ? requestId => { id = discussionStore.begin(comments, requestId, comments[0]?.discussionId) } : undefined)
          if (id) discussionStore.settle(id, discussionStore.getSnapshot().records.find(item => item.id === id)?.requestId ? 'queued' : 'unlinked')
        } catch (cause) {
          const admitted = id && discussionStore.getSnapshot().records.find(item => item.id === id)
          if (admitted && ['queued', 'running', 'answered', 'completed', 'cancelled'].includes(admitted.state)) return
          if (id) discussionStore.settle(id, cause instanceof ReviewSendFailure && !cause.uncertain ? 'failed' : 'unknown')
          throw cause
        }
      })
      if (sent) { setNotice({ key: 'commentSent' }); setOpen(false) }
    } catch (cause) { setNotice({ key: 'commentSendFailed', details: cause instanceof Error ? cause.message : String(cause) }) }
  }
  return <Comments.Provider value={{ snapshot, store, composer, setComposer, start, discussions, discussionStore, ctx, sessionId }}>
    <div className={css.toolbar}>
      <button type="button" className={css.button} aria-expanded={open} onClick={() => {
        setOpen(!open)
        if (!open && composer) setComposer({ ...composer, placement: 'list' })
      }}>{t('commentPending', { count: snapshot.comments.length })}</button>
      <button type="button" className={`${css.button} ${css.primary}`} disabled={!snapshot.comments.length || snapshot.busy || composer !== null} title={composer ? t('commentFinishEditing') : t('commentSendHint')} onClick={() => { void submit() }}>
        {t(snapshot.busy ? 'commentSending' : 'commentSubmit')}
      </button>
      {composer && <small>{t('commentFinishEditing')}</small>}
      <button type="button" className={css.button} aria-expanded={discussionOpen} onClick={() => setDiscussionOpen(!discussionOpen)}>{t('discussionList', { count: discussions.records.length })}{discussions.records.some(item => (item.replies.at(-1)?.seq ?? 0) > item.readSeq) ? ' •' : ''}</button>
      {controls}
    </div>
    {notice && <p className={css.notice} role="status">{t(notice.key)}{notice.details ? `: ${localizeReviewMessage(notice.details)}` : ''}</p>}
    {snapshot.storageError && <p className={css.notice} role="alert">{t('commentStorageError')}</p>}
    {discussions.storageError && <p className={css.notice} role="alert">{t('discussionStorageError')}</p>}
    {discussionOpen && <div className={css.summary} aria-label={t('discussionList', { count: discussions.records.length })}>
      <small>{t('discussionHint')}</small>
      {!discussions.records.length && <p>{t('discussionEmpty')}</p>}
      {[...discussions.records].reverse().map(item => <DiscussionCard key={item.id} discussion={item} />)}
    </div>}
    {open && <div className={css.summary} aria-label={t('commentList')}>
      <small>{t('commentDraftHint')}</small>
      {snapshot.comments.length === 0 && !composer && <p>{t('commentEmpty')}</p>}
      {snapshot.comments.map(comment => <CommentCard key={comment.id} comment={comment} placement="list" showFile />)}
      {composer?.placement === 'list' && !composer.id && <CommentEditor key={commentAnchorKey(composer.anchor)} />}
    </div>}
    {children}
  </Comments.Provider>
}

function CommentEditor() {
  const context = useContext(Comments)
  if (!context?.composer) return null
  const { composer, setComposer, store, snapshot } = context
  const save = () => {
    if (!composer.text.trim() || snapshot.busy) return
    store.save(composer.anchor, composer.text, composer.id, composer.discussionId)
    setComposer(null)
  }
  return <form className={css.card} data-review-comment-editor="" onSubmit={event => { event.preventDefault(); save() }}>
    <div className={css.cardHeader}><strong>{t('commentYou')}</strong><small>{position(composer.anchor)}</small></div>
    {composer.placement === 'list' && <small className={css.meta}>{composer.anchor.repositoryName} · {composer.anchor.path} · {commentScopeLabel(composer.anchor.scope)}</small>}
    <textarea autoFocus aria-label={t('commentPlaceholder')} placeholder={t('commentPlaceholder')} value={composer.text} maxLength={COMMENT_TEXT_LIMIT} rows={3} disabled={snapshot.busy}
      onChange={event => { setComposer({ ...composer, text: event.target.value }) }} onKeyDown={event => {
        if (event.key === 'Escape') { event.preventDefault(); setComposer(null) }
        else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); save() }
      }} />
    <div className={css.actions}><button className={css.button} type="button" onClick={() => { setComposer(null) }}>{t('projectCancel')}</button>
      <button className={`${css.button} ${css.primary}`} type="submit" disabled={!composer.text.trim() || snapshot.busy}>{t(composer.id ? 'commentSave' : 'commentAdd')}</button></div>
  </form>
}
function CommentCard({ comment, placement, showFile = false, currentAnchor }: { comment: ReviewComment; placement: Composer['placement']; showFile?: boolean; currentAnchor?: ((anchor: ReviewCommentAnchor, line: number) => ReviewCommentAnchor | null) | undefined }) {
  const context = useContext(Comments)
  const [location, setLocation] = useState<ReviewLocationResult | null>(null)
  const [checking, setChecking] = useState(false)
  if (!context) return null
  const { composer, snapshot, start, store } = context
  if (composer?.id === comment.id && composer.placement === placement) return <CommentEditor />
  return <article className={css.card} data-review-comment="">
    <div className={css.cardHeader}><strong>{t('commentYou')}</strong><small>{position(comment.anchor)} · {t('commentDraft')}</small></div>
    {showFile && <>
      <small className={css.meta} title={comment.anchor.absolutePath}>{comment.anchor.repositoryName} · {comment.anchor.path} · {commentScopeLabel(comment.anchor.scope)}{comment.anchor.turn === undefined ? '' : ` · ${t('turn', { n: comment.anchor.turn })}`}</small>
      {comment.anchor.side !== 'file' && <pre className={css.quote}>{comment.anchor.quote}</pre>}
    </>}
    <p className={css.commentText}>{comment.text}</p>
    <div className={css.actions}>
      <button type="button" className={css.button} disabled={snapshot.busy} onClick={() => { start(comment.anchor, placement, comment) }}>{t('commentEdit')}</button>
      <button type="button" className={css.button} disabled={snapshot.busy} onClick={() => { store.remove(comment.id) }}>{t('projectRemoveRepo')}</button>
      {currentAnchor && comment.anchor.side === 'new' && (comment.anchor.scope === 'uncommitted' || comment.anchor.scope === 'unstaged') && <button type="button" className={css.button} disabled={snapshot.busy || checking} onClick={() => {
        setChecking(true); void reviewLocation(context.ctx, context.sessionId, referenceRequest(comment.anchor), 'locateReference').then(setLocation).catch(() => setLocation({ state: 'error' })).finally(() => setChecking(false))
      }}>{t('referenceRelocate')}</button>}
    </div>
    {location && <p className={css.meta} role="status">{t(location.state === 'exact' ? 'referenceExact' : location.state === 'moved' ? 'editorMoved' : location.state === 'ambiguous' ? 'editorAmbiguous' : 'editorChanged', { line: location.line ?? '' })}</p>}
    {currentAnchor && (location?.state === 'moved' || location?.state === 'exact') && location.line !== undefined && <button type="button" className={css.button} disabled={snapshot.busy || checking} onClick={() => {
      setChecking(true)
      void reviewLocation(context.ctx, context.sessionId, referenceRequest(comment.anchor), 'locateReference').then(result => {
        if (result.line !== location.line || result.state !== location.state) { setLocation(result); return }
        const next = currentAnchor(comment.anchor, result.line!)
        if (next) { store.relocate(comment.id, next); setLocation(null) } else setLocation({ state: 'changed' })
      }).catch(() => setLocation({ state: 'error' })).finally(() => setChecking(false))
    }}>{t('referenceRelocateApply', { line: location.line })}</button>}
  </article>
}
function atLine(candidate: ReviewCommentAnchor, anchor: ReviewCommentAnchor): boolean {
  return commentFileKey(candidate) === commentFileKey(anchor) && candidate.revision === anchor.revision && candidate.side === anchor.side && candidate.line === anchor.line && (!candidate.sourceKey || candidate.sourceKey === anchor.sourceKey)
}
function CommentThread({ anchor }: { anchor: ReviewCommentAnchor }) {
  const context = useContext(Comments)
  if (!context) return null
  const key = commentAnchorKey(anchor)
  const comments = context.snapshot.comments.filter(item => atLine(item.anchor, anchor))
  const editing = context.composer?.placement === 'inline' && atLine(context.composer.anchor, anchor)
  const discussions = context.discussions.records.filter(item => item.comments.some(comment => atLine(comment.anchor, anchor)))
  if (!comments.length && !editing && !discussions.length) return null
  return <div className={css.thread}>
    {comments.map(comment => <CommentCard key={comment.id} comment={comment} placement="inline" />)}
    {editing && !context.composer?.id && <CommentEditor key={key} />}
    {discussions.map(item => <DiscussionCard key={item.id} discussion={item} anchor={anchor} />)}
  </div>
}
/** Inline comment affordance shared by historical tool diffs and working-tree diffs. */
export function ReviewCommentLine({ anchor, alternateAnchor, children }: { anchor?: ReviewCommentAnchor | undefined; alternateAnchor?: ReviewCommentAnchor | undefined; children: (button: ReactNode) => ReactNode }) {
  const context = useContext(Comments)
  if (!context || !anchor) return children(null)
  return <>{children(<button type="button" className={css.lineAdd} title={t('commentAddLine')} aria-label={`${t('commentAddLine')} · ${position(anchor)}`} disabled={context.snapshot.busy} onClick={() => { context.start(anchor, 'inline') }}>+</button>)}<CommentThread anchor={anchor} />{alternateAnchor && <CommentThread anchor={alternateAnchor} />}</>
}
export function ReviewFileCommentButton({ target }: { target?: ReviewCommentTarget | undefined }) {
  const context = useContext(Comments)
  if (!context || !target) return null
  return <button type="button" className={css.fileButton} disabled={context.snapshot.busy} onKeyDown={event => { event.stopPropagation() }} onClick={event => { event.stopPropagation(); context.start(fileCommentAnchor(target), 'inline') }}>{t('commentAddFile')}</button>
}
export function ReviewFileCommentThread({ target }: { target?: ReviewCommentTarget | undefined }) {
  return target ? <CommentThread anchor={fileCommentAnchor(target)} /> : null
}
export function ReviewOutdatedComments({ target, revision, currentAnchor }: { target?: ReviewCommentTarget | undefined; revision: string; currentAnchor?: ((anchor: ReviewCommentAnchor, line: number) => ReviewCommentAnchor | null) | undefined }) {
  const context = useContext(Comments)
  const comments = target && context?.snapshot.comments.filter(item => item.anchor.side !== 'file' && commentFileKey(item.anchor) === commentFileKey(target) && item.anchor.revision !== revision)
  const discussions = target && context?.discussions.records.filter(item => item.comments.some(comment => comment.anchor.side !== 'file' && commentFileKey(comment.anchor) === commentFileKey(target) && comment.anchor.revision !== revision))
  if (!comments?.length && !discussions?.length) return null
  return <div className={css.thread}><small>{t('commentChanged')}</small>{comments?.map(comment => <CommentCard key={comment.id} comment={comment} placement="inline" showFile currentAnchor={currentAnchor} />)}{discussions?.map(item => <DiscussionCard key={item.id} discussion={item} />)}</div>
}

/** Shared explicit actions; standalone diff viewers can still copy references without a provider. */
export function useReviewInteractions() { return useContext(Comments) }

function DiscussionCard({ discussion, anchor }: { discussion: ReviewDiscussion; anchor?: ReviewCommentAnchor }) {
  const context = useContext(Comments)
  if (!context) return null
  const { discussionStore, start, snapshot, ctx, sessionId } = context
  const comments = anchor ? discussion.comments.filter(item => atLine(item.anchor, anchor)) : discussion.comments
  const unread = (discussion.replies.at(-1)?.seq ?? 0) > discussion.readSeq
  const state = ({ submitting: 'discussionSubmitting', queued: 'discussionQueued', running: 'discussionRunning', answered: 'discussionAnswered', completed: 'discussionCompleted', cancelled: 'discussionCancelled', failed: 'discussionFailed', unknown: 'discussionUnknown', unlinked: 'discussionNoCorrelation' } as const)[discussion.state]
  return <article className={css.card} data-review-discussion="" data-discussion-state={discussion.state}>
    <div className={css.cardHeader}><strong>{t(state)}</strong><small>{discussion.turn ? t('turn', { n: discussion.turn }) : new Date(discussion.createdAt).toLocaleString()}</small>{unread && <span className={css.unread}>{t('discussionUnread')}</span>}</div>
    {comments.map(comment => <div key={comment.id} className={css.discussionOpinion}>
      <small className={css.meta}>{comment.anchor.repositoryName} · {comment.anchor.path} · {position(comment.anchor)} · {t(discussion.resolved.includes(comment.id) ? 'discussionResolved' : 'discussionUnresolved')}</small>
      {comment.anchor.quote && <pre className={css.quote}>{comment.anchor.quote}</pre>}
      <p className={css.commentText}>{comment.text}</p>
      <div className={css.actions}>
        <button type="button" className={css.button} onClick={() => discussionStore.resolve(discussion.id, comment.id, !discussion.resolved.includes(comment.id))}>{t(discussion.resolved.includes(comment.id) ? 'discussionReopen' : 'discussionResolve')}</button>
        <button type="button" className={css.button} disabled={snapshot.busy} onClick={() => start(comment.anchor, 'list', undefined, discussion.id)}>{t('discussionReply')}</button>
      </div>
    </div>)}
    {discussion.replies.length > 0 && <details className={css.discussionReplies} onToggle={event => { if (event.currentTarget.open) discussionStore.read(discussion.id) }}><summary>{t('discussionResponse')}</summary><small>{t('discussionHint')}</small>{discussion.replies.map(reply => <div key={reply.id}><p className={css.commentText}>{reply.text}</p>{reply.interrupted && <small>{t('discussionInterrupted')}</small>}</div>)}</details>}
    <div className={css.actions}>
      {unread && <button type="button" className={css.button} onClick={() => discussionStore.read(discussion.id)}>{t('discussionRead')}</button>}
      {discussion.userSeq !== undefined && <button type="button" className={css.button} onClick={() => {
        const sessions = (ctx as Context & { sessions: ISessions }).sessions
        const session = typeof sessions.binding === 'function' ? sessions.binding(sessionId as SessionId)?.session : undefined
        void session?.loadThrough(discussion.userSeq as SessionSeq).catch(() => {})
      }}>{t('discussionReadOriginal')}</button>}
    </div>
  </article>
}
