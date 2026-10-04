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
import { FileContentsButton, ReviewRepositoryGroup } from './ReviewRepositoryGroup.tsx'
import { loadMissingReviewDiffs } from './git-review-diff-loader.ts'
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
  readonly tick: number
}

async function unwrap<T>(promise: Promise<RemoteResult<T>>): Promise<T> {
  const result = await promise
  if (!result.ok) throw new Error(result.error.message)
  return result.value
}
/** Own the comparison epoch and loading queue; individual files only render their state. */
export function GitReviewPanel({ ctx, sessionId, mode, visible, tick }: GitReviewPanelProps) {
  useReviewLocale()
  const sessions = (ctx as Context & { sessions: ISessions }).sessions
  const remote = (): GitRemote => {
    const value = sessions.scope(sessionId as SessionId)?.get('remote.fileReview') as
      | GitRemote
      | undefined
    if (!value) throw new Error(t('remoteUnavailable'))
    return value
  }
  const [repository, setRepository] = useState('*')
  const [ref, setRef] = useState('')
  const [data, setData] = useState<GitReviewResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set())
  const [collapsedRepositories, setCollapsedRepositories] = useState<ReadonlySet<string>>(
    () => new Set(),
  )
  const [diffs, setDiffs] = useState<Map<string, GitReviewDiff | string | null>>(new Map())
  const version = useRef(0)
  const requestedDiffs = useRef(new Set<string>())
  const keyOf = (file: GitReviewFileChange) => `${file.repository}\0${file.path}`
  const request = (): GitReviewRequest => ({
    mode,
    ...(repository !== '*' ? { repository } : {}),
    ...(ref ? { ref } : {}),
  })
  useEffect(() => {
    setRepository('*')
    setRef('')
    setCollapsedRepositories(new Set())
  }, [sessionId, mode])
  useEffect(() => {
    if (!visible) return
    const current = ++version.current
    requestedDiffs.current = new Set()
    setLoading(true)
    setError('')
    setExpanded(new Set())
    setDiffs(new Map())
    void Promise.resolve()
      .then(() => unwrap(remote().gitReview(request())))
      .then(result => {
        if (version.current !== current) return
        setData(result)
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
    void loadMissingReviewDiffs(files, keyOf, requestedDiffs.current, async file => {
      if (version.current !== current) return
      const key = keyOf(file)
      setDiffs(value => new Map(value).set(key, null))
      try {
        const result = await unwrap(
          remote().gitReviewDiff({
            ...comparison,
            repository: file.repository,
            path: file.path,
          }),
        )
        if (version.current === current) setDiffs(value => new Map(value).set(key, result))
      } catch (cause) {
        if (version.current === current) {
          setDiffs(value =>
            new Map(value).set(key, cause instanceof Error ? cause.message : String(cause)),
          )
        }
      }
    })
  }
  const setContents = (files: readonly GitReviewFileChange[], open: boolean) => {
    setExpanded(current => setFileContentsExpanded(current, files.map(keyOf), open))
    if (open) loadDiffs(files)
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
  const selectRepository = (path: string) => {
    setRepository(path)
    setRef('')
  }
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
        <select
          aria-label={t('repository')}
          value={repository}
          onChange={event => {
            selectRepository(event.target.value)
          }}
        >
          <option value="*">{t('repoAll')}</option>
          {data?.repositories.map(repo => (
            <option key={repo.path} value={repo.path}>
              {repo.name}
            </option>
          ))}
        </select>
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
                          ctx={ctx}
                          sessionId={sessionId}
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
