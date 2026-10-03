import type { ProducedFileDiff } from '../change-types.ts'
import type { UnifiedHunk, UnifiedLine } from './unified-diff-model.ts'

export type DiffLanguage =
  | 'cpp'
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'json'
  | 'markdown'
  | 'text'
export type SyntaxKind = 'keyword' | 'string' | 'comment' | 'number' | 'property' | 'heading'
export interface SyntaxToken {
  readonly start: number
  readonly end: number
  readonly kind: SyntaxKind
}
export interface SyntaxState {
  blockComment?: boolean
  quote?: string
  /** Closing delimiter for a C++ raw string or Python triple-quoted string. */
  rawClose?: string
  /** Markdown fences are highlighted as source, without rendering their contents. */
  fence?: string
}
export const HIGHLIGHT_CHARACTER_LIMIT = 500000
export const HIGHLIGHT_LINE_LIMIT = 16000
const cppKeywords = new Set(
  'alignas alignof asm auto bool break case catch char class const constexpr consteval constinit continue decltype default delete do double else enum explicit export extern false float for friend goto if inline int long mutable namespace new noexcept nullptr operator override private protected public register reinterpret_cast return short signed sizeof static static_assert static_cast struct switch template this thread_local throw true try typedef typename union unsigned using virtual void volatile wchar_t while'.split(
    ' ',
  ),
)
const jsKeywords = new Set(
  'async await break case catch class const continue debugger default delete do else export extends false finally for from function if import in instanceof let new null of return static super switch this throw true try typeof undefined var void while with yield'.split(
    ' ',
  ),
)
const tsKeywords = new Set([
  ...jsKeywords,
  ...'abstract any as asserts bigint boolean declare enum implements infer interface is keyof module namespace never number private protected public readonly require satisfies string symbol type unknown'.split(
    ' ',
  ),
])
const jsonKeywords = new Set(['true', 'false', 'null'])
const pythonKeywords = new Set(
  'False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case'.split(
    ' ',
  ),
)
const identifierStart = /[A-Za-z_$]/
const identifierPart = /[A-Za-z0-9_$]/
const numberPattern =
  /(?:0[xob][\da-f_]+|(?:\d[\d_]*(?:\.[\d_]*)?|\.\d[\d_]*)(?:e[+-]?[\d_]+)?)[a-z]*/iy

function keywordsForLanguage(language: DiffLanguage): ReadonlySet<string> {
  switch (language) {
    case 'cpp':
      return cppKeywords
    case 'typescript':
      return tsKeywords
    case 'json':
      return jsonKeywords
    case 'python':
      return pythonKeywords
    default:
      return jsKeywords
  }
}

/** Skip a closing delimiter preceded by an odd number of backslashes. */
function findStringEnd(text: string, from: number, delimiter: string, escapes: boolean): number {
  let end = text.indexOf(delimiter, from)
  while (escapes && end >= 0) {
    let backslashes = 0
    for (let index = end - 1; index >= 0 && text[index] === '\\'; index--) {
      backslashes++
    }
    if (backslashes % 2 === 0) break
    end = text.indexOf(delimiter, end + 1)
  }
  return end
}

function resetSyntaxState(state: SyntaxState): void {
  delete state.quote
  delete state.blockComment
  delete state.rawClose
  delete state.fence
}

type AddSyntaxToken = (start: number, end: number, kind: SyntaxKind) => void

function highlightMarkdownSource(text: string, state: SyntaxState, addToken: AddSyntaxToken): void {
  const fence = /^\s*(`{3,}|~{3,})/.exec(text)?.[1]
  if (state.fence) {
    addToken(0, text.length, 'string')
    if (fence && fence[0] === state.fence[0] && fence.length >= state.fence.length)
      delete state.fence
    return
  }
  if (fence) {
    state.fence = fence
    addToken(0, text.length, 'string')
    return
  }
  if (/^\s{0,3}#{1,6}\s/.test(text)) {
    addToken(0, text.length, 'heading')
    return
  }
  for (const match of text.matchAll(/`[^`]+`|\*\*[^*]+\*\*|\[[^\]\n]+\]\([^\)\n]*\)/g)) {
    addToken(match.index, match.index + match[0].length, 'string')
  }
}

export function diffLanguage(path: string): DiffLanguage {
  const extension = path.toLowerCase().split(/[\\/]/).at(-1)?.split('.').at(-1)
  if (['c', 'h', 'cc', 'hh', 'cpp', 'hpp', 'cxx', 'hxx', 'c++'].includes(extension ?? ''))
    return 'cpp'
  if (['js', 'jsx', 'mjs', 'cjs'].includes(extension ?? '')) return 'javascript'
  if (['ts', 'tsx', 'mts', 'cts'].includes(extension ?? '')) return 'typescript'
  if (['json', 'jsonc'].includes(extension ?? '')) return 'json'
  if (['py', 'pyw', 'pyi'].includes(extension ?? '')) return 'python'
  if (['md', 'markdown', 'mdown'].includes(extension ?? '')) return 'markdown'
  return 'text'
}

