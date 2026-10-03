/** Shared read-only line contract. A displayed historical coordinate is never a disk coordinate by default. */
export interface ReviewLocationRequest {
  readonly repository: string
  readonly path: string
  readonly source: string
  readonly side: 'old' | 'new'
  readonly line: number
  readonly endLine: number
  readonly quote: string
  readonly before: string
  readonly after: string
  readonly fullText?: string | undefined
  readonly allowRelocate?: boolean | undefined
  readonly editorPath?: string | undefined
}

export interface ReviewLocationResult {
  readonly state:
    | 'exact'
    | 'moved'
    | 'ambiguous'
    | 'changed'
    | 'missing'
    | 'unsupported'
    | 'started'
    | 'editor-missing'
    | 'error'
  readonly line?: number | undefined
  readonly endLine?: number | undefined
  readonly reason?: string | undefined
}

export const REFERENCE_TEXT_LIMIT = 65536

export const referenceTextFits = (text: string): boolean => {
  return (
    text.length <= REFERENCE_TEXT_LIMIT &&
    new TextEncoder().encode(text).length <= REFERENCE_TEXT_LIMIT
  )
}

export const normalizeReferenceText = (text: string): string => text.replace(/\r\n?/g, '\n')

function validReferenceRange(request: ReviewLocationRequest, quote: string): boolean {
  return (
    Number.isSafeInteger(request.line) &&
    request.line >= 1 &&
    Number.isSafeInteger(request.endLine) &&
    request.endLine >= request.line &&
    [quote, request.before, request.after].every(referenceTextFits) &&
    request.endLine - request.line + 1 === quote.split('\n').length
  )
}

function linesMatchAt(
  lines: readonly string[],
  selected: readonly string[],
  offset: number,
): boolean {
  return selected.every((value, index) => lines[offset + index] === value)
}

/** Exact full-version validation, otherwise require a unique complete quote + adjacent context. */
export function locateReviewReference(
  text: string,
  request: ReviewLocationRequest,
): ReviewLocationResult {
  const disk = normalizeReferenceText(text)
  const quote = normalizeReferenceText(request.quote)
  if (!validReferenceRange(request, quote)) return { state: 'unsupported' }

  const lines = disk.split('\n')
  const expected = request.line - 1
  const selected = quote.split('\n')
  if (
    request.fullText !== undefined &&
    normalizeReferenceText(request.fullText) === disk &&
    linesMatchAt(lines, selected, expected)
  ) {
    return { state: 'exact', line: request.line, endLine: request.endLine }
  }

  const before = request.before ? normalizeReferenceText(request.before).split('\n') : []
  const after = request.after ? normalizeReferenceText(request.after).split('\n') : []
  // An empty line without context cannot identify a location in another version.
  if (!quote.trim() && !before.length && !after.length) return { state: 'ambiguous' }

  const candidates: number[] = []
  for (let offset = 0; offset <= lines.length - selected.length; offset++) {
    if (
      !linesMatchAt(lines, selected, offset) ||
      !linesMatchAt(lines, before, offset - before.length) ||
      !linesMatchAt(lines, after, offset + selected.length)
    ) {
      continue
    }
    candidates.push(offset + 1)
    if (candidates.length > 1) return { state: 'ambiguous' }
  }

  const line = candidates[0]
  if (line === undefined) return { state: 'changed' }
  return {
    state: line === request.line ? 'exact' : 'moved',
    line,
    endLine: line + selected.length - 1,
  }
}
