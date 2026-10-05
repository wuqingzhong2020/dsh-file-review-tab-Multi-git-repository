import { useEffect, useRef, useState } from 'react'
import type { Dispatch, MutableRefObject, ReactNode, SetStateAction } from 'react'
import type { FileReviewAction, FileReviewFileState } from '../change-types.ts'
import type { ReviewWorkspace } from '../repository-types.ts'
import { isSessionReviewMode } from '../review-scopes.ts'
import {
  basename,
  resolveSessionPath,
  type SessionFileChange,
  type TurnFileChanges,
} from './session-changes.ts'
import { summarizeDiffs, UnifiedDiff, type UnifiedDiffStats } from './UnifiedDiff.tsx'
import { t } from './locales.ts'
import {
  fileRepository,
  repositoryRelativePath,
  relativeProjectDirectory,
} from './repository-paths.ts'
import { ReviewFileCommentButton, ReviewFileCommentThread } from './ReviewComments.tsx'
import type { ReviewCommentTarget } from './review-comments.ts'
import {
  isTurnConfirmed,
  type ReviewConfirmationSnapshot,
  type ReviewConfirmationStore,
} from './review-confirmations.ts'
import {
  allFileContentsExpanded,
  groupReviewFiles,
  repositoryGroupId,
  setFileContentsExpanded,
  setRepositoryGroupsCollapsed,
} from './review-repository-groups.ts'
import { FileContentsButton, ReviewRepositoryGroup } from './ReviewRepositoryGroup.tsx'
import { addStats, isReversible, stateKey, type ReviewMode } from './file-review-model.ts'
import type { FileReviewActions } from './use-file-review-actions.ts'
import css from './FileReviewTab.module.css'
import { AggregateCopyButton } from './AggregateCopyButton.tsx'
import type { AggregateDiffFile } from './aggregate-diff.ts'
import { localizeReviewMessage } from './message-locales.ts'

interface FileReviewExpansion {
  readonly expanded: ReadonlySet<string>
  readonly collapsedRepositories: ReadonlySet<string>
  readonly setExpanded: Dispatch<SetStateAction<ReadonlySet<string>>>
  readonly setCollapsedRepositories: Dispatch<SetStateAction<ReadonlySet<string>>>
}

/** Controlled turn rendering; lifecycle and Host operations stay in the page hooks. */
export interface FileReviewTurnView {
  readonly sessionId: string
  readonly cwd: string | undefined
  readonly workspace: ReviewWorkspace | null
  readonly reviewMode: ReviewMode
  readonly expansion: FileReviewExpansion
  readonly actions: FileReviewActions
  readonly confirmationStore: ReviewConfirmationStore
  readonly confirmationSnapshot: ReviewConfirmationSnapshot
  readonly rowRefs: MutableRefObject<Map<string, HTMLLIElement>>
  readonly turnRefs: MutableRefObject<Map<number, HTMLElement>>
  readonly toggleExpanded: (key: string) => void
  readonly openInEditor: (path: string) => void
}

export function FileReviewStats({ stats }: { readonly stats: UnifiedDiffStats }) {
  return (
    <span
      className={css.stats}
      aria-label={t('stats', {
        added: String(stats.added),
        removed: String(stats.removed),
      })}
    >
      <span className={css.added}>+{stats.added}</span>
      <span className={css.removed}>-{stats.removed}</span>
    </span>
  )
}

function UndoIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={css.buttonIcon}>
      <path d="M8 5 4 9l4 4M4 9h7a5 5 0 0 1 5 5v1" />
    </svg>
  )
}

function RedoIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={css.buttonIcon}>
      <path d="m12 5 4 4-4 4M16 9H9a5 5 0 0 0-5 5v1" />
    </svg>
  )
}

export function FileReviewChevron({ open }: { readonly open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={`${css.chevron} ${open ? css.chevronOpen : ''}`}
    >
      <path d="m7 5 5 5-5 5" />
    </svg>
  )
}

