import type { ProducedFileDiff } from '../change-types.ts'
import type { UnifiedHunk, UnifiedLine } from './unified-diff-model.ts'

export type DiffLanguage = 'cpp' | 'javascript' | 'typescript' | 'python' | 'json' | 'markdown' | 'text'
export type SyntaxKind = 'keyword' | 'string' | 'comment' | 'number' | 'property' | 'heading'
export interface SyntaxToken { readonly start: number; readonly end: number; readonly kind: SyntaxKind }
export interface SyntaxState { blockComment?: boolean; quote?: string; rawClose?: string; fence?: string }
export const HIGHLIGHT_CHARACTER_LIMIT = 500000
export const HIGHLIGHT_LINE_LIMIT = 16000
const cppKeywords = new Set(('alignas alignof asm auto bool break case catch char class const constexpr consteval constinit continue decltype default delete do double else enum explicit export extern false float for friend goto if inline int long mutable namespace new noexcept nullptr operator override private protected public register reinterpret_cast return short signed sizeof static static_assert static_cast struct switch template this thread_local throw true try typedef typename union unsigned using virtual void volatile wchar_t while').split(' '))
const jsKeywords = new Set(('async await break case catch class const continue debugger default delete do else export extends false finally for from function if import in instanceof let new null of return static super switch this throw true try typeof undefined var void while with yield').split(' '))
const tsKeywords = new Set([...jsKeywords, ...('abstract any as asserts bigint boolean declare enum implements infer interface is keyof module namespace never number private protected public readonly require satisfies string symbol type unknown').split(' ')])
const jsonKeywords = new Set(['true', 'false', 'null'])
const pythonKeywords = new Set(('False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case').split(' '))
const identifierStart = /[A-Za-z_$]/
const identifierPart = /[A-Za-z0-9_$]/
const numberPattern = /(?:0[xob][\da-f_]+|(?:\d[\d_]*(?:\.[\d_]*)?|\.\d[\d_]*)(?:e[+-]?[\d_]+)?)[a-z]*/iy

function stringEnd(text: string, from: number, delimiter: string, escapes: boolean): number {
  let end = text.indexOf(delimiter, from)
  while (escapes && end >= 0) {
    let backslashes = 0
    for (let index = end - 1; index >= 0 && text[index] === '\\'; index--) backslashes++
    if (backslashes % 2 === 0) break
    end = text.indexOf(delimiter, end + 1)
  }
  return end
}

export function diffLanguage(path: string): DiffLanguage {
  const extension = path.toLowerCase().split(/[\\/]/).at(-1)?.split('.').at(-1)
  if (['c', 'h', 'cc', 'hh', 'cpp', 'hpp', 'cxx', 'hxx', 'c++'].includes(extension ?? '')) return 'cpp'
  if (['js', 'jsx', 'mjs', 'cjs'].includes(extension ?? '')) return 'javascript'
  if (['ts', 'tsx', 'mts', 'cts'].includes(extension ?? '')) return 'typescript'
  if (['json', 'jsonc'].includes(extension ?? '')) return 'json'
  if (['py', 'pyw', 'pyi'].includes(extension ?? '')) return 'python'
  if (['md', 'markdown', 'mdown'].includes(extension ?? '')) return 'markdown'
  return 'text'
}

