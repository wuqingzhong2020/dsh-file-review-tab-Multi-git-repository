import { FILE_REVIEW_REMOTE_NAMESPACE } from '../service-names.ts'
import { useEffect, useRef, useState } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import type {
  GitReviewDiff,
  GitReviewFile as GitReviewFileChange,
  GitReviewFileRequest,
  GitReviewMode,
  GitReviewRequest,
  GitReviewResult,
} from '../git-review-types.ts'
import { t } from './locales.ts'
import { useReviewLocale } from './use-review-locale.ts'
import { localizeReviewMessage } from './message-locales.ts'
import { resolveSessionPath } from './session-changes.ts'
import css from './FileReviewTab.module.css'
import type { ReviewCommentTarget } from './review-comments.ts'
import {
  allFileContentsExpanded,
  groupReviewFiles,
  repositoryGroupId,
  setFileContentsExpanded,
  setRepositoryGroupsCollapsed,
} from './review-repository-groups.ts'
import { mergeGitRepositoryReview } from './git-review-repository-update.ts'
import { FileContentsButton, ReviewRepositoryGroup } from './ReviewRepositoryGroup.tsx'
import { loadMissingReviewDiffs, ReviewDiffQueue } from './git-review-diff-loader.ts'
import { AggregateCopyButton } from './AggregateCopyButton.tsx'
import { gitReviewFileKey, loadGitReviewReport } from './git-review-report.ts'
import { GitReviewFile } from './GitReviewFile.tsx'
import { gitReferenceSelector } from './review-scope-model.ts'

interface GitRemote {
  gitReview(request: GitReviewRequest): Promise<RemoteResult<GitReviewResult>>
  gitReviewDiff(request: GitReviewFileRequest): Promise<RemoteResult<GitReviewDiff>>
}

interface GitReviewPanelProps {
  readonly ctx: Context
  readonly sessionId: string
  readonly mode: GitReviewMode
  readonly visible: boolean
  readonly repositoryFilter: string
  readonly tick: number
}

