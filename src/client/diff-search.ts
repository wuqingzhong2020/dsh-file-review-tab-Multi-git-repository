import type { DiffLocation } from './diff-navigation.ts'

export type DiffSearchSide = 'both' | 'old' | 'new'
export interface DiffSearchOptions { readonly side: DiffSearchSide; readonly caseSensitive: boolean; readonly wholeWord: boolean }
export interface DiffSearchMatch {
  readonly id: string
  readonly location: DiffLocation
  readonly side: 'old' | 'new'
  readonly start: number
  readonly end: number
}
export const DIFF_SEARCH_LIMIT = 10000
const word = /[\p{L}\p{N}\p{M}_$]/u
function wordBefore(text: string, index: number): boolean { return word.test(Array.from(text.slice(Math.max(0, index - 2), index)).at(-1) ?? '') }
function wordAfter(text: string, index: number): boolean { return word.test(Array.from(text.slice(index, index + 2))[0] ?? '') }

/** Literal Unicode search: regex metacharacters in user input are always escaped. */
export function searchDiff(lines: readonly DiffLocation[], query: string, options: DiffSearchOptions): { matches: readonly DiffSearchMatch[]; truncated: boolean } {
  if (!query) return { matches: [], truncated: false }
  const pattern = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), options.caseSensitive ? 'gu' : 'giu')
  const matches: DiffSearchMatch[] = []
  for (const location of lines) {
    const line = location.line
    if (options.side === 'old' && line.oldNumber === null || options.side === 'new' && line.newNumber === null) continue
    // Common context is counted once in Both; explicit Before uses its old line identity.
    const side = options.side === 'old' || line.newNumber === null ? 'old' : 'new'
    pattern.lastIndex = 0
    for (let match = pattern.exec(line.text); match; match = pattern.exec(line.text)) {
      const start = match.index; const end = start + match[0].length
      if (options.wholeWord && (wordBefore(line.text, start) || wordAfter(line.text, end))) continue
      if (matches.length === DIFF_SEARCH_LIMIT) return { matches, truncated: true }
      matches.push({ id: `${location.id}:${side}:${start}`, location, side, start, end })
    }
  }
  return { matches, truncated: false }
}
