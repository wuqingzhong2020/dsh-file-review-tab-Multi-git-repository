import type { Context } from '@deepseek-ai/cordis'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'

/** Use the session-addressed host send, preserving the composer's existing draft. */
export async function sendReviewComments(
  ctx: Context,
  sessionId: string,
  text: string,
  onPrepared?: (requestId: string) => void,
): Promise<void> {
  const sessions = (ctx as Context & { sessions: ISessions }).sessions
  const scope = sessions.scope(sessionId as SessionId)
  if (!scope) throw new Error('Review conversation is unavailable')
  const session = typeof sessions.sessionOf === 'function' ? sessions.sessionOf(scope) : undefined
  if (onPrepared && session?.beginSubmission) {
    const handle = session.beginSubmission({ mode: 'queue', text, attachments: [] })
    try {
      onPrepared(String(handle.requestId))
      const result = await session.prompt(
        [{ type: 'text', text }],
        'queue',
        undefined,
        handle.requestId,
      )
      if (!result.ok) throw new ReviewSendFailure(result.error.code)
    } catch (cause) {
      handle.abandon()
      throw cause
    }
    return
  }
  // Session scopes belong to the Host, not this plugin's injection fiber.
  // Resolve the dynamic service through get(), as the official UI does.
  const conversation = scope.get('conversation') as Context['conversation'] | undefined
  if (!conversation) throw new Error('Review conversation is unavailable')
  onPrepared?.('')
  await conversation.send(text)
}
export class ReviewSendFailure extends Error {
  readonly code: string
  get uncertain(): boolean {
    return this.code === 'gateway/internal' || this.code === 'gateway/cancelled'
  }
  constructor(code: string) {
    super(`Review submission failed: ${code}`)
    this.code = code
  }
}
