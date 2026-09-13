/**
 * Session-wide produced-file derivation from a finalized ConversationSnapshot.
 *
 * dsh 0.1.5 removed the pre-rendered `callView` from `ToolResultNode`; the
 * mutation facts now live in the call head (`call.name` + `call.argsRaw`) and
 * the tool-private result metadata (`meta.diffs`). This module folds those
 * into per-turn file changes for the sidebar tab, walking the settled tool
 * nodes and, recursively, their Code Mode (`run_code`) sub-calls. Turn
 * attribution still rides the Chat snapshot's `turnEnds` / live counters.
 *
 * Client-only and model-free: the vocabulary is the mutation tools' own call
 * arguments and result metadata, never the closing prose.
 */
import type {
  ConversationSnapshot, ToolCallBlock, ToolResultNode,
} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { ProducedFileDiff, RecordedMutation } from '../change-types.ts'
import { appliedDiffs, callIntent } from './mutation-call.ts'
import { normalizeSnapshot } from './snapshot-compat.ts'
import { diffsFromBeforeAfter } from './recorded-diffs.ts'

/** One changed file inside one turn, hunks appended in settlement order. */
export interface SessionFileChange {
  readonly path: string
  readonly diffs: readonly ProducedFileDiff[]
  /** Terminal commands deleted this path in this turn (display-only). */
  readonly deleted?: true
}

/** One turn's produced files, in first-seen order. */
export interface TurnFileChanges {
  readonly turn: number
  /** Whether the owning turn is still running (its change set may grow). */
  readonly live: boolean
  readonly files: readonly SessionFileChange[]
}

/** Internal per-path accumulator: hunk list plus the last deletion state. */
interface FileAccumulator {
  diffs: ProducedFileDiff[]
  deleted?: true
}

/** One mutation extracted from a settled tool block. */
interface BlockChange {
  readonly path: string
  readonly diffs: readonly ProducedFileDiff[]
  readonly deleted?: true
}

/** The call head of a running or settled tool block, when it carries one. */
function callOf(block: ToolCallBlock): { readonly name: string; readonly argsRaw: string } | null {
  const record = block as {
    call?: { name?: unknown; argsRaw?: unknown } | null
    name?: unknown
    argsRaw?: unknown
  }
  if (record.call !== undefined && record.call !== null) {
    if (typeof record.call.name === 'string' && typeof record.call.argsRaw === 'string') {
      return { name: record.call.name, argsRaw: record.call.argsRaw }
    }
    return null
  }
  if (typeof record.name === 'string' && typeof record.argsRaw === 'string') {
    return { name: record.name, argsRaw: record.argsRaw }
  }
  return null
}

/** The applied hunks for one settled block, or the call-argument intent. */
function blockChanges(block: ToolCallBlock): readonly BlockChange[] {
  const call = callOf(block)
  if (call === null) return []
  const intent = callIntent(call.name, call.argsRaw)
  if (intent === null) return []
  const settled = (block as { isError?: unknown }).isError !== undefined
  if (settled && (block as ToolResultNode).isError) return []

  const changes: BlockChange[] = []
  if (intent.path !== null) {
    let diffs = intent.diffs
    if (settled) {
      const applied = appliedDiffs((block as ToolResultNode).meta)
      if (applied !== null) {
        const own = applied.filter(diff => diff.path === intent.path)
        if (own.length > 0) diffs = own
      }
    }
    if (diffs.length > 0) changes.push({ path: intent.path, diffs })
  }
  for (const path of intent.deletions) changes.push({ path, diffs: [], deleted: true })
  return changes
}

/** Settled changes for a tool block tree (the block itself plus `subCalls`). */
function collectChanges(block: ToolCallBlock, out: BlockChange[]): void {
  const settledNode = block as ToolResultNode
  if (settledNode.kind === 'tool-result') {
    for (const change of blockChanges(block)) out.push(change)
  }
  const subCalls = (block as { subCalls?: unknown }).subCalls
  if (!Array.isArray(subCalls)) return
  for (const child of subCalls) {
    const node = child as ToolCallBlock
    if ((node as ToolResultNode).kind === 'tool-result') collectChanges(node, out)
  }
}

/**
 * Attribute an event seq to its owning turn. Completed turns own the seq
 * range up to their `turn/end` seq; anything past the last completed end
 * belongs to the live turn (the in-flight `partial` / running call's turn,
 * or the next turn number when nothing live is observable).
 */
