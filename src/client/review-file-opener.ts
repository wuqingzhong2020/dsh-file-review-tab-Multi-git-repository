import type { Context } from '@deepseek-ai/cordis'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import type { ReviewLocationRequest, ReviewLocationResult } from '../review-location.ts'
import type { ReviewCommentAnchor } from './review-comments.ts'

export function referenceRequest(anchor: ReviewCommentAnchor, editorPath = '', fullText?: string): ReviewLocationRequest {
  if (anchor.side === 'file' || anchor.line === null) throw new Error('A code line is required')
  return { repository: anchor.repository, path: anchor.absolutePath, source: anchor.sourceKey ?? JSON.stringify([anchor.scope, anchor.turn, anchor.ref, anchor.revision]),
    side: anchor.side, line: anchor.line, endLine: anchor.endLine ?? anchor.line, quote: anchor.quote, before: anchor.before, after: anchor.after,
    ...(editorPath ? { editorPath } : {}), ...(fullText !== undefined && fullText.length <= 8 * 1024 * 1024 ? { fullText } : {}),
  }
}
export async function reviewLocation(ctx: Context, sessionId: string, request: ReviewLocationRequest, method: 'openEditor' | 'locateReference' = 'openEditor'): Promise<ReviewLocationResult> {
  const scope = (ctx as Context & { sessions: ISessions }).sessions.scope(sessionId as SessionId)
  const remote = scope?.get('remote.fileReview') as { openEditor?: (request: ReviewLocationRequest) => Promise<RemoteResult<ReviewLocationResult>>; locateReference?: (request: ReviewLocationRequest) => Promise<RemoteResult<ReviewLocationResult>> } | undefined
  if (!remote?.[method]) return { state: 'error' }
  const result = await remote[method](request)
  return result.ok ? result.value : { state: 'error' }
}
export function openReviewFile(ctx: Context, sessionId: string, path: string): boolean {
  const sidebar = (ctx as Context & { betterSidebar?: { openFile(scope: { sessionId: string }, path: string, title?: string): void } }).betterSidebar
  if (!sidebar?.openFile) return false
  sidebar.openFile({ sessionId }, path, path.replaceAll('\\', '/').split('/').at(-1)); return true
}
