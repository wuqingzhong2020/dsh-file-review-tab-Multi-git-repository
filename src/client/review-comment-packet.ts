/** Immutable, explicitly namespaced transport shared by both submission entries. */
import { parseReviewComments, type ReviewComment } from './review-comments.ts'

export const REVIEW_PACKET_PACKAGE = 'dsh-file-review-tab-multi-git-repository'
export const REVIEW_PACKET_LIMIT = 512 * 1024
const START = `<dsh_review package="${REVIEW_PACKET_PACKAGE}" version="1">\n`
const END = '\n</dsh_review>'

export interface ReviewCommentPacket {
  readonly package: typeof REVIEW_PACKET_PACKAGE
  readonly version: 1
  readonly sessionId: string
  readonly batchId: string
  readonly comments: readonly ReviewComment[]
  readonly context: string
}

export interface ParsedReviewPacket {
  packet: ReviewCommentPacket
  visibleText: string
  original: string
}

export function serializeReviewPacket(packet: ReviewCommentPacket): string {
  const json = JSON.stringify(packet).replaceAll('<', '\\u003c').replaceAll('>', '\\u003e')
  const text = START + json + END
  if (new TextEncoder().encode(text).length > REVIEW_PACKET_LIMIT) {
    throw new Error('Review comment batch exceeds 512 KiB')
  }
  return text
}
/** A full, known envelope at the beginning; examples and legacy text remain ordinary messages. */
export function parseReviewPacket(text: string): ParsedReviewPacket | null {
  if (!text.startsWith(START)) return null
  const end = text.indexOf(END, START.length)
  if (end < 0 || new TextEncoder().encode(text.slice(0, end)).length > REVIEW_PACKET_LIMIT) return null
  try {
    const value = JSON.parse(text.slice(START.length, end))
    if (!value
      || value.package !== REVIEW_PACKET_PACKAGE
      || value.version !== 1
      || typeof value.sessionId !== 'string'
      || !value.sessionId
      || typeof value.batchId !== 'string'
      || !/^[\da-f-]{36}$/i.test(value.batchId)
      || typeof value.context !== 'string'
      || !Array.isArray(value.comments)
      || !value.comments.length) return null
    const comments = parseReviewComments(JSON.stringify({ version: 1, comments: value.comments }))
    if (comments.length !== value.comments.length) return null
    return {
      packet: { ...value, comments },
      visibleText: text.slice(end + END.length).replace(/^\n{1,2}/, ''),
      original: text,
    }
  } catch {
    return null
  }
}
