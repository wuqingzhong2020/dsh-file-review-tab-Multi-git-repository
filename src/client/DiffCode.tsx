import type { ReactNode } from 'react'
import type { SyntaxToken } from './diff-highlight.ts'
import type { DiffSearchMatch } from './diff-search.ts'
import css from './UnifiedDiff.module.css'

interface DiffCodeProps {
  readonly text: string
  readonly tokens?: readonly SyntaxToken[] | undefined
  readonly matches?: readonly DiffSearchMatch[] | undefined
  readonly active?: string | undefined
}

/** React text nodes retain exact whitespace and escape HTML; search marks wrap syntax spans. */
export function DiffCode({ text, tokens = [], matches = [], active }: DiffCodeProps) {
  let tokenIndex = 0

  // Syntax tokens and search matches both use offsets into the original text.
  // Keep the token cursor across fragments so a match can split one syntax span.
  const renderSyntaxRange = (start: number, end: number): ReactNode[] => {
    const parts: ReactNode[] = []
    let cursor = start
    while (cursor < end) {
      while (tokenIndex < tokens.length && tokens[tokenIndex]!.end <= cursor) {
        tokenIndex++
      }
      const token = tokens[tokenIndex]
      if (!token || token.start >= end) {
        parts.push(text.slice(cursor, end))
        break
      }
      if (token.start > cursor) {
        parts.push(text.slice(cursor, token.start))
        cursor = token.start
      }
      const next = Math.min(end, token.end)
      parts.push(
        <span
          key={`${cursor}:${next}`}
          className={css[`syntax_${token.kind}`]}
          data-syntax={token.kind}
        >
          {text.slice(cursor, next)}
        </span>,
      )
      cursor = next
    }
    return parts
  }

  const parts: ReactNode[] = []
  let cursor = 0
  for (const match of matches) {
    parts.push(...renderSyntaxRange(cursor, match.start))
    parts.push(
      <mark
        key={match.id}
        data-search-match={match.id}
        className={`${css.searchMatch} ${match.id === active ? css.searchActive : ''}`}
      >
        {renderSyntaxRange(match.start, match.end)}
      </mark>,
    )
    cursor = match.end
  }
  parts.push(...renderSyntaxRange(cursor, text.length))
  return <>{parts}</>
}
