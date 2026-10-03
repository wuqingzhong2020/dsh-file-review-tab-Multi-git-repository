import { useCallback, useEffect, useRef } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { ARCHIVE_PAGE_TURNS, splitArchivedTurns, type TurnFileChanges } from './session-changes.ts'
import { currentFileReviewSeed, subscribeFileReviewSeed, type FileReviewSeed } from './deep-link.ts'
import { stateKey, type ReviewMode } from './file-review-model.ts'

interface PendingScroll {
  readonly rowKey: string
  readonly turn: number | null
}

interface DeepLinkOptions {
  readonly sessionId: string
  readonly turns: readonly TurnFileChanges[]
  readonly visible: boolean
  readonly meta: unknown
  readonly expanded: ReadonlySet<string>
  readonly flatKey: string
  readonly setReviewMode: Dispatch<SetStateAction<ReviewMode>>
  readonly setRepositoryFilter: Dispatch<SetStateAction<string>>
  readonly setArchiveOpen: Dispatch<SetStateAction<boolean>>
  readonly setArchivePages: Dispatch<SetStateAction<number>>
  readonly setExpanded: Dispatch<SetStateAction<ReadonlySet<string>>>
  readonly setCollapsedRepositories: Dispatch<SetStateAction<ReadonlySet<string>>>
}

/** Replay chat links without replacing the user's expansion or scrolling the sidebar shell. */
export function useFileReviewDeepLink({
  sessionId,
  turns,
  visible,
  meta,
  expanded,
  flatKey,
  setReviewMode,
  setRepositoryFilter,
  setArchiveOpen,
  setArchivePages,
  setExpanded,
  setCollapsedRepositories,
}: DeepLinkOptions) {
  const turnsRef = useRef(turns)
  turnsRef.current = turns
  const archivedTurnsRef = useRef(splitArchivedTurns(turns).archived)
  archivedTurnsRef.current = splitArchivedTurns(turns).archived

  // Row and turn refs let single-file and whole-turn links use distinct targets.
  const rowRefs = useRef(new Map<string, HTMLLIElement>())
  const turnRefs = useRef(new Map<number, HTMLElement>())
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const lastSeedNonceRef = useRef<number | undefined>(undefined)
  const pendingScrollRef = useRef<PendingScroll | null>(null)

  // The seed channel supports repeated links because better-sidebar may retain
  // an existing tab's meta. Merge expansions instead of replacing user choices.
  const replayLink = useCallback(
    (paths: readonly string[], targetTurn: number | undefined) => {
      if (paths.length === 0) return
      setReviewMode('session')
      setRepositoryFilter('*')
      // Open enough archive pages to mount the target before attempting to scroll.
      const ownerTurn =
        targetTurn !== undefined
          ? turnsRef.current.find(turn => turn.turn === targetTurn)
          : turnsRef.current.find(turn => turn.files.some(file => paths.includes(file.path)))
      if (ownerTurn !== undefined && ownerTurn.live !== true) {
        const archivedIndex = archivedTurnsRef.current.findIndex(
          turn => turn.turn === ownerTurn.turn,
        )
        if (archivedIndex !== -1) {
          setArchiveOpen(true)
          setArchivePages(current =>
            Math.max(current, Math.ceil((archivedIndex + 1) / ARCHIVE_PAGE_TURNS)),
          )
        }
      }
      // With a turn anchor only THAT turn's rows expand — a path that recurs in
      // other turns stays collapsed there; without one, every occurrence expands
      // (legacy meta shape).
      const matches = (item: { turn: number; path: string }): boolean =>
        paths.includes(item.path) && (targetTurn === undefined || item.turn === targetTurn)
      const allFiles = turnsRef.current.flatMap(turn =>
        turn.files.map(file => ({ turn: turn.turn, path: file.path })),
      )
      const linkedTurns = new Set(allFiles.filter(matches).map(item => item.turn))
      setCollapsedRepositories(
        current =>
          new Set(
            [...current].filter(key => {
              const [ownerSession, ownerTurn] = JSON.parse(key) as [string, number, string]
              return ownerSession !== sessionId || !linkedTurns.has(ownerTurn)
            }),
          ),
      )
      setExpanded(current => {
        const next = new Set(current)
        for (const item of allFiles) {
          if (matches(item)) next.add(stateKey(item.turn, item.path))
        }
        return next
      })
      const first = allFiles.find(item => matches(item))
      // Multi-path links (the 审查 button) target the turn group so the whole
      // review leads the viewport; single-path links (a file chip) target that
      // file's row. An unmatched link leaves nothing pending.
      pendingScrollRef.current =
        first === undefined
          ? null
          : {
              rowKey: stateKey(first.turn, first.path),
              turn: paths.length > 1 ? first.turn : null,
            }
    },
    [sessionId],
  )

  useEffect(() => {
    const replay = (seed: FileReviewSeed): void => {
      if (lastSeedNonceRef.current === seed.nonce) return
      lastSeedNonceRef.current = seed.nonce
      replayLink(seed.paths, seed.turn)
    }
    const pending = currentFileReviewSeed(sessionId)
    if (pending !== undefined) replay(pending)
    return subscribeFileReviewSeed((ownerSessionId, seed) => {
      if (ownerSessionId === sessionId) replay(seed)
    })
  }, [sessionId, replayLink])

  // Legacy meta fallback (better-sidebar versions that still deliver
  // `expandPaths` through meta); harmless when no meta is ever written.
  useEffect(() => {
    if (typeof meta !== 'object' || meta === null || Array.isArray(meta)) return
    const raw = (meta as { expandPaths?: unknown }).expandPaths
    if (!Array.isArray(raw)) return
    const paths = raw.filter((value): value is string => typeof value === 'string')
    const turnNo = (meta as { turn?: unknown }).turn
    const targetTurn = typeof turnNo === 'number' && Number.isInteger(turnNo) ? turnNo : undefined
    replayLink(paths, targetTurn)
  }, [meta, replayLink])

  // Keep a missing target pending while its snapshot/rows arrive. Whole-turn
  // links target the header; file links target a row. Scroll only this tab body:
  // scrollIntoView would also move sidebar ancestors and hide the tab strip.
  // The second scroll accounts for diff bodies mounting one layout pass later.
  useEffect(() => {
    if (!visible) return
    const pending = pendingScrollRef.current
    if (pending === null) return
    const element =
      (pending.turn !== null ? turnRefs.current.get(pending.turn) : undefined) ??
      rowRefs.current.get(pending.rowKey)
    if (element === undefined) return
    pendingScrollRef.current = null
    const scroll = () => {
      const container = bodyRef.current
      if (container === null) return
      const delta = element.getBoundingClientRect().top - container.getBoundingClientRect().top
      container.scrollTo({ top: container.scrollTop + delta - 8, behavior: 'smooth' })
    }
    scroll()
    const timer = window.setTimeout(scroll, 150)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, expanded, meta, flatKey])

  return { rowRefs, turnRefs, bodyRef }
}
