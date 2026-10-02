import type { Context } from '@deepseek-ai/cordis'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'

/** Use the session-addressed host send, preserving the composer's existing draft. */
export async function sendReviewComments(ctx: Context, sessionId: string, text: string): Promise<void> {
  const sessions = (ctx as Context & { sessions: ISessions }).sessions
  const scope = sessions.scope(sessionId as SessionId)
  if (!scope?.conversation) throw new Error('Review conversation is unavailable')
  await scope.conversation.send(text)
}
