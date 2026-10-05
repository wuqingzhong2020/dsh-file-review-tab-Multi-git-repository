import { MULTI_GIT_REPO_MANAGER_REMOTE_NAMESPACE } from 'dsh-multi-git-repo-manager/service-names'
/** Session/Git review page: scope controls, review state and composed turn groups. */
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { FileReviewFileState } from '../change-types.ts'
import { basename, resolveSessionPath, type TurnFileChanges } from './session-changes.ts'
import { summarizeDiffs, type UnifiedDiffStats } from './UnifiedDiff.tsx'
import { t, type CopyKey } from './locales.ts'
import { useReviewLocale } from './use-review-locale.ts'
import { UserGuideDialog } from './UserGuideTab.tsx'
import { useReviewFileOpener } from './review-navigation.tsx'
import { localizeReviewMessage } from './message-locales.ts'
import type { ReviewWorkspace } from '../repository-types.ts'
import { useTargetOwnership } from './use-target-ownership.ts'
import { ALL_DIRECTORIES, defaultTargetFilter, targetSelection, selectionIncludes, isDirectorySelection } from './review-target-selection.ts'
import { fileRepository } from './repository-paths.ts'
import { subscribeRepositories } from './repository-events.ts'
import { GitReviewPanel } from './GitReviewPanel.tsx'
import { ReviewCommentsProvider } from './ReviewComments.tsx'
import { confirmationStoreFor } from './review-confirmations.ts'
import { REVIEW_MODES, REVIEW_SCOPES, isGitReviewMode, isReviewMode } from '../review-scopes.ts'
import { sessionScopeBehavior } from './review-scope-model.ts'
import { DiffViewControls } from './DiffViewControls.tsx'
import {
  addStats,
  type FileReviewRemote,
  type FlatChange,
  type ReviewMode,
} from './file-review-model.ts'
import {
  FileReviewTurn,
  FileReviewStats,
  FileReviewChevron,
  type FileReviewTurnView,
} from './file-review-turn.tsx'
import { useFileReviewConversation } from './use-file-review-conversation.ts'
import { useFileReviewArchive } from './use-file-review-archive.ts'
import { useFileReviewDeepLink } from './use-file-review-deep-link.ts'
import { useFileReviewActions } from './use-file-review-actions.ts'
import css from './FileReviewTab.module.css'

const SUCCESS_NOTICE_DURATION = 3000
const ERROR_NOTICE_DURATION = 8000

/** Review business props supplied by the native sidebar adapter. */
export interface FileReviewTabProps {
  readonly ctx: Context
  readonly sessionId: string
  readonly cwd: string | undefined
  /** Active tab + open panel; live status inspection pauses while false. */
  readonly visible: boolean
  /**
   * Sidebar tab handle. New deep links arrive through the plugin's seed
   * channel; meta.expandPaths is still accepted for older links. Both expand
   * the requested diffs and scroll this tab's own container to the first file.
   */
  readonly meta?: unknown
}

interface Notice {
  readonly seq: number
  readonly tone: 'success' | 'error'
  readonly key: CopyKey
  readonly details?: string | undefined
}

function emptyStateMessage(mode: ReviewMode, repositoryFilter: string): CopyKey {
  const behavior = sessionScopeBehavior(mode)
  return repositoryFilter === '*' ? behavior.empty : behavior.filteredEmpty
}

