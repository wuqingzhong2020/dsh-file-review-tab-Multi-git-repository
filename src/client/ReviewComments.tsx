import { createContext, useContext, useMemo, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import {
  COMMENT_TEXT_LIMIT, commentAnchorKey, commentFileKey, fileCommentAnchor,
  formatReviewComments, ReviewCommentStore,
  type CommentScope, type ReviewComment, type ReviewCommentAnchor, type ReviewCommentSnapshot, type ReviewCommentTarget,
} from './review-comments.ts'
import { sendReviewComments } from './review-comments-send.ts'
import { t } from './locales.ts'
import { useReviewLocale } from './use-review-locale.ts'
import { localizeReviewMessage } from './message-locales.ts'
import css from './ReviewComments.module.css'

const stores = new Map<string, ReviewCommentStore>()
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
  return t(scope === 'last-turn' ? 'reviewLastTurn' : scope === 'session' ? 'reviewSession' : scope === 'pending' ? 'reviewPending' : scope === 'uncommitted' ? 'reviewUncommitted' : 'reviewUnstaged')
}
function position(anchor: ReviewCommentAnchor): string {
  return t(anchor.side === 'file' ? 'commentWholeFile' : anchor.side === 'old' ? 'commentOldLine' : 'commentNewLine', { line: anchor.line ?? '' })
}
interface Composer { anchor: ReviewCommentAnchor; id?: string | undefined; text: string; placement: 'inline' | 'list' }
interface CommentsContext {
  snapshot: ReviewCommentSnapshot
  store: ReviewCommentStore
  composer: Composer | null
  setComposer: (value: Composer | null) => void
  start: (anchor: ReviewCommentAnchor, placement: Composer['placement'], comment?: ReviewComment) => void
}
const Comments = createContext<CommentsContext | null>(null)

export function ReviewCommentsProvider({ ctx, sessionId, children, controls }: { ctx: Context; sessionId: string; children: ReactNode; controls?: ReactNode }) {
  useReviewLocale()
  const store = useMemo(() => storeFor(sessionId), [sessionId])
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
  const [composer, setComposer] = useState<Composer | null>(null)
  const [open, setOpen] = useState(false)
  const [notice, setNotice] = useState<{ key: 'commentSent' | 'commentSendFailed'; details?: string } | null>(null)
  const start: CommentsContext['start'] = (anchor, placement, comment) => {
    if (snapshot.busy) return
    setComposer({ anchor, placement, id: comment?.id, text: comment?.text ?? '' })
    setOpen(placement === 'list')
    setNotice(null)
  }
  const submit = async () => {
    if (composer || snapshot.busy) return
    setNotice(null)
    try {
      const sent = await store.submit(async comments => {
        const message = formatReviewComments(comments, {
          introduction: t('commentPrompt'), repository: t('repository'), file: t('commentFile'), source: t('commentSource'),
          reference: t('commentReference'), opinion: t('commentOpinion'), scope: commentScopeLabel,
          turn: turn => t('turn', { n: turn }), position,
        })
        await sendReviewComments(ctx, sessionId, message)
      })
      if (sent) { setNotice({ key: 'commentSent' }); setOpen(false) }
    } catch (cause) { setNotice({ key: 'commentSendFailed', details: cause instanceof Error ? cause.message : String(cause) }) }
  }
  return <Comments.Provider value={{ snapshot, store, composer, setComposer, start }}>
    <div className={css.toolbar}>
      <button type="button" className={css.button} aria-expanded={open} onClick={() => {
        setOpen(!open)
        if (!open && composer) setComposer({ ...composer, placement: 'list' })
      }}>{t('commentPending', { count: snapshot.comments.length })}</button>
      <button type="button" className={`${css.button} ${css.primary}`} disabled={!snapshot.comments.length || snapshot.busy || composer !== null} title={composer ? t('commentFinishEditing') : t('commentSendHint')} onClick={() => { void submit() }}>
        {t(snapshot.busy ? 'commentSending' : 'commentSubmit')}
      </button>
      {composer && <small>{t('commentFinishEditing')}</small>}
      {controls}
    </div>
    {notice && <p className={css.notice} role="status">{t(notice.key)}{notice.details ? `: ${localizeReviewMessage(notice.details)}` : ''}</p>}
    {snapshot.storageError && <p className={css.notice} role="alert">{t('commentStorageError')}</p>}
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
    store.save(composer.anchor, composer.text, composer.id)
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
function CommentCard({ comment, placement, showFile = false }: { comment: ReviewComment; placement: Composer['placement']; showFile?: boolean }) {
  const context = useContext(Comments)
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
    </div>
  </article>
}
function CommentThread({ anchor }: { anchor: ReviewCommentAnchor }) {
  const context = useContext(Comments)
  if (!context) return null
  const key = commentAnchorKey(anchor)
  const comments = context.snapshot.comments.filter(item => commentAnchorKey(item.anchor) === key)
  const editing = context.composer?.placement === 'inline' && commentAnchorKey(context.composer.anchor) === key
  if (!comments.length && !editing) return null
  return <div className={css.thread}>
    {comments.map(comment => <CommentCard key={comment.id} comment={comment} placement="inline" />)}
    {editing && !context.composer?.id && <CommentEditor key={key} />}
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
export function ReviewOutdatedComments({ target, revision }: { target?: ReviewCommentTarget | undefined; revision: string }) {
  const context = useContext(Comments)
  const comments = target && context?.snapshot.comments.filter(item => item.anchor.side !== 'file' && commentFileKey(item.anchor) === commentFileKey(target) && item.anchor.revision !== revision)
  if (!comments?.length) return null
  return <div className={css.thread}><small>{t('commentChanged')}</small>{comments.map(comment => <CommentCard key={comment.id} comment={comment} placement="inline" showFile />)}</div>
}
