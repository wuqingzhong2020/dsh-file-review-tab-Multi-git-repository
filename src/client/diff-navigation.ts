import type { ContextExpansion, UnifiedGap, UnifiedHunk, UnifiedLine } from './unified-diff-model.ts'

export interface DiffLocation {
  readonly id: string
  readonly hunkIndex: number
  readonly lineIndex: number
  readonly line: UnifiedLine
}
export interface DiffChangeBlock {
  readonly id: string
  readonly first: DiffLocation
  readonly last: DiffLocation
}
export interface DiffIndex {
  readonly lines: readonly DiffLocation[]
  readonly byLine: ReadonlyMap<UnifiedLine, DiffLocation>
  readonly changes: readonly DiffChangeBlock[]
}

/** Identities use the recorded hunk, never a potentially repeated line number. */
export function indexDiff(hunks: readonly UnifiedHunk[], contextLines: number): DiffIndex {
  const lines: DiffLocation[] = []
  const byLine = new Map<UnifiedLine, DiffLocation>()
  const changes: DiffChangeBlock[] = []
  hunks.forEach((hunk, hunkIndex) => {
    let first: DiffLocation | undefined
    let last: DiffLocation | undefined
    const finish = () => { if (first && last) changes.push({ id: first.id, first, last }) }
    hunk.lines.forEach((line, lineIndex) => {
      const location = { id: `${hunkIndex}:${lineIndex}`, hunkIndex, lineIndex, line }
      lines.push(location); byLine.set(line, location)
      if (line.kind === 'context') return
      if (last && lineIndex - last.lineIndex > 2 * contextLines + 1) { finish(); first = undefined }
      first ??= location
      last = location
    })
    finish()
  })
  return { lines, byLine, changes }
}

export function stepDiffIndex(current: number, direction: 1 | -1, count: number): number {
  if (count === 0) return -1
  if (current < 0 || current >= count) return direction === 1 ? 0 : count - 1
  return (current + direction + count) % count
}

/** Search only reveals a small window around the recorded line, including inside a large gap. */
export function revealDiffLocation(
  hunks: readonly UnifiedHunk[], expansions: ReadonlyMap<string, ContextExpansion>, location: DiffLocation, context = 3,
): ReadonlyMap<string, ContextExpansion> {
  const hunk = hunks[location.hunkIndex]
  const gap = hunk?.rows.find((row): row is UnifiedGap => row.kind === 'gap' && row.lines.includes(location.line))
  if (!gap) return expansions
  const index = gap.lines.indexOf(location.line)
  const result = new Map(expansions)
  const previous = expansions.get(gap.id) ?? { before: 0, after: 0 }
  result.set(gap.id, { ...previous, revealed: [...previous.revealed ?? [], { start: Math.max(0, index - context), end: Math.min(gap.lines.length, index + context + 1) }] })
  return result
}

/** Expand the interval shown beside a search window, without revealing unrelated code. */
export function expandDiffGapSlice(gap: UnifiedGap, previous: ContextExpansion, count: number, direction?: 'up' | 'down'): ContextExpansion {
  const start = gap.offset ?? 0
  const end = start + gap.lines.length
  const take = Math.min(count, gap.lines.length)
  const fromEnd = direction === 'up' || (direction === undefined && gap.position === 'leading')
  const fromStart = direction === 'down' || (direction === undefined && gap.position === 'trailing')
  const ranges = fromEnd ? [{ start: end - take, end }]
    : fromStart ? [{ start, end: start + take }]
      : [{ start, end: start + Math.ceil(take / 2) }, { start: end - Math.floor(take / 2), end }]
  return { ...previous, revealed: [...previous.revealed ?? [], ...ranges] }
}

export function nearestDiffChange(changes: readonly DiffChangeBlock[], location: DiffLocation): number {
  let nearest = -1
  let distance = Infinity
  changes.forEach((change, index) => {
    if (change.first.hunkIndex !== location.hunkIndex) return
    const next = Math.max(change.first.lineIndex - location.lineIndex, location.lineIndex - change.last.lineIndex, 0)
    if (next < distance) { nearest = index; distance = next }
  })
  return nearest
}