/** The sidebar tab body; all hooks remain unconditional across review scopes. */
export function FileReviewTab({ ctx, sessionId, cwd, visible, meta }: FileReviewTabProps) {
  useReviewLocale()
  const openFile = useReviewFileOpener()
  const sessions = (ctx as unknown as { readonly sessions: ISessions }).sessions
  const [states, setStates] = useState<ReadonlyMap<string, FileReviewFileState>>(() => new Map())
  const [statusPending, setStatusPending] = useState(false)
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set())
  const [collapsedRepositories, setCollapsedRepositories] = useState<ReadonlySet<string>>(
    () => new Set(),
  )
  const [notice, setNotice] = useState<Notice | null>(null)
  const [guideOpen, setGuideOpen] = useState(false)
  const closeGuide = useCallback(() => setGuideOpen(false), [])
  useEffect(() => { if (!visible) closeGuide() }, [visible, closeGuide])
  const [tick, setTick] = useState(0)
  const [workspace, setWorkspace] = useState<ReviewWorkspace | null>(null)
  const [repositoryFilter, setRepositoryFilter] = useState('*')
  const [reviewMode, setReviewMode] = useState<ReviewMode>('last-turn')
  const lastSessionMode = useRef<ReviewMode>('session')
  const selection = targetSelection(repositoryFilter, workspace?.targets ?? [])
  const directorySelection = isDirectorySelection(selection)
  const isGitMode = isGitReviewMode(reviewMode)
  const scopeBehavior = sessionScopeBehavior(reviewMode)
  const confirmationStore = useMemo(() => confirmationStoreFor(sessionId), [sessionId])
  const confirmationSnapshot = useSyncExternalStore(
    confirmationStore.subscribe,
    confirmationStore.getSnapshot,
    confirmationStore.getSnapshot,
  )
  const [pendingPages, setPendingPages] = useState(1)
  const noticeSeqRef = useRef(0)
  const noticeTimerRef = useRef<number | null>(null)

  useEffect(
    () =>
      subscribeRepositories(() => {
        setTick(value => value + 1)
      }),
    [],
  )
  useEffect(() => {
    setWorkspace(null)
    setRepositoryFilter('*')
    setReviewMode('last-turn')
    setPendingPages(1)
    setCollapsedRepositories(new Set())
    setExpanded(new Set())
  }, [sessionId])
  useEffect(() => {
    if (!visible) return
    let active = true
    const remote = sessions.scope(sessionId as SessionId)?.get(MULTI_GIT_REPO_MANAGER_REMOTE_NAMESPACE) as
      | FileReviewRemote
      | undefined
    void remote
      ?.workspace()
      .then(result => {
        if (active && result.ok) {
          setWorkspace(result.value)
          setRepositoryFilter(current => {
            const targets = result.value.targets
            const defaultValue = defaultTargetFilter(targets)
            if (current === '*') return defaultValue
            if (current === '?' || current === ALL_DIRECTORIES) return current
            return (targets ?? result.value.repositories).some(target => target.path === current && target.state === 'ready') ? current : defaultValue
          })
        }
      })
      .catch(() => {
        /* Re-read on refresh or when the tab becomes visible. */
      })
    return () => {
      active = false
    }
  }, [sessions, sessionId, visible, tick])

  const { snapshot, turns, ready, recordedWarnings } = useFileReviewConversation(ctx, sessions, sessionId, visible, tick)
  const repositories = workspace?.repositories ?? []
  const targets = workspace?.targets ?? []
  const ownership = useTargetOwnership(sessions, sessionId, cwd, visible, workspace, turns)
  useEffect(() => {
    if (!isGitMode) lastSessionMode.current = reviewMode
    else if (directorySelection) setReviewMode(lastSessionMode.current)
  }, [reviewMode, isGitMode, directorySelection])
  const scopeTurns = useMemo(
    () => scopeBehavior.select({ snapshot, turns, confirmed: confirmationSnapshot.confirmed }),
    [snapshot, turns, scopeBehavior, confirmationSnapshot.confirmed],
  )
  const filteredTurns = useMemo(() => {
    if (workspace?.targets) {
      const selected = targetSelection(repositoryFilter, workspace.targets)
      return scopeTurns.map(turn => ({
        ...turn,
        files: turn.files.filter(file => selectionIncludes(selected, ownership.owners.get(file.path))),
      })).filter(turn => turn.files.length > 0)
    }
    if (repositoryFilter === '*') return scopeTurns
    return scopeTurns
      .map(turn => ({
        ...turn,
        files: turn.files.filter(file => {
          const repository = fileRepository(
            resolveSessionPath(cwd, file.path),
            workspace?.repositories ?? [],
          )
          return (repository?.path ?? '?') === repositoryFilter
        }),
      }))
      .filter(turn => turn.files.length > 0)
  }, [scopeTurns, repositoryFilter, workspace, cwd, ownership.owners])

  const {
    mainTurns,
    archivedTurns,
    archivedVisible,
    renderedTurns,
    pendingRemaining,
    archivedRemaining,
    archiveOpen,
    setArchiveOpen,
    setArchivePages,
  } = useFileReviewArchive(sessionId, filteredTurns, reviewMode, pendingPages)
  const flat = useMemo<FlatChange[]>(
    () =>
      renderedTurns.flatMap(turn =>
        turn.files.map(file => ({
          turn: turn.turn,
          path: file.path,
          diffs: file.diffs,
          ...(file.deleted === true ? { deleted: true as const } : {}),
        })),
      ),
    [renderedTurns],
  )
  const inspectable = useMemo(() => flat.filter(item => item.deleted !== true), [flat])
  // Stable content key: the inspect effect re-fires only when the change SET
  // changes, not on every token-flush snapshot identity bump.
  const flatKey = useMemo(
    () => flat.map(item => `${item.turn}|${item.path}|${item.diffs.length}`).join(';'),
    [flat],
  )
  const showNotice = useCallback((tone: Notice['tone'], key: CopyKey, details?: string) => {
    noticeSeqRef.current += 1
    const seq = noticeSeqRef.current
    if (noticeTimerRef.current !== null) window.clearTimeout(noticeTimerRef.current)
    noticeTimerRef.current = window.setTimeout(
      () => {
        setNotice(current => (current?.seq === seq ? null : current))
      },
      tone === 'success' ? SUCCESS_NOTICE_DURATION : ERROR_NOTICE_DURATION,
    )
    setNotice({ seq, tone, key, details })
  }, [])

  const onMissingTarget = useCallback(() => {
    showNotice('error', 'sidebarTargetMissing')
  }, [showNotice])

  const { rowRefs, turnRefs, bodyRef } = useFileReviewDeepLink({
    sessionId,
    turns,
    visible,
    ready: ready && ownership.ready,
    resolveFilter: paths => {
      if (!workspace?.targets) return '*'
      const owner = ownership.owners.get(paths[0] ?? '')
      return owner?.state === 'managed' && owner.target ? owner.target.path : '?'
    },
    meta,
    expanded,
    flatKey,
    setReviewMode,
    setRepositoryFilter,
    setArchiveOpen,
    setArchivePages,
    setExpanded,
    setCollapsedRepositories,
    onMissing: onMissingTarget,
  })



  useEffect(
    () => () => {
      if (noticeTimerRef.current !== null) window.clearTimeout(noticeTimerRef.current)
    },
    [],
  )

  const actions = useFileReviewActions({
    sessions,
    sessionId,
    visible,
    isGitMode,
    flat,
    inspectable,
    flatKey,
    tick,
    showNotice,
    state: { states, setStates, statusPending, setStatusPending, busyKey, setBusyKey },
  })

  const toggleExpanded = useCallback((key: string) => {
    setExpanded(current => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const openInEditor = useCallback(
    (path: string) => {
      if (workspace?.targets && ownership.owners.get(path)?.state !== 'managed') {
        showNotice('error', 'unmanagedOperation')
        return
      }
      const absolute = resolveSessionPath(cwd, path)
      try { openFile(absolute) }
      catch (error) { showNotice('error', 'sidebarOpenFailed', error instanceof Error ? error.message : undefined) }
    },
    [openFile, cwd, showNotice, workspace, ownership.owners],
  )

  const totalStats = useMemo(
    () =>
      flat.reduce<UnifiedDiffStats>((total, item) => addStats(total, summarizeDiffs(item.diffs)), {
        added: 0,
        removed: 0,
      }),
    [flat],
  )

  const turnView: FileReviewTurnView = {
    sessionId,
    cwd,
    workspace,
    ownership: ownership.owners,
    reviewMode,
    expansion: { expanded, collapsedRepositories, setExpanded, setCollapsedRepositories },
    actions,
    confirmationStore,
    confirmationSnapshot,
    rowRefs,
    turnRefs,
    toggleExpanded,
    openInEditor,
  }
  const renderTurn = (turn: TurnFileChanges) => (
    <FileReviewTurn
      key={turn.turn}
      turn={turn}
      fullTurn={turns.find(item => item.turn === turn.turn) ?? turn}
      view={turnView}
    />
  )
  return (
    <div className={css.root}>
      <header className={css.header}>
        <span className={css.headerTitle}>{t('tabTitle')}</span>
        <select
          className={css.scopeSelect}
          aria-label={t('reviewScope')}
          value={reviewMode}
          onChange={event => {
            if (isReviewMode(event.target.value)) setReviewMode(event.target.value)
          }}
        >
          {REVIEW_MODES.map(mode => (
            <option key={mode} value={mode} disabled={directorySelection && isGitReviewMode(mode)}>
              {t(REVIEW_SCOPES[mode].label)}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={css.guideButton}
          title={t('userGuideHint')}
          onClick={() => setGuideOpen(true)}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 20 20"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 4v13M10 5C7 3 4 3 2 4v12c3-1 5-1 8 1 3-2 5-2 8-1V4c-2-1-5-1-8 1Z" />
          </svg>
          {t('userGuide')}
        </button>
        {!isGitMode && flat.length > 0 && <FileReviewStats stats={totalStats} />}
        <button
          type="button"
          className={css.refreshButton}
          disabled={!isGitMode && statusPending}
          title={t('refresh')}
          onClick={() => {
            setTick(value => value + 1)
          }}
        >
          ⟳
        </button>
      </header>
      {guideOpen && visible && <UserGuideDialog ctx={ctx} sessionId={sessionId} onClose={closeGuide} />}
      <ReviewCommentsProvider
        key={sessionId}
        ctx={ctx}
        sessionId={sessionId}
        controls={<DiffViewControls />}
      >
        {!isGitMode && recordedWarnings.map(message => (
          <p className={`${css.notice} ${css.noticeError}`} role="status" key={message}>
            {localizeReviewMessage(message)}
          </p>
        ))}
        {workspace !== null && (workspace.project !== null || targets.length > 0) && (
          <div className={css.repositoryBar}>
            <span title={(workspace.project?.root ?? cwd ?? '')}>
              {t('repoScope', {
                name: (workspace.project?.name ?? '') || basename(workspace.project?.root ?? cwd ?? ''),
                count: repositories.filter(repo => repo.state === 'ready').length,
              })}
            </span>
            <select
              aria-label={t('repository')}
              value={repositoryFilter}
              onChange={event => {
                setRepositoryFilter(event.target.value)
              }}
            >
              <option value="*">{t('repoAll')}</option>
              {(workspace.targets ? targets.filter(target => target.kind === 'git') : repositories)
                .filter(repo => repo.state === 'ready')
                .map(repo => (
                  <option key={repo.path} value={repo.path}>
                    {repo.name}
                  </option>
                ))}
              {targets.some(target => target.kind === 'directory') && <option value={ALL_DIRECTORIES}>{t('repoDirectories')}</option>}
              {targets.filter(target => target.kind === 'directory' && target.state === 'ready').map(target => <option key={target.id} value={target.path}>{target.name} ({t('directoryKind')})</option>)}
              {turns.some(turn => turn.files.some(file => ownership.owners.get(file.path)?.state !== 'managed')) && <option value="?">{t('repoOther')}</option>}
            </select>
            <small title={workspace.warnings.map(localizeReviewMessage).join('\n')}>
              {t('repoSettingsHint')}
              {workspace.warnings.length > 0 ? ' ⚠' : ''}
            </small>
          </div>
        )}
        {directorySelection && <p className={css.pendingHint}>{t('directorySessionOnly')}</p>}
        {!isGitMode && confirmationSnapshot.storageError && (
          <div className={`${css.notice} ${css.noticeError}`} role="alert">
            {t('confirmationStorageError')}
          </div>
        )}
        {notice !== null && (
          <div
            className={`${css.notice} ${notice.tone === 'success' ? css.noticeSuccess : css.noticeError}`}
            role="alert"
          >
            {t(notice.key)}
            {notice.details ? `: ${localizeReviewMessage(notice.details)}` : ''}
          </div>
        )}
        {isGitMode ? (
          <GitReviewPanel
            ctx={ctx}
            sessionId={sessionId}
            mode={reviewMode}
            visible={visible}
            tick={tick}
            repositoryFilter={repositoryFilter}
          />
        ) : (
          <div className={css.body} ref={bodyRef}>
            {scopeBehavior.pagination === 'pending' && (
              <p className={css.pendingHint}>{t('reviewPendingHint')}</p>
            )}
            {filteredTurns.length === 0 ? (
              <div className={css.empty}>{t(emptyStateMessage(reviewMode, repositoryFilter))}</div>
            ) : (
              <>
                {mainTurns.map(renderTurn)}
                {pendingRemaining > 0 && (
                  <button
                    type="button"
                    className={css.archiveLoadMore}
                    onClick={() => {
                      setPendingPages(current => current + 1)
                    }}
                  >
                    {t('loadMore', { n: pendingRemaining })}
                  </button>
                )}
                {archivedTurns.length > 0 && (
                  <div className={css.archiveSection}>
                    <button
                      type="button"
                      className={css.archiveHeader}
                      aria-expanded={archiveOpen}
                      aria-label={archiveOpen ? t('archivedCollapse') : t('archivedExpand')}
                      onClick={() => {
                        setArchiveOpen(current => !current)
                      }}
                    >
                      <FileReviewChevron open={archiveOpen} />
                      <span className={css.archiveTitle}>
                        {t('archived', { n: String(archivedTurns.length) })}
                      </span>
                    </button>
                    {/* Closed archives mount no turns; open archives mount only loaded pages. */}
                    {archiveOpen && (
                      <>
                        {archivedVisible.map(renderTurn)}
                        {archivedRemaining > 0 && (
                          <button
                            type="button"
                            className={css.archiveLoadMore}
                            onClick={() => {
                              setArchivePages(current => current + 1)
                            }}
                          >
                            {t('loadMore', { n: String(archivedRemaining) })}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </ReviewCommentsProvider>
    </div>
  )
}
