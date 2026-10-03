import { diffArrays } from 'diff'
import type { ProducedFileDiff } from '../change-types.ts'
import { diffContentLines } from './diff-text.ts'

export const CONTEXT_EXPANSION_LINES = 20
export interface UnifiedDiffStats { readonly added: number; readonly removed: number }
export interface UnifiedLine {
  readonly kind: 'context' | 'del' | 'add'
  readonly oldNumber: number | null
  readonly newNumber: number | null
  readonly text: string
}
export interface UnifiedGap {
  readonly kind: 'gap'
  readonly id: string
  readonly position: 'leading' | 'middle' | 'trailing'
  readonly lines: readonly UnifiedLine[]
  /** Search can split a hidden interval; controls still address its original id. */
  readonly originId?: string
  readonly offset?: number
}
export type UnifiedRow = UnifiedLine | UnifiedGap
export interface UnifiedHunk {
  readonly lines: readonly UnifiedLine[]
  readonly rows: readonly UnifiedRow[]
  readonly added: number
  readonly removed: number
  /** Count only: a historical tool hunk may not contain the omitted text. */
  readonly unchangedBefore: number
}
export interface ContextExpansion {
  readonly before: number
  readonly after: number
  readonly revealed?: readonly { readonly start: number; readonly end: number }[]
}
export interface UnifiedVisibleBlock { readonly gap: UnifiedGap | null; readonly lines: readonly UnifiedLine[] }
export interface SplitDiffRow { readonly old: UnifiedLine | null; readonly next: UnifiedLine | null }

/** Align each contiguous replacement, keeping absent lines blank on that side. */
export function splitDiffRows(lines: readonly UnifiedLine[]): SplitDiffRow[] {
  const rows: SplitDiffRow[] = []
  let cursor = 0
  while (cursor < lines.length) {
    const line = lines[cursor]!
    if (line.kind === 'context') { rows.push({ old: line, next: line }); cursor++; continue }
    const old: UnifiedLine[] = []; const next: UnifiedLine[] = []
    while (cursor < lines.length && lines[cursor]?.kind !== 'context') {
      const changed = lines[cursor++]!
      if (changed.kind === 'del') old.push(changed)
      else next.push(changed)
    }
    for (let index = 0; index < Math.max(old.length, next.length); index++) rows.push({ old: old[index] ?? null, next: next[index] ?? null })
  }
  return rows
}

export function hunkLines(diff: ProducedFileDiff): UnifiedLine[] {
  const oldLines = diff.oldText === null ? [] : diffContentLines(diff.oldText)
  const changes = diffArrays(oldLines, diffContentLines(diff.newText))
  const lines: UnifiedLine[] = []
  let oldNumber = diff.oldStart ?? 1
  let newNumber = diff.newStart ?? 1
  for (const change of changes) {
    for (const text of change.value) {
      if (change.removed) lines.push({ kind: 'del', oldNumber: oldNumber++, newNumber: null, text })
      else if (change.added) lines.push({ kind: 'add', oldNumber: null, newNumber: newNumber++, text })
      else lines.push({ kind: 'context', oldNumber: oldNumber++, newNumber: newNumber++, text })
    }
  }
  return lines
}

function collapsedRows(lines: readonly UnifiedLine[], contextLines: number, hunkIndex: number): UnifiedRow[] {
  const rows: UnifiedRow[] = []
  let cursor = 0
  let gapIndex = 0
  const context = Math.max(0, Math.floor(contextLines))
  while (cursor < lines.length) {
    const current = lines[cursor]!
    if (current.kind !== 'context') { rows.push(current); cursor++; continue }
    const start = cursor
    while (cursor < lines.length && lines[cursor]?.kind === 'context') cursor++
    const run = lines.slice(start, cursor)
    const leading = start === 0
    const trailing = cursor === lines.length
    const hiddenStart = leading ? 0 : Math.min(context, run.length)
    const hiddenEnd = trailing ? run.length : Math.max(hiddenStart, run.length - context)
    rows.push(...run.slice(0, hiddenStart))
    const hidden = run.slice(hiddenStart, hiddenEnd)
    if (hidden.length) rows.push({ kind: 'gap', id: `${hunkIndex}:${gapIndex++}`, position: leading ? 'leading' : trailing ? 'trailing' : 'middle', lines: hidden })
    rows.push(...run.slice(hiddenEnd))
  }
  return rows
}

export function buildUnifiedHunks(diffs: readonly ProducedFileDiff[], contextLines: number): UnifiedHunk[] {
  let previousPath: string | undefined
  let previousOldEnd = 1
  let previousNewEnd = 1
  return diffs.map((diff, index) => {
    const lines = hunkLines(diff)
    const oldStart = diff.oldStart ?? 1
    const newStart = diff.newStart ?? 1
    const unchangedBefore = diff.oldStart !== undefined && diff.newStart !== undefined
      ? Math.max(0, Math.min(oldStart - (diff.path === previousPath ? previousOldEnd : 1), newStart - (diff.path === previousPath ? previousNewEnd : 1))) : 0
    previousPath = diff.path
    previousOldEnd = oldStart + lines.filter(line => line.oldNumber !== null).length
    previousNewEnd = newStart + lines.filter(line => line.newNumber !== null).length
    return {
      lines, rows: collapsedRows(lines, contextLines, index), unchangedBefore,
      added: lines.filter(line => line.kind === 'add').length,
      removed: lines.filter(line => line.kind === 'del').length,
    }
  })
}