/** Per-(turn,file) host-inspected state badge; nothing renders for 'applied'. */
function StateBadge({ state }: { readonly state: FileReviewFileState | undefined }) {
  if (state === undefined || state === 'applied') return null
  const label =
    state === 'undone'
      ? t('stateUndone')
      : state === 'conflict'
        ? t('stateConflict')
        : state === 'unsupported'
          ? t('stateUnsupported')
          : t('stateError')
  const tone =
    state === 'undone' ? css.badgeUndone : state === 'unsupported' ? css.badgeMuted : css.badgeError
  return <span className={`${css.stateBadge} ${tone}`}>{label}</span>
}

/** Mounts the heavy diff renderer only when the row nears the viewport. */
function LazyDiff({ children }: { children: ReactNode }) {
  const holderRef = useRef<HTMLDivElement | null>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    if (inView) return
    const element = holderRef.current
    if (element === null) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px 0px' },
    )
    observer.observe(element)
    return () => {
      observer.disconnect()
    }
  }, [inView])
  return <div ref={holderRef}>{inView ? children : <div style={{ minHeight: '96px' }} />}</div>
}

/** A filtered turn retains its complete original turn for confirmation identity. */
export function FileReviewTurn({
  turn,
  fullTurn,
  view,
}: {
  readonly turn: TurnFileChanges
  readonly fullTurn: TurnFileChanges
  readonly view: FileReviewTurnView
}) {
  const {
    sessionId,
    cwd,
    workspace,
    expansion,
    actions,
    confirmationStore,
    confirmationSnapshot,
    turnRefs,
  } = view
  const { expanded, collapsedRepositories, setExpanded, setCollapsedRepositories } = expansion
  const { states, statusPending, busyKey, runToggle } = actions
  const ownerOf = (path: string) =>
    fileRepository(resolveSessionPath(cwd, path), workspace?.repositories ?? [])

  const repositoryGroups = groupReviewFiles(turn.files, file => {
    const repository = ownerOf(file.path)
    if (repository) return { key: repository.path, name: repository.name, path: repository.path }
    if (workspace?.project) return { key: '?', name: t('repoOther'), path: '' }
    return { key: cwd ?? '?', name: basename(cwd ?? '') || t('repoOther'), path: cwd ?? '' }
  })
  const groupKeys = repositoryGroups.map(group =>
    repositoryGroupId(sessionId, turn.turn, group.key),
  )
  const fileKeys = turn.files.map(file => stateKey(turn.turn, file.path))
  const allExpanded =
    allFileContentsExpanded(expanded, fileKeys) &&
    groupKeys.every(key => !collapsedRepositories.has(key))
  const confirmed = isTurnConfirmed(fullTurn, confirmationSnapshot.confirmed)
  const turnStats = turn.files.reduce<UnifiedDiffStats>(
    (total, file) => addStats(total, summarizeDiffs(file.diffs)),
    { added: 0, removed: 0 },
  )
  const reversible = turn.files.filter(isReversible)
  const allUndone =
    reversible.length > 0 &&
    reversible.every(file => states.get(stateKey(turn.turn, file.path)) === 'undone')
  const turnAction: FileReviewAction = allUndone ? 'redo' : 'undo'
  const turnKey = `turn:${turn.turn}`
  const turnBusy = busyKey === turnKey
  const confirmTitle = fullTurn.live
    ? t('confirmTurnLive')
    : confirmed
      ? t('unconfirmTurnHint')
      : t('confirmTurnHint', { count: fullTurn.files.length })
  const copyFiles = (files: readonly SessionFileChange[]): AggregateDiffFile[] => files.map(file => ({
    repository: ownerOf(file.path)?.path ?? cwd ?? '?',
    path: file.path,
    source: `Session ${sessionId}; turn ${turn.turn}; ${view.reviewMode}`,
    diffs: file.diffs,
    ...(file.note || file.deleted ? { note: file.note ?? 'Terminal deletion: no recoverable snapshot' } : {}),
  }))
  return (
    <section
      key={turn.turn}
      ref={element => {
        if (element === null) turnRefs.current.delete(turn.turn)
        else turnRefs.current.set(turn.turn, element)
      }}
      className={css.turnGroup}
    >
      <header className={css.turnHeader}>
        <span className={css.turnTitle}>{t('turn', { n: turn.turn })}</span>
        {turn.live && <span className={css.liveBadge}>{t('turnLive')}</span>}
        {confirmed && <span className={css.confirmedBadge}>{t('turnConfirmed')}</span>}
        <span className={css.turnCount}>
          {turn.files.length === 1 ? t('filesOne') : t('files', { count: turn.files.length })}
        </span>
        <FileReviewStats stats={turnStats} />
        <div className={css.turnActions}>
          <AggregateCopyButton load={async () => copyFiles(turn.files)} />
          <FileContentsButton
            expanded={allExpanded}
            label={t(allExpanded ? 'collapseTurnRepositories' : 'expandTurnRepositories')}
            onClick={() => {
              setExpanded(current => setFileContentsExpanded(current, fileKeys, !allExpanded))
              if (!allExpanded)
                setCollapsedRepositories(current =>
                  setRepositoryGroupsCollapsed(current, groupKeys, false),
                )
            }}
          />
          <button
            type="button"
            className={css.actionButton}
            disabled={fullTurn.live || busyKey !== null}
            title={confirmTitle}
            onClick={() => {
              confirmationStore.setConfirmed(fullTurn, !confirmed)
            }}
          >
            {t(confirmed ? 'unconfirmTurn' : 'confirmTurn')}
          </button>
          <button
            type="button"
            className={css.actionButton}
            disabled={statusPending || busyKey !== null || reversible.length === 0}
            title={reversible.length === 0 ? t('toggleUnavailable') : undefined}
            onClick={() => {
              runToggle(
                turnKey,
                turn.files
                  .filter(file => file.deleted !== true)
                  .map(file => ({
                    turn: turn.turn,
                    path: file.path,
                    diffs: file.diffs,
                  })),
                turnAction,
              )
            }}
          >
            {turnAction === 'undo' ? <UndoIcon /> : <RedoIcon />}
            {turnBusy
              ? t(turnAction === 'undo' ? 'undoing' : 'redoing')
              : t(turnAction === 'undo' ? 'undoTurn' : 'redoTurn')}
          </button>
        </div>
      </header>
      {repositoryGroups.map(group => {
        const groupId = repositoryGroupId(sessionId, turn.turn, group.key)
        const groupFileKeys = group.files.map(file => stateKey(turn.turn, file.path))
        return (
          <ReviewRepositoryGroup
            key={`${sessionId}:${turn.turn}:${group.key}`}
            name={group.name}
            path={group.path}
            count={group.files.length}
            actions={<AggregateCopyButton load={async () => copyFiles(group.files)} />}
            collapsed={collapsedRepositories.has(groupId)}
            onCollapsedChange={collapsed => {
              setCollapsedRepositories(current =>
                setRepositoryGroupsCollapsed(current, [groupId], collapsed),
              )
            }}
            contentsExpanded={allFileContentsExpanded(expanded, groupFileKeys)}
            onContentsExpandedChange={open => {
              setExpanded(current => setFileContentsExpanded(current, groupFileKeys, open))
            }}
          >
            <ul className={css.fileList}>
              {group.files.map(file => (
                <FileReviewFile key={file.path} turn={turn} file={file} view={view} />
              ))}
            </ul>
          </ReviewRepositoryGroup>
        )
      })}
    </section>
  )
}