/** Bounded, linear basic lexer. Tokens only describe ranges; recorded text is never rewritten. */
export function highlightLine(
  text: string,
  language: DiffLanguage,
  state: SyntaxState,
): readonly SyntaxToken[] {
  if (language === 'text') return []
  if (text.length > HIGHLIGHT_LINE_LIMIT) {
    // An unscanned line cannot safely carry lexical state into the next line.
    resetSyntaxState(state)
    return []
  }
  const tokens: SyntaxToken[] = []
  const addToken: AddSyntaxToken = (start, end, kind) => {
    if (end > start) tokens.push({ start, end, kind })
  }
  if (language === 'markdown') {
    highlightMarkdownSource(text, state, addToken)
    return tokens
  }
  const keywords = keywordsForLanguage(language)
  let cursor = 0
  while (cursor < text.length) {
    const start = cursor

    // Resume multiline constructs before recognizing any new token.
    if (state.blockComment) {
      const closingIndex = text.indexOf('*/', cursor)
      cursor = closingIndex < 0 ? text.length : closingIndex + 2
      if (closingIndex >= 0) delete state.blockComment
      addToken(start, cursor, 'comment')
      continue
    }
    if (state.rawClose) {
      const closingIndex = findStringEnd(text, cursor, state.rawClose, language === 'python')
      cursor = closingIndex < 0 ? text.length : closingIndex + state.rawClose.length
      if (closingIndex >= 0) delete state.rawClose
      addToken(start, cursor, 'string')
      continue
    }

    // Triple quotes take precedence over Python's ordinary quoted strings.
    if (
      language === 'python' &&
      (text.startsWith('"""', cursor) || text.startsWith("'''", cursor))
    ) {
      state.rawClose = text.slice(cursor, cursor + 3)
      cursor += 3
      const closingIndex = findStringEnd(text, cursor, state.rawClose, true)
      cursor = closingIndex < 0 ? text.length : closingIndex + 3
      if (closingIndex >= 0) delete state.rawClose
      addToken(start, cursor, 'string')
      continue
    }

    const startsQuotedString =
      text[cursor] === '"' ||
      text[cursor] === "'" ||
      ((language === 'javascript' || language === 'typescript') && text[cursor] === '`')
    const quote = state.quote ?? (startsQuotedString ? text[cursor] : undefined)
    if (quote) {
      if (!state.quote) cursor++
      state.quote = quote
      while (cursor < text.length) {
        const character = text[cursor++]
        if (character === '\\') {
          cursor = Math.min(text.length, cursor + 1)
          continue
        }
        if (character === quote) {
          delete state.quote
          break
        }
      }
      const kind = language === 'json' && /^\s*:/.test(text.slice(cursor)) ? 'property' : 'string'
      addToken(start, cursor, kind)
      if (state.quote !== '`' && !text.endsWith('\\')) delete state.quote
      continue
    }

    const startsLineComment =
      language === 'python' ? text[cursor] === '#' : text.startsWith('//', cursor)
    if (startsLineComment) {
      addToken(cursor, text.length, 'comment')
      break
    }
    if (language !== 'python' && text.startsWith('/*', cursor)) {
      // The next iteration includes the opening marker in the comment token.
      state.blockComment = true
      continue
    }
    if (language === 'cpp' && text.startsWith('R"', cursor)) {
      const raw = /^R"([^\s()\\]{0,16})\(/.exec(text.slice(cursor))
      if (raw) {
        state.rawClose = `)${raw[1]}"`
        cursor += raw[0].length
        const closingIndex = text.indexOf(state.rawClose, cursor)
        cursor = closingIndex < 0 ? text.length : closingIndex + state.rawClose.length
        if (closingIndex >= 0) delete state.rawClose
        addToken(start, cursor, 'string')
        continue
      }
    }

    // Identifiers and numbers advance over complete recorded lexemes.
    if (identifierStart.test(text[cursor]!)) {
      while (cursor < text.length && identifierPart.test(text[cursor]!)) cursor++
      if (keywords.has(text.slice(start, cursor))) addToken(start, cursor, 'keyword')
      continue
    }
    const startsNumber =
      /\d/.test(text[cursor]!) || (text[cursor] === '.' && /\d/.test(text[cursor + 1] ?? ''))
    if (startsNumber) {
      numberPattern.lastIndex = cursor
      const match = numberPattern.exec(text)
      if (match) {
        cursor += match[0].length
        addToken(start, cursor, 'number')
        continue
      }
    }
    cursor++
  }
  return tokens
}

/** Independent old/new lexical states handle edits that change multiline comment boundaries. */
export function highlightDiff(
  diffs: readonly ProducedFileDiff[],
  hunks: readonly UnifiedHunk[],
): ReadonlyMap<UnifiedLine, { old: readonly SyntaxToken[]; next: readonly SyntaxToken[] }> {
  const result = new Map<
    UnifiedLine,
    { old: readonly SyntaxToken[]; next: readonly SyntaxToken[] }
  >()
  let remainingCharacters = HIGHLIGHT_CHARACTER_LIMIT
  hunks.forEach((hunk, index) => {
    const language = diffLanguage(diffs[index]?.path ?? '')
    if (language === 'text') return
    const hunkCharacters = hunk.lines.reduce((sum, line) => sum + line.text.length, 0)
    // Skip whole oversized hunks; later small hunks can still use the budget.
    if (hunkCharacters > remainingCharacters) return
    remainingCharacters -= hunkCharacters
    const oldState: SyntaxState = {}
    const newState: SyntaxState = {}
    for (const line of hunk.lines) {
      result.set(line, {
        old: line.oldNumber === null ? [] : highlightLine(line.text, language, oldState),
        next: line.newNumber === null ? [] : highlightLine(line.text, language, newState),
      })
    }
  })
  return result
}
