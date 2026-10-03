import type { DiffLocation } from './diff-navigation.ts'
import type { ReviewCommentAnchor, ReviewCommentTarget } from './review-comments.ts'
import { referenceTextFits } from '../review-location.ts'

export interface ReviewReference extends ReviewCommentAnchor {
  readonly endLine: number
  readonly sourceKey: string
}
/** Select complete, contiguous original rows on one side and in one hunk/version. */
export function rangeReference(
  target: ReviewCommentTarget,
  locations: readonly DiffLocation[],
  start: DiffLocation,
  end: DiffLocation,
  side: 'old' | 'new',
  revision: string,
  sourceKey: string,
): ReviewReference | null {
  if (start.hunkIndex !== end.hunkIndex) return null
  const first = Math.min(start.lineIndex, end.lineIndex),
    last = Math.max(start.lineIndex, end.lineIndex)
  const number = (item: DiffLocation) =>
    side === 'old' ? item.line.oldNumber : item.line.newNumber
  const same = locations.filter(item => item.hunkIndex === start.hunkIndex && number(item) !== null)
  const rows = same.filter(item => item.lineIndex >= first && item.lineIndex <= last)
  if (!rows.length || number(start) === null || number(end) === null) return null
  const line = number(rows[0]!)!,
    endLine = number(rows.at(-1)!)!
  if (rows.some((row, index) => number(row) !== line + index)) return null
  const quote = rows.map(row => row.line.text).join('\n')
  if (!referenceTextFits(quote)) return null
  const from = same.indexOf(rows[0]!),
    to = same.indexOf(rows.at(-1)!)
  const adjacent = (items: readonly DiffLocation[]) => items.map(item => item.line.text).join('\n')
  const before = adjacent(same.slice(Math.max(0, from - 2), from)),
    after = adjacent(same.slice(to + 1, to + 3))
  if (!referenceTextFits(before) || !referenceTextFits(after)) return null
  return { ...target, side, line, endLine, quote, before, after, revision, sourceKey }
}
/** Verbatim text + explicit provenance. This only copies; it never edits the composer. */
export function formatReviewReference(reference: ReviewReference): string {
  const fence = '`'.repeat(
    Math.max(3, ...[...reference.quote.matchAll(/`+/g)].map(match => match[0].length + 1)),
  )
  return `${reference.absolutePath}:${reference.line}-${reference.endLine}\n[${reference.repositoryName}] ${reference.scope}${reference.turn === undefined ? '' : ` · turn ${reference.turn}`}${reference.ref ? ` · ${reference.ref}` : ''} · ${reference.side} · ${reference.revision}\n${fence}text\n${reference.quote}\n${fence}`
}