async function unwrap<T>(promise: Promise<RemoteResult<T>>): Promise<T> {
  const result = await promise
  if (!result.ok) throw new Error(result.error.message)
  return result.value
}
/** Own the comparison epoch and loading queue; individual files only render their state. */
export function GitReviewPanel({ ctx, sessionId, mode, visible, tick, repositoryFilter }: GitReviewPanelProps) {
  useReviewLocale()
  const sessions = (ctx as Context & { sessions: ISessions }).sessions
  const remote = (): GitRemote => {
    const value = sessions.scope(sessionId as SessionId)?.get(FILE_REVIEW_REMOTE_NAMESPACE) as
      | GitRemote
      | undefined
    if (!value) throw new Error(t('remoteUnavailable'))
    return value
  }
  const repository = repositoryFilter
  const [ref, setRef] = useState('')
  const [data, setData] = useState<GitReviewResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set())
  const [collapsedRepositories, setCollapsedRepositories] = useState<ReadonlySet<string>>(
    () => new Set(),
  )
  const [diffs, setDiffs] = useState<Map<string, GitReviewDiff | string | null>>(new Map())
  const expandedRef = useRef(expanded)
  expandedRef.current = expanded
  const version = useRef(0)
  const loadedComparison = useRef<string | null>(null)
  const repositoryVersions = useRef(new Map<string, number>())
  const pendingRepositories = useRef(new Set<string>())
  const [updatingRepositories, setUpdatingRepositories] = useState<ReadonlySet<string>>(new Set())
  const [repositoryErrors, setRepositoryErrors] = useState<ReadonlyMap<string, string>>(new Map())
  const requestedDiffs = useRef(new Set<string>())
  const diffQueue = useRef(new ReviewDiffQueue<GitReviewDiff>())
  const keyOf = gitReviewFileKey
  const request = (): GitReviewRequest => ({
    mode,
    ...(repository !== '*' ? { repository } : {}),
    ...(ref ? { ref } : {}),
  })
  useEffect(() => {
    setRef('')
    setCollapsedRepositories(new Set())
  }, [sessionId, mode, repository])
  useEffect(() => {
    if (!visible) return
    const current = ++version.current
    repositoryVersions.current = new Map()
    pendingRepositories.current = new Set()
    setUpdatingRepositories(new Set())
    setRepositoryErrors(new Map())
    const comparison = JSON.stringify([sessionId, mode, repository, ref])
    // Refresh the same comparison without closing the files the user is reading.
    const retainedExpanded = loadedComparison.current === comparison ? expanded : new Set<string>()
    loadedComparison.current = comparison
    requestedDiffs.current = new Set()
    diffQueue.current = new ReviewDiffQueue<GitReviewDiff>()
    setLoading(true)
    setError('')
    setExpanded(retainedExpanded)
    setDiffs(new Map())
    void Promise.resolve()
      .then(() => unwrap(remote().gitReview(request())))
      .then(result => {
        if (version.current !== current) return
        setData(result)
        const openFiles = result.files.filter(file => retainedExpanded.has(keyOf(file)))
        setExpanded(new Set(openFiles.map(keyOf)))
        // A new queue and empty cache ensure every open diff comes from this refresh.
        loadDiffs(openFiles)
      })
      .catch(cause => {
        if (version.current === current) {
          setError(cause instanceof Error ? cause.message : String(cause))
        }
      })
      .finally(() => {
        if (version.current === current) setLoading(false)
      })
    return () => {
      version.current++
    }
  }, [sessionId, mode, repository, ref, visible, tick])
  const loadDiffs = (files: readonly GitReviewFileChange[]) => {
    const current = version.current
    const comparison = request()
    const revisions = new Map(files.map(file => [file.repository, repositoryVersions.current.get(file.repository) ?? 0]))
    const isCurrent = (file: GitReviewFileChange) => version.current === current
      && revisions.get(file.repository) === (repositoryVersions.current.get(file.repository) ?? 0)
    const queue = diffQueue.current
    void loadMissingReviewDiffs(files, keyOf, requestedDiffs.current, async file => {
      if (!isCurrent(file)) return
      const key = keyOf(file)
      setDiffs(value => new Map(value).set(key, null))
      try {
        const result = await queue.load(key, () => {
          if (!isCurrent(file)) throw new Error('Comparison changed; refresh again')
          return unwrap(remote().gitReviewDiff({
            ...comparison,
            repository: file.repository,
            path: file.path,
          }))
        })
        if (isCurrent(file)) setDiffs(value => new Map(value).set(key, result))
      } catch (cause) {
        if (isCurrent(file)) {
          setDiffs(value =>
            new Map(value).set(key, cause instanceof Error ? cause.message : String(cause)),
          )
        }
      }
    })
  }
  const updateRepository = async (path: string) => {
    if (!visible || loading || data === null || pendingRepositories.current.has(path)) return
    const current = version.current
    let revision = (repositoryVersions.current.get(path) ?? 0) + 1
    repositoryVersions.current.set(path, revision)
    pendingRepositories.current.add(path)
    setUpdatingRepositories(new Set(pendingRepositories.current))
    setRepositoryErrors(value => { const next = new Map(value); next.delete(path); return next })
    const isCurrent = () => version.current === current && repositoryVersions.current.get(path) === revision
    // Invalidate only this repository, including entries used by an in-flight copy.
    const keys = data.files.filter(file => file.repository === path).map(keyOf)
    diffQueue.current.invalidate(keys)
    for (const key of keys) requestedDiffs.current.delete(key)
    try {
      const result = await unwrap(remote().gitReview({ ...request(), repository: path }))
      if (!isCurrent()) return
      const merged = mergeGitRepositoryReview(data, path, result)
      setData(value => value === null ? value : mergeGitRepositoryReview(value, path, result))
      const nextFiles = merged.files.filter(file => file.repository === path)
      // Reads started while the list was loading must also belong to the new list.
      repositoryVersions.current.set(path, ++revision)
      const invalidated = new Set([...keys, ...nextFiles.map(keyOf)])
      diffQueue.current.invalidate(invalidated)
      for (const key of invalidated) requestedDiffs.current.delete(key)
      const remaining = new Set(nextFiles.map(keyOf))
      setExpanded(value => new Set([...value].filter(key => !keys.includes(key) || remaining.has(key))))
      setDiffs(value => {
        const next = new Map(value)
        for (const key of invalidated) next.delete(key)
        return next
      })
      loadDiffs(nextFiles.filter(file => expandedRef.current.has(keyOf(file))))
    } catch (cause) {
      if (isCurrent()) setRepositoryErrors(value =>
        new Map(value).set(path, cause instanceof Error ? cause.message : String(cause)))
    } finally {
      if (isCurrent()) {
        pendingRepositories.current.delete(path)
        setUpdatingRepositories(new Set(pendingRepositories.current))
      }
    }
  }
  const setContents = (files: readonly GitReviewFileChange[], open: boolean) => {
    setExpanded(current => setFileContentsExpanded(current, files.map(keyOf), open))
    if (open) loadDiffs(files)
  }
  const copyFiles = (files: readonly GitReviewFileChange[], signal: AbortSignal) => {
    const current = version.current
    const comparison = request()
    const queue = diffQueue.current
    const revisions = new Map(files.map(file => [file.repository, repositoryVersions.current.get(file.repository) ?? 0]))
    const ensureActive = () => {
      signal.throwIfAborted()
      if (current !== version.current || [...revisions].some(([path, revision]) =>
        revision !== (repositoryVersions.current.get(path) ?? 0)))
        throw new Error('Comparison changed; copy again')
    }
    return loadGitReviewReport(files, {
      source: `${mode}; ${ref || data?.comparisons.join('; ') || 'current comparison'}`,
      ensureActive,
      load: file => queue.load(keyOf(file), () => {
        ensureActive()
        return unwrap(remote().gitReviewDiff({
          ...comparison,
          repository: file.repository,
          path: file.path,
        }))
      }),
    })
  }
  const toggleFile = (file: GitReviewFileChange) => {
    setContents([file], !expanded.has(keyOf(file)))
  }
  const selected = data?.repositories.find(repo => repo.path === repository)
  const totals = data?.files.reduce(
    (stats, file) => ({
      added: stats.added + file.added,
      removed: stats.removed + file.removed,
    }),
    { added: 0, removed: 0 },
  )
  const referenceSelector = gitReferenceSelector(mode, selected)
  const refsMode = referenceSelector !== null
  const repositoryGroups = groupReviewFiles(data?.files ?? [], file => ({
    key: file.repository,
    path: file.repository,
    name: data?.repositories.find(repo => repo.path === file.repository)?.name ?? file.repository,
  }))
  const groupKeys = repositoryGroups.map(group => repositoryGroupId(sessionId, mode, group.key))
  const allExpanded =
    allFileContentsExpanded(expanded, (data?.files ?? []).map(keyOf)) &&
    groupKeys.every(key => !collapsedRepositories.has(key))
  const toggleAllContents = () => {
    if (data === null) return
    setContents(data.files, !allExpanded)
    if (!allExpanded) {
      setCollapsedRepositories(current => setRepositoryGroupsCollapsed(current, groupKeys, false))
    }
  }

  return (
    <div className={css.gitPanel}>
      <div className={css.repositoryBar}>
        {referenceSelector !== null && (
          <select
            aria-label={t(referenceSelector.label)}
            value={ref}
            disabled={!selected}
            onChange={event => {
              setRef(event.target.value)
            }}
          >
            <option value="">{t(referenceSelector.defaultLabel)}</option>
            {referenceSelector.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
        {!loading && totals && (
          <span className={css.stats}>
            <span className={css.added}>+{totals.added}</span>
            <span className={css.removed}>-{totals.removed}</span>
          </span>
        )}
        <small>
          {refsMode && repository === '*' ? t('reviewSelectRepository') : t('reviewGitHint')}
        </small>
        {!loading && data?.comparisons.length ? (
          <small title={data.comparisons.join('\n')}>
            {selected
              ? data.comparisons[0]
              : t('reviewRepoCount', { count: data.repositories.length })}
          </small>
        ) : null}
      </div>
      <div className={css.body}>
        {error && (
          <p className={`${css.notice} ${css.noticeError}`} role="alert">
            {localizeReviewMessage(error)}
          </p>
        )}
        {!loading &&
          !error &&
          data?.warnings.map(warning => (
            <p className={`${css.notice} ${css.noticeError}`} key={warning}>
              {localizeReviewMessage(warning)}
            </p>
          ))}
        {loading ? (
          <p className={css.empty} role="status">
            {t('reviewLoading')}
          </p>
        ) : !error && data && !data.files.length ? (
          <p className={css.empty}>
            {t(data.repositories.length ? 'reviewGitEmpty' : 'reviewNoGit')}
          </p>
        ) : null}
        {!loading && !error && data && data.files.length > 0 && (
          <section className={css.turnGroup}>
            <header className={css.turnHeader}>
              <span className={css.turnTitle}>
                {t('reviewFiles', { count: data.files.length })}
              </span>
              <span className={css.gitVisibility}>
                <AggregateCopyButton key={version.current} load={signal => copyFiles(data.files, signal)} />
                <FileContentsButton
                  expanded={allExpanded}
                  label={t(allExpanded ? 'collapseAllRepositories' : 'expandAllRepositories')}
                  onClick={toggleAllContents}
                />
              </span>
            </header>
            {repositoryGroups.map(group => {
              const groupId = repositoryGroupId(sessionId, mode, group.key)
              const groupFileKeys = group.files.map(keyOf)
              return (
                <ReviewRepositoryGroup
                  key={`${sessionId}:${mode}:${group.key}`}
                  name={group.name}
                  path={group.path}
                  count={group.files.length}
                  titleActions={<button type="button" className={css.smallButton}
                    aria-label={t('updateRepository', { name: group.name })}
                    title={t('updateRepositoryHint', { name: group.name })}
                    disabled={updatingRepositories.has(group.key)}
                    onClick={() => { void updateRepository(group.key) }}>
                    {t(updatingRepositories.has(group.key) ? 'updateRepositoryBusy' : 'updateReview')}
                  </button>}
                  actions={<AggregateCopyButton key={version.current} load={signal => copyFiles(group.files, signal)} />}
                  collapsed={collapsedRepositories.has(groupId)}
                  onCollapsedChange={collapsed => {
                    setCollapsedRepositories(current =>
                      setRepositoryGroupsCollapsed(current, [groupId], collapsed),
                    )
                  }}
                  contentsExpanded={allFileContentsExpanded(expanded, groupFileKeys)}
                  onContentsExpandedChange={open => {
                    setContents(group.files, open)
                  }}
                >
                  {repositoryErrors.has(group.key) && <p role="alert" className={`${css.notice} ${css.noticeError}`}>
                    {localizeReviewMessage(repositoryErrors.get(group.key)!)}
                  </p>}
                  <ul className={css.fileList}>
                    {group.files.map(file => {
                      const key = keyOf(file)
                      const repo = data.repositories.find(item => item.path === file.repository)
                      const commentTarget: ReviewCommentTarget = {
                        scope: mode,
                        repository: file.repository,
                        repositoryName: repo?.name ?? file.repository,
                        path: file.path,
                        absolutePath: resolveSessionPath(file.repository, file.path),
                        ...(refsMode ? { ref: ref || data.comparisons.join('\n') } : {}),
                      }
                      return (
                        <GitReviewFile
                          key={key}
                          file={file}
                          target={commentTarget}
                          sourceKey={JSON.stringify([
                            sessionId,
                            mode,
                            file.repository,
                            file.path,
                            ref,
                          ])}
                          open={expanded.has(key)}
                          diff={diffs.get(key)}
                          onToggle={() => {
                            toggleFile(file)
                          }}
                        />
                      )
                    })}
                  </ul>
                </ReviewRepositoryGroup>
              )
            })}
          </section>
        )}
      </div>
    </div>
  )
}