/** One file row owns its comment target and mounts a diff only while expanded. */
function FileReviewFile({
  turn,
  file,
  view,
}: {
  readonly turn: TurnFileChanges
  readonly file: SessionFileChange
  readonly view: FileReviewTurnView
}) {
  const {
    sessionId,
    cwd,
    workspace,
    reviewMode,
    expansion,
    actions,
    rowRefs,
    toggleExpanded,
    openInEditor,
  } = view
  const { expanded } = expansion
  const { states, statusPending, busyKey, runToggle } = actions
  const ownerOf = (path: string) =>
    fileRepository(resolveSessionPath(cwd, path), workspace?.repositories ?? [])
  const key = stateKey(turn.turn, file.path)
  const isOpen = expanded.has(key)
  const state = states.get(key)
  const reversible = isReversible(file)
  const fileAction: FileReviewAction = state === 'undone' ? 'redo' : 'undo'
  const fileBusy = busyKey === key
  const stats = summarizeDiffs(file.diffs)
  const repository = ownerOf(file.path)
  const absolutePath = resolveSessionPath(cwd, file.path)
  const commentTarget: ReviewCommentTarget = {
    scope: isSessionReviewMode(reviewMode) ? reviewMode : 'session',
    turn: turn.turn,
    repository: repository?.path ?? cwd ?? '',
    repositoryName: repository?.name ?? basename(cwd ?? ''),
    path: repository
      ? repositoryRelativePath(absolutePath, repository)
      : (relativeProjectDirectory(cwd ?? '', absolutePath) ?? file.path),
    absolutePath,
  }
  return (
    <li
      key={file.path}
      className={css.fileItem}
      ref={element => {
        if (element === null) rowRefs.current.delete(key)
        else rowRefs.current.set(key, element)
      }}
    >
      <div
        className={css.fileRow}
        role="button"
        tabIndex={0}
        title={file.path}
        aria-expanded={isOpen}
        onClick={() => {
          toggleExpanded(key)
        }}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            toggleExpanded(key)
          }
        }}
      >
        <FileReviewChevron open={isOpen} />
        <span className={css.fileName}>{commentTarget.path}</span>
        {file.deleted !== true && file.diffs.length > 0 && file.diffs.every(diff => diff.recordId) && (
          <span
            className={css.stateBadge}
            aria-label={t(file.diffs[0]?.oldText === null ? 'reviewCreated' : 'reviewModified')}
          >
            {file.diffs[0]?.oldText === null ? 'A' : 'M'}
          </span>
        )}
        {file.deleted === true ? (
          <span className={css.deletedBadge}>{t('deleted')}</span>
        ) : (
          <FileReviewStats stats={stats} />
        )}
        {file.deleted !== true && <StateBadge state={state} />}
        <ReviewFileCommentButton target={commentTarget} />
        {file.deleted !== true && (
          <button
            type="button"
            className={`${css.smallButton} ${css.editorButton}`}
            onClick={event => {
              event.stopPropagation()
              openInEditor(file.path)
            }}
          >
            {t('openInEditor')}
          </button>
        )}
        <button
          type="button"
          className={css.smallButton}
          disabled={statusPending || busyKey !== null || !reversible}
          title={
            file.deleted === true
              ? t('deletedHint')
              : !reversible
                ? t('toggleUnavailable')
                : undefined
          }
          onClick={event => {
            event.stopPropagation()
            runToggle(key, [{ turn: turn.turn, path: file.path, diffs: file.diffs }], fileAction)
          }}
        >
          {fileBusy
            ? t(fileAction === 'undo' ? 'undoing' : 'redoing')
            : t(fileAction === 'undo' ? 'undo' : 'redo')}
        </button>
      </div>
      <ReviewFileCommentThread target={commentTarget} />
      {isOpen && (
        <div className={css.diffWrap}>
          {file.note && <p role="status">{localizeReviewMessage(file.note)}</p>}
          <LazyDiff>
            <FileReviewDiff sessionId={sessionId} file={file} target={commentTarget} />
          </LazyDiff>
        </div>
      )}
    </li>
  )
}

/** Display data may include full context; Host undo always uses the original hunks. */
function FileReviewDiff({
  sessionId,
  file,
  target,
}: {
  readonly sessionId: string
  readonly file: SessionFileChange
  readonly target: ReviewCommentTarget
}) {
  if (file.deleted === true) return <p className={css.diffUnavailable}>{t('deletedHint')}</p>
  if (file.diffs.length === 0) return <p className={css.diffUnavailable}>{t('unavailable')}</p>
  return (
    <UnifiedDiff
      diffs={file.reviewDiffs ?? file.diffs}
      sourceKey={JSON.stringify([sessionId, target.turn, target.repository, file.path])}
      contextLines={3}
      showCopyButton
      showFileHeaders={false}
      labels={{
        copy: t('copy'),
        copied: t('copied'),
        expandContext: (count, remaining) => t('expandContext', { count, remaining }),
        collapseContext: t('collapseContext'),
        unavailableContext: count => t('unavailableContext', { count }),
      }}
      className={css.reviewDiff}
      reviewTarget={target}
    />
  )
}