/** Bounded, linear basic lexer. Tokens only describe ranges; recorded text is never rewritten. */
export function highlightLine(text: string, language: DiffLanguage, state: SyntaxState): readonly SyntaxToken[] {
  if (language === 'text') return []
  if (text.length > HIGHLIGHT_LINE_LIMIT) { delete state.quote; delete state.blockComment; delete state.rawClose; delete state.fence; return [] }
  const tokens: SyntaxToken[] = []
  const add = (start: number, end: number, kind: SyntaxKind) => { if (end > start) tokens.push({ start, end, kind }) }
  if (language === 'markdown') {
    const fence = /^\s*(`{3,}|~{3,})/.exec(text)?.[1]
    if (state.fence) {
      add(0, text.length, 'string')
      if (fence && fence[0] === state.fence[0] && fence.length >= state.fence.length) delete state.fence
      return tokens
    }
    if (fence) { state.fence = fence; add(0, text.length, 'string'); return tokens }
    if (/^\s{0,3}#{1,6}\s/.test(text)) { add(0, text.length, 'heading'); return tokens }
    for (const match of text.matchAll(/`[^`]+`|\*\*[^*]+\*\*|\[[^\]\n]+\]\([^\)\n]*\)/g)) add(match.index, match.index + match[0].length, 'string')
    return tokens
  }
  const keywords = language === 'cpp' ? cppKeywords : language === 'typescript' ? tsKeywords : language === 'json' ? jsonKeywords : language === 'python' ? pythonKeywords : jsKeywords
  let cursor = 0
  while (cursor < text.length) {
    const start = cursor
    if (state.blockComment) {
      const end = text.indexOf('*/', cursor)
      cursor = end < 0 ? text.length : end + 2
      if (end >= 0) delete state.blockComment
      add(start, cursor, 'comment'); continue
    }
    if (state.rawClose) {
      const end = stringEnd(text, cursor, state.rawClose, language === 'python')
      cursor = end < 0 ? text.length : end + state.rawClose.length
      if (end >= 0) delete state.rawClose
      add(start, cursor, 'string'); continue
    }
    if (language === 'python' && (text.startsWith('"""', cursor) || text.startsWith("'''", cursor))) {
      state.rawClose = text.slice(cursor, cursor + 3); cursor += 3
      const end = stringEnd(text, cursor, state.rawClose, true)
      cursor = end < 0 ? text.length : end + 3
      if (end >= 0) delete state.rawClose
      add(start, cursor, 'string'); continue
    }
    const quote = state.quote ?? (text[cursor] === '"' || text[cursor] === "'" || (language === 'javascript' || language === 'typescript') && text[cursor] === '`' ? text[cursor] : undefined)
    if (quote) {
      if (!state.quote) cursor++
      state.quote = quote
      while (cursor < text.length) {
        const char = text[cursor++]
        if (char === '\\') { cursor = Math.min(text.length, cursor + 1); continue }
        if (char === quote) { delete state.quote; break }
      }
      const kind = language === 'json' && /^\s*:/.test(text.slice(cursor)) ? 'property' : 'string'
      add(start, cursor, kind)
      if (state.quote !== '`' && !text.endsWith('\\')) delete state.quote
      continue
    }
    if (language === 'python' ? text[cursor] === '#' : text.startsWith('//', cursor)) { add(cursor, text.length, 'comment'); break }
    if (language !== 'python' && text.startsWith('/*', cursor)) { state.blockComment = true; continue }
    if (language === 'cpp' && text.startsWith('R"', cursor)) {
      const raw = /^R"([^\s()\\]{0,16})\(/.exec(text.slice(cursor))
      if (raw) { state.rawClose = `)${raw[1]}"`; cursor += raw[0].length; const end = text.indexOf(state.rawClose, cursor); cursor = end < 0 ? text.length : end + state.rawClose.length; if (end >= 0) delete state.rawClose; add(start, cursor, 'string'); continue }
    }
    if (identifierStart.test(text[cursor]!)) {
      while (cursor < text.length && identifierPart.test(text[cursor]!)) cursor++
      if (keywords.has(text.slice(start, cursor))) add(start, cursor, 'keyword')
      continue
    }
    if (/\d/.test(text[cursor]!) || text[cursor] === '.' && /\d/.test(text[cursor + 1] ?? '')) {
      numberPattern.lastIndex = cursor
      const match = numberPattern.exec(text)
      if (match) { cursor += match[0].length; add(start, cursor, 'number'); continue }
    }
    cursor++
  }
  return tokens
}

/** Independent old/new lexical states handle edits that change multiline comment boundaries. */
export function highlightDiff(diffs: readonly ProducedFileDiff[], hunks: readonly UnifiedHunk[]): ReadonlyMap<UnifiedLine, { old: readonly SyntaxToken[]; next: readonly SyntaxToken[] }> {
  const result = new Map<UnifiedLine, { old: readonly SyntaxToken[]; next: readonly SyntaxToken[] }>()
  let remaining = HIGHLIGHT_CHARACTER_LIMIT
  hunks.forEach((hunk, index) => {
    const language = diffLanguage(diffs[index]?.path ?? '')
    if (language === 'text') return
    const size = hunk.lines.reduce((sum, line) => sum + line.text.length, 0)
    if (size > remaining) return
    remaining -= size
    const oldState: SyntaxState = {}; const newState: SyntaxState = {}
    for (const line of hunk.lines) result.set(line, {
      old: line.oldNumber === null ? [] : highlightLine(line.text, language, oldState),
      next: line.newNumber === null ? [] : highlightLine(line.text, language, newState),
    })
  })
  return result
}