function turnAttribution(snapshot: ConversationSnapshot): (seq: number) => { turn: number; live: boolean } {
  const view = normalizeSnapshot(snapshot)
  const ends = [...(view?.turnEnds.entries() ?? [])].sort((a, b) => a[1] - b[1])
  const liveTurn = view?.partial?.turn
    ?? view?.runningCalls[0]?.turn
    ?? ((ends.at(-1)?.[0] ?? 0) + 1)
  return (seq: number) => {
    for (const [turn, endSeq] of ends) {
      if (endSeq >= seq) return { turn, live: false }
    }
    return { turn: liveTurn, live: true }
  }
}

/** Derive one session's per-turn produced-file changes (uncached core). */
function derive(snapshot: ConversationSnapshot): TurnFileChanges[] {
  const attribute = turnAttribution(snapshot)
  const byTurn = new Map<number, { live: boolean; files: Map<string, FileAccumulator> }>()
  const view = normalizeSnapshot(snapshot)
  for (const node of (view?.nodes ?? []) as readonly ToolResultNode[]) {
    if (node.kind !== 'tool-result' || node.isError) continue
    const changes: BlockChange[] = []
    collectChanges(node, changes)
    if (changes.length === 0) continue
    const { turn, live } = attribute(node.seq)
    let group = byTurn.get(turn)
    if (group === undefined) {
      group = { live, files: new Map() }
      byTurn.set(turn, group)
    }
    for (const change of changes) {
      const existing = group.files.get(change.path)
      if (change.deleted === true) {
        if (existing === undefined) group.files.set(change.path, { diffs: [], deleted: true })
        else existing.deleted = true
        continue
      }
      if (existing === undefined) group.files.set(change.path, { diffs: [...change.diffs] })
      else {
        existing.diffs.push(...change.diffs)
        delete existing.deleted
      }
    }
  }
  return [...byTurn.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([turn, group]) => ({
      turn,
      live: group.live,
      files: [...group.files.entries()].map(([path, own]) => ({
        path,
        diffs: own.diffs,
        ...(own.deleted === true ? { deleted: true as const } : {}),
      })),
    }))
}

/**
 * Snapshot-identity cache: the sidebar badge runs this derivation on every
 * tab-bar render, so the result is memoized per immutable snapshot reference
 * (the session publishes a fresh reference only when content changes).
 */
const cache = new WeakMap<ConversationSnapshot, TurnFileChanges[]>()

/** Derive per-turn produced-file changes for one session snapshot. */
export function deriveSessionChanges(snapshot: ConversationSnapshot | null): TurnFileChanges[] {
  if (snapshot === null) return []
  const hit = cache.get(snapshot)
  if (hit !== undefined) return hit
  const derived = derive(snapshot)
  cache.set(snapshot, derived)
  return derived
}

/**
 * One Code Mode (`run_code`) root visible in the snapshot, with the turn it
 * settles into. The snapshot now carries settled `subCalls` with their own
 * call heads and result metadata, so those are the primary source; this root
 * list only feeds the Host recorder fallback for roots whose nested facts did
 * not survive into the snapshot.
 */
export interface SessionRoot {
  readonly turn: number
  readonly live: boolean
  readonly rootCallId: string
}

/** Every `run_code` tool-result node whose nested changes are not in the snapshot. */
export function deriveSessionRoots(snapshot: ConversationSnapshot): SessionRoot[] {
  const attribute = turnAttribution(snapshot)
  const roots: SessionRoot[] = []
  const view = normalizeSnapshot(snapshot)
  for (const node of (view?.nodes ?? []) as readonly ToolResultNode[]) {
    if (node.kind !== 'tool-result' || node.isError) continue
    if (node.subCalls.length === 0) continue
    const nested: BlockChange[] = []
    for (const child of node.subCalls) {
      if ((child as ToolResultNode).kind === 'tool-result') collectChanges(child, nested)
    }
    if (nested.some(change => change.diffs.length > 0)) continue
    const { turn, live } = attribute(node.seq)
    roots.push({ turn, live, rootCallId: node.callId })
  }
  return roots
}

/**
 * Merge Host-recorded Code Mode mutations into the snapshot-derived turns:
 * hunks rebuilt from the full before/after are appended to the owning turn's
 * file groups (same-path entries stay one row, hunks appended in dispatch
 * order), so the tab's diff rendering, status inspection and undo all work on
 * programmatic edits exactly like model-direct ones. All inputs are immutable;
 * the result is a fresh array only when a recorded mutation matched a visible
 * root.
 */
