import { useEffect, useRef, useState } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import type { GitReviewDiff, GitReviewFile, GitReviewFileRequest, GitReviewMode, GitReviewRequest, GitReviewResult } from '../git-review-types.ts'
import { UnifiedDiff } from './UnifiedDiff.tsx'
import { t } from './locales.ts'
import { resolveSessionPath } from './session-changes.ts'
import css from './FileReviewTab.module.css'
import { ReviewFileCommentButton, ReviewFileCommentThread } from './ReviewComments.tsx'
import type { ReviewCommentTarget } from './review-comments.ts'
import { groupReviewFiles } from './review-repository-groups.ts'
import { ReviewRepositoryGroup } from './ReviewRepositoryGroup.tsx'

interface GitRemote {
  gitReview(request: GitReviewRequest): Promise<RemoteResult<GitReviewResult>>
  gitReviewDiff(request: GitReviewFileRequest): Promise<RemoteResult<GitReviewDiff>>
}
async function unwrap<T>(promise: Promise<RemoteResult<T>>): Promise<T> {
  const result = await promise
  if (!result.ok) throw new Error(result.error.message)
  return result.value
}
export function GitReviewPanel({ ctx, sessionId, mode, visible, tick }: { ctx: Context; sessionId: string; mode: GitReviewMode; visible: boolean; tick: number }) {
  const sessions = (ctx as Context & { sessions: ISessions }).sessions
  const remote = (): GitRemote => {
    const value = sessions.scope(sessionId as SessionId)?.get('remote.fileReview') as GitRemote | undefined
    if (!value) throw new Error(t('remoteUnavailable'))
    return value
  }
  const [repository, setRepository] = useState('*')
  const [ref, setRef] = useState('')
  const [data, setData] = useState<GitReviewResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [diffs, setDiffs] = useState<Map<string, GitReviewDiff | string | null>>(new Map())
  const version = useRef(0)
  const keyOf = (file: GitReviewFile) => `${file.repository}\0${file.path}`
  const request = (): GitReviewRequest => ({ mode, ...(repository !== '*' ? { repository } : {}), ...(ref ? { ref } : {}) })
  useEffect(() => { setRepository('*'); setRef('') }, [sessionId, mode])
  useEffect(() => {
    if (!visible) return
    const current = ++version.current
    setLoading(true); setError(''); setExpanded(new Set()); setDiffs(new Map())
    void Promise.resolve().then(() => unwrap(remote().gitReview(request()))).then(result => {
      if (version.current !== current) return
      setData(result)
    }).catch(cause => { if (version.current === current) setError(cause instanceof Error ? cause.message : String(cause)) })
      .finally(() => { if (version.current === current) setLoading(false) })
    return () => { version.current++ }
  }, [sessionId, mode, repository, ref, visible, tick])
  const toggle = (file: GitReviewFile) => {
    const key = keyOf(file)
    setExpanded(current => { const next = new Set(current); if (next.has(key)) next.delete(key); else next.add(key); return next })
    if (diffs.has(key)) return
    const current = version.current
    setDiffs(value => new Map(value).set(key, null))
    void Promise.resolve().then(() => unwrap(remote().gitReviewDiff({ ...request(), repository: file.repository, path: file.path }))).then(result => {
      if (version.current === current) setDiffs(value => new Map(value).set(key, result))
    }).catch(cause => { if (version.current === current) setDiffs(value => new Map(value).set(key, cause instanceof Error ? cause.message : String(cause))) })
  }
  const selected = data?.repositories.find(repo => repo.path === repository)
  const totals = data?.files.reduce((stats, file) => ({ added: stats.added + file.added, removed: stats.removed + file.removed }), { added: 0, removed: 0 })
  const refsMode = mode === 'commit' || mode === 'branch'
  const repositoryGroups = groupReviewFiles(data?.files ?? [], file => ({
    key: file.repository, path: file.repository,
    name: data?.repositories.find(repo => repo.path === file.repository)?.name ?? file.repository,
  }))
  return <div className={css.gitPanel}>
    <div className={css.repositoryBar}>
      <select aria-label={t('repository')} value={repository} onChange={event => { setRepository(event.target.value); setRef('') }}>
        <option value="*">{t('repoAll')}</option>
        {data?.repositories.map(repo => <option key={repo.path} value={repo.path}>{repo.name}</option>)}
      </select>
      {refsMode && <select aria-label={t(mode === 'commit' ? 'reviewCommit' : 'reviewBranch')} value={ref} disabled={!selected} onChange={event => { setRef(event.target.value) }}>
        <option value="">{t(mode === 'commit' ? 'reviewHead' : 'reviewAutoBranch')}</option>
        {mode === 'commit' ? selected?.commits.map(commit => <option key={commit.oid} value={commit.oid}>{commit.oid.slice(0, 8)} · {commit.subject} · {commit.date}</option>)
          : selected?.branches.map(branch => <option key={branch} value={branch}>{branch}</option>)}
      </select>}
      {!loading && totals && <span className={css.stats}><span className={css.added}>+{totals.added}</span><span className={css.removed}>-{totals.removed}</span></span>}
      <small>{refsMode && repository === '*' ? t('reviewSelectRepository') : t('reviewGitHint')}</small>
      {!loading && data?.comparisons.length ? <small title={data.comparisons.join('\n')}>{selected ? data.comparisons[0] : t('reviewRepoCount', { count: data.repositories.length })}</small> : null}
    </div>
    <div className={css.body}>
      {error && <p className={`${css.notice} ${css.noticeError}`} role="alert">{error}</p>}
      {!loading && !error && data?.warnings.map(warning => <p className={`${css.notice} ${css.noticeError}`} key={warning}>{warning}</p>)}
      {loading ? <p className={css.empty} role="status">{t('reviewLoading')}</p>
        : !error && data && !data.files.length ? <p className={css.empty}>{t(data.repositories.length ? 'reviewGitEmpty' : 'reviewNoGit')}</p> : null}
      {!loading && !error && data && data.files.length > 0 && <section className={css.turnGroup}>
        <header className={css.turnHeader}><span className={css.turnTitle}>{t('reviewFiles', { count: data.files.length })}</span></header>
        {repositoryGroups.map(group => <ReviewRepositoryGroup key={`${sessionId}:${mode}:${group.key}`} name={group.name} path={group.path} count={group.files.length}>
        <ul className={css.fileList}>{group.files.map(file => {
          const key = keyOf(file); const open = expanded.has(key); const diff = diffs.get(key)
          const repo = data.repositories.find(item => item.path === file.repository)
          const commentTarget: ReviewCommentTarget | undefined = mode === 'uncommitted' || mode === 'unstaged' ? {
            scope: mode, repository: file.repository, repositoryName: repo?.name ?? file.repository,
            path: file.path, absolutePath: resolveSessionPath(file.repository, file.path),
          } : undefined
          return <li className={css.fileItem} key={key}>
            <div className={css.fileRow}>
              <button className={css.gitFileName} type="button" aria-expanded={open} title={file.path} onClick={() => { toggle(file) }}>
                <span>{open ? '⌄' : '›'}</span><span className={css.fileName}>{file.oldPath ? `${file.oldPath} → ${file.path}` : file.path}</span>
              </button>
              <span className={css.stateBadge}>{file.status}</span>
              {file.binary ? <span className={css.stateBadge}>{t('reviewBinary')}</span> : <span className={css.stats}><span className={css.added}>+{file.added}</span><span className={css.removed}>-{file.removed}</span></span>}
              <ReviewFileCommentButton target={commentTarget} />
              {file.status !== 'D' && <button className={`${css.smallButton} ${css.editorButton}`} type="button" onClick={() => {
                const sidebar = (ctx as Context & { betterSidebar?: { openFile(scope: { sessionId: string }, path: string, title?: string): void } }).betterSidebar
                sidebar?.openFile({ sessionId }, resolveSessionPath(file.repository, file.path), file.path.split('/').at(-1))
              }}>{t('openInEditor')}</button>}
            </div>
            <ReviewFileCommentThread target={commentTarget} />
            {open && <div className={css.diffWrap}>{diff === null || diff === undefined ? <p>{t('reviewLoading')}</p> : typeof diff === 'string' ? <p role="alert">{diff}</p>
              : diff.diffs.length ? <UnifiedDiff diffs={diff.diffs} reviewTarget={commentTarget} contextLines={3} showCopyButton showFileHeaders={false} labels={{ copy: t('copy'), copied: t('copied'), expandContext: (count, remaining) => t('expandContext', { count, remaining }), collapseContext: t('collapseContext'), unavailableContext: count => t('unavailableContext', { count }) }} />
                : <p>{diff.binary ? t('reviewBinaryHint') : t('reviewMetadataOnly')}{diff.note ? ` (${diff.note})` : ''}</p>}</div>}
          </li>
        })}</ul>
        </ReviewRepositoryGroup>)}
      </section>}
    </div>
  </div>
}