/** Reveal up to the configured number of lines next to the visible changes. */
export function expandContextGap(gap: UnifiedGap, previous: ContextExpansion = { before: 0, after: 0 }, lines = CONTEXT_EXPANSION_LINES): ContextExpansion {
  const remaining = Math.max(0, gap.lines.length - previous.before - previous.after)
  const count = Math.min(Number.isSafeInteger(lines) && lines > 0 ? lines : CONTEXT_EXPANSION_LINES, remaining)
  if (gap.position === 'leading') return { before: previous.before, after: previous.after + count }
  if (gap.position === 'trailing') return { before: previous.before + count, after: previous.after }
  return { before: previous.before + Math.ceil(count / 2), after: previous.after + Math.floor(count / 2) }
}

/** Reveal the whole remaining interval from the selected neighboring change. */
export function expandAllContextGap(gap: UnifiedGap, direction: 'up' | 'down', previous: ContextExpansion = { before: 0, after: 0 }): ContextExpansion {
  const remaining = Math.max(0, gap.lines.length - previous.before - previous.after)
  return direction === 'up'
    ? { before: previous.before, after: previous.after + remaining }
    : { before: previous.before + remaining, after: previous.after }
}

/** Expansion never changes the recorded hunks, line anchors, or change totals. */
export function visibleHunkRows(hunk: UnifiedHunk, expansions: ReadonlyMap<string, ContextExpansion>, preserveExpandedGaps = false): UnifiedRow[] {
  return hunk.rows.flatMap(row => {
    if (row.kind !== 'gap') return [row]
    const expansion = expansions.get(row.id)
    if (expansion?.revealed?.length) {
      const ranges = [{ start: 0, end: expansion.before }, ...expansion.revealed, { start: row.lines.length - expansion.after, end: row.lines.length }]
        .map(range => ({ start: Math.max(0, range.start), end: Math.min(row.lines.length, range.end) }))
        .filter(range => range.end > range.start).sort((a, b) => a.start - b.start)
      const merged: { start: number; end: number }[] = []
      for (const range of ranges) {
        const last = merged.at(-1)
        if (last && range.start <= last.end) last.end = Math.max(last.end, range.end)
        else merged.push({ ...range })
      }
      const result: UnifiedRow[] = []
      const hidden = (start: number, end: number) => {
        if (end <= start) return
        result.push({ kind: 'gap', id: `${row.id}:slice:${start}`, originId: row.id, offset: start,
          position: start === 0 && row.position === 'leading' ? 'leading' : end === row.lines.length && row.position === 'trailing' ? 'trailing' : 'middle', lines: row.lines.slice(start, end) })
      }
      let cursor = 0
      for (const range of merged) { hidden(cursor, range.start); result.push(...row.lines.slice(range.start, range.end)); cursor = range.end }
      hidden(cursor, row.lines.length)
      if (preserveExpandedGaps && !result.some(line => line.kind === 'gap')) result.unshift({ ...row, lines: [] })
      return result
    }
    const before = Math.min(row.lines.length, expansion?.before ?? 0)
    const after = Math.min(row.lines.length - before, expansion?.after ?? 0)
    const remaining = row.lines.slice(before, row.lines.length - after)
    // Keep a local collapse control before a fully revealed interval. The
    // recorded stream and callers that only need code rows stay unchanged.
    if (!remaining.length && preserveExpandedGaps) return [{ ...row, lines: [] }, ...row.lines]
    return [
      ...row.lines.slice(0, before),
      ...(remaining.length ? [{ ...row, lines: remaining }] : []),
      ...row.lines.slice(row.lines.length - after),
    ]
  })
}

/** Each blue separator describes the actual contiguous block below it. */
export function unifiedVisibleBlocks(rows: readonly UnifiedRow[]): UnifiedVisibleBlock[] {
  const blocks: UnifiedVisibleBlock[] = []
  let gap: UnifiedGap | null = null
  let lines: UnifiedLine[] = []
  for (const row of rows) {
    if (row.kind === 'gap') {
      if (gap !== null || lines.length) blocks.push({ gap, lines })
      gap = row; lines = []
    } else lines.push(row)
  }
  if (gap !== null || lines.length) blocks.push({ gap, lines })
  return blocks
}

export function unifiedHunkRange(lines: readonly UnifiedLine[], diff: ProducedFileDiff): string {
  const old = lines.filter(line => line.oldNumber !== null)
  const next = lines.filter(line => line.newNumber !== null)
  const oldStart = old[0]?.oldNumber ?? Math.max(0, (diff.oldStart ?? 1) - 1)
  const newStart = next[0]?.newNumber ?? Math.max(0, (diff.newStart ?? 1) - 1)
  return `@@ -${oldStart},${old.length} +${newStart},${next.length} @@`
}

export function unifiedDiffText(diffs: readonly ProducedFileDiff[]): string {
  let previousPath: string | undefined
  const output: string[] = []
  for (const diff of diffs) {
    if (diff.path !== previousPath) output.push(diff.path)
    previousPath = diff.path
    const hunk = buildUnifiedHunks([diff], 3)[0]!
    for (const block of unifiedVisibleBlocks(hunk.rows)) {
      if (!block.lines.length) continue
      output.push(unifiedHunkRange(block.lines, diff))
      for (const line of block.lines) output.push(`${line.kind === 'del' ? '-' : line.kind === 'add' ? '+' : ' '} ${line.text}`)
    }
  }
  return output.join('\n')
}

export function summarizeDiffs(diffs: readonly ProducedFileDiff[]): UnifiedDiffStats {
  let added = 0
  let removed = 0
  for (const diff of diffs) for (const line of hunkLines(diff)) {
    if (line.kind === 'add') added++
    if (line.kind === 'del') removed++
  }
  return { added, removed }
}