export function mergeRecordedTurns(
  turns: readonly TurnFileChanges[],
  roots: readonly SessionRoot[],
  recorded: readonly RecordedMutation[],
): readonly TurnFileChanges[] {
  if (recorded.length === 0 || roots.length === 0) return turns
  const rootTurns = new Map<string, { turn: number; live: boolean }>()
  for (const root of roots) rootTurns.set(root.rootCallId, { turn: root.turn, live: root.live })
  const byRoot = new Map<string, RecordedMutation[]>()
  for (const mutation of recorded) {
    const list = byRoot.get(mutation.rootCallId)
    if (list === undefined) byRoot.set(mutation.rootCallId, [mutation])
    else list.push(mutation)
  }
  let matched = false
  for (const root of roots) {
    if (byRoot.has(root.rootCallId)) { matched = true; break }
  }
  if (!matched) return turns

  const groups = new Map<number, { live: boolean; files: Map<string, FileAccumulator> }>()
  for (const turn of turns) {
    const files = new Map<string, FileAccumulator>()
    for (const file of turn.files) {
      files.set(file.path, {
        diffs: [...file.diffs],
        ...(file.deleted === true ? { deleted: true as const } : {}),
      })
    }
    groups.set(turn.turn, { live: turn.live, files })
  }
  for (const [rootCallId, mutations] of byRoot) {
    const owner = rootTurns.get(rootCallId)
    if (owner === undefined) continue
    let group = groups.get(owner.turn)
    if (group === undefined) {
      group = { live: owner.live, files: new Map() }
      groups.set(owner.turn, group)
    }
    for (const mutation of mutations) {
      const diffs = diffsFromBeforeAfter(mutation.path, mutation.before, mutation.after)
      if (diffs.length === 0) continue
      const existing = group.files.get(mutation.path)
      if (existing === undefined) group.files.set(mutation.path, { diffs: [...diffs] })
      else existing.diffs.push(...diffs)
    }
  }
  return [...groups.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([turn, group]) => ({
      turn,
      live: group.live,
      files: [...group.files.entries()].map(([path, own]) => ({
        path,
        diffs: own.diffs,
        ...(own.deleted === true ? { deleted: true as const } : {}),
      })),
    }))
}

/** Count distinct changed paths across every turn (the sidebar badge count). */
export function countChangedFiles(turns: readonly TurnFileChanges[]): number {
  const paths = new Set<string>()
  for (const turn of turns) {
    for (const file of turn.files) paths.add(file.path)
  }
  return paths.size
}

/**
 * Turns that stay in the review tab's MAIN list: the newest
 * {@link ARCHIVE_KEEP_TURNS} turns plus every live (still-running) turn.
 * Older completed turns auto-archive to the tab's bottom section (issue #5:
 * long sessions accumulate dozens of diff groups and weigh the page down).
 */
export const ARCHIVE_KEEP_TURNS = 5

/** Archived turns render this many groups per loaded page once the section opens. */
export const ARCHIVE_PAGE_TURNS = 10

/**
 * Debug/demo override for the keep threshold: `?frtArchiveKeep=N` in the app
 * URL forces N (0 archives every completed turn) so the archive UI can be
 * exercised on sessions with few change-bearing turns. Null when absent.
 */
function archiveKeepOverride(): number | null {
  try {
    const param = new URLSearchParams(window.location.search).get('frtArchiveKeep')
    if (param === null) return null
    const value = Number(param)
    if (Number.isInteger(value) && value >= 0) return value
  } catch {
    // Non-browser context (tests): no override.
  }
  return null
}

/** Split turns into the main list and the auto-archived tail (both newest-first). */
export function splitArchivedTurns(
  turns: readonly TurnFileChanges[],
  keep = ARCHIVE_KEEP_TURNS,
): { main: readonly TurnFileChanges[]; archived: readonly TurnFileChanges[] } {
  const effective = archiveKeepOverride() ?? keep
  const descending = [...turns].sort((left, right) => right.turn - left.turn)
  const kept = new Set(descending.slice(0, effective).map(turn => turn.turn))
  const main: TurnFileChanges[] = []
  const archived: TurnFileChanges[] = []
  for (const turn of descending) {
    // A live turn never archives, however old its number is.
    if (turn.live || kept.has(turn.turn)) main.push(turn)
    else archived.push(turn)
  }
  return { main, archived }
}

/** Trailing path segment, the part that identifies the file at a glance. */
export function basename(path: string): string {
  const at = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'))
  return at === -1 ? path : path.slice(at + 1)
}

/** POSIX root, drive-letter, or UNC absolute-path test (separator-agnostic). */
function isAbsolutePath(path: string): boolean {
  return path.startsWith('/') || path.startsWith('\\\\') || /^[A-Za-z]:[\\/]/.test(path)
}

/** Resolve a (possibly relative) tool path against the session cwd. */
export function resolveSessionPath(cwd: string | undefined, path: string): string {
  if (isAbsolutePath(path)) return path
  const base = cwd ?? ''
  if (base === '') return path
  const separator = base.includes('\\') ? '\\' : '/'
  return `${base.replace(/[\\/]+$/, '')}${separator}${path}`
}
