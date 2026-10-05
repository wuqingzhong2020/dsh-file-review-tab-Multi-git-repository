import { FILE_REVIEW_REMOTE_NAMESPACE } from '../service-names.ts'
import { useCallback, useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type {
  FileReviewAction,
  FileReviewFileState,
  FileReviewRequest,
  FileReviewResult,
} from '../change-types.ts'
import { t, type CopyKey } from './locales.ts'
import { stateKey, type FileReviewRemote, type FlatChange } from './file-review-model.ts'

interface FileReviewActionState {
  readonly states: ReadonlyMap<string, FileReviewFileState>
  readonly setStates: Dispatch<SetStateAction<ReadonlyMap<string, FileReviewFileState>>>
  readonly statusPending: boolean
  readonly setStatusPending: Dispatch<SetStateAction<boolean>>
  readonly busyKey: string | null
  readonly setBusyKey: Dispatch<SetStateAction<string | null>>
}

interface FileReviewActionOptions {
  readonly sessions: ISessions
  readonly sessionId: string
  readonly visible: boolean
  readonly isGitMode: boolean
  readonly flat: readonly FlatChange[]
  readonly inspectable: readonly FlatChange[]
  readonly flatKey: string
  readonly tick: number
  readonly showNotice: (tone: 'success' | 'error', key: CopyKey, details?: string) => void
  readonly state: FileReviewActionState
}

/** Inspect displayed changes and serialize per-turn/per-file undo and redo. */
export function useFileReviewActions({
  sessions,
  sessionId,
  visible,
  isGitMode,
  flat,
  inspectable,
  flatKey,
  tick,
  showNotice,
  state,
}: FileReviewActionOptions) {
  const { states, setStates, statusPending, setStatusPending, busyKey, setBusyKey } = state

  // The Remote invocation path mirrors dsh-file-review: session scopes are
  // minted by the client runtime and cannot statically inject namespaces
  // contributed later, so the namespace rides ctx.get on the session scope.
  const invoke = useCallback(
    async (method: 'status' | 'apply', request: FileReviewRequest): Promise<FileReviewResult> => {
      const scope = sessions.scope(sessionId as SessionId)
      if (scope === undefined) throw new Error(t('sessionUnavailable'))
      const remote = scope.get(FILE_REVIEW_REMOTE_NAMESPACE) as FileReviewRemote | undefined
      if (remote === undefined) throw new Error(t('remoteUnavailable'))
      const result = await remote[method](request)
      if (!result.ok) throw new Error(result.error.message)
      return result.value
    },
    [sessions, sessionId],
  )

  // Host-side state inspection: which recorded changes are still applied,
  // already undone, or in conflict. Paused while the tab is not visible.
  useEffect(() => {
    if (!visible || isGitMode || flat.length === 0) {
      setStatusPending(false)
      return
    }
    let active = true
    setStatusPending(true)
    // Debounce trailing-edge: streaming turns keep bumping flatKey per hunk;
    // only one host round-trip survives a 300ms quiet window.
    const timer = window.setTimeout(() => {
      const request: FileReviewRequest = {
        action: 'undo',
        files: inspectable.map(item => ({ path: item.path, diffs: item.diffs })),
      }
      invoke('status', request)
        .then(result => {
          if (!active) return
          setStates(() => {
            const next = new Map<string, FileReviewFileState>()
            inspectable.forEach((item, index) => {
              const file = result.files[index]
              if (file !== undefined) next.set(stateKey(item.turn, item.path), file.state)
            })
            return next
          })
        })
        .catch(() => {
          // Transient inspection failure: the buttons stay usable — apply runs
          // the same Host-side checks again before touching disk.
        })
        .finally(() => {
          if (active) setStatusPending(false)
        })
    }, 300)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, isGitMode, flatKey, tick, invoke])

  const mergeResultStates = useCallback(
    (items: readonly FlatChange[], result: FileReviewResult) => {
      setStates(current => {
        const next = new Map(current)
        items.forEach((item, index) => {
          const file = result.files[index]
          if (file !== undefined) next.set(stateKey(item.turn, item.path), file.state)
        })
        return next
      })
    },
    [],
  )

  /** Toggle one change set (a whole turn, or one file) undo ↔ redo. */
  const runToggle = useCallback(
    (key: string, items: readonly FlatChange[], action: FileReviewAction) => {
      if (busyKey !== null || items.length === 0) return
      setBusyKey(key)
      invoke('apply', {
        action,
        files: items.map(item => ({ path: item.path, diffs: item.diffs })),
      })
        .then(result => {
          mergeResultStates(items, result)
          const target = action === 'undo' ? 'undone' : 'applied'
          const failures = result.files.filter(file => file.state !== target)
          if (failures.length === 0) {
            showNotice('success', action === 'undo' ? 'undoSuccess' : 'redoSuccess')
          } else {
            showNotice('error', action === 'undo' ? 'undoPartial' : 'redoPartial')
          }
        })
        .catch((error: unknown) => {
          showNotice('error', 'toggleError', error instanceof Error ? error.message : String(error))
        })
        .finally(() => {
          setBusyKey(null)
        })
    },
    [busyKey, invoke, mergeResultStates, showNotice],
  )

  return { states, statusPending, busyKey, runToggle }
}

export type FileReviewActions = ReturnType<typeof useFileReviewActions>
