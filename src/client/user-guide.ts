import { FILE_REVIEW_REMOTE_NAMESPACE } from '../service-names.ts'
import type { Context } from '@deepseek-ai/cordis'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import { t } from './locales.ts'
import type { ReviewLocale } from './locales.ts'
import type { UserGuideDocument } from '../user-guide.ts'

export async function loadUserGuide(ctx: Context, sessionId: string, language: ReviewLocale): Promise<UserGuideDocument> {
  const scope = (ctx as Context & { sessions: ISessions }).sessions.scope(sessionId as SessionId)
  const remote = scope?.get(FILE_REVIEW_REMOTE_NAMESPACE) as { userGuideDocument?: (language: ReviewLocale) => Promise<RemoteResult<UserGuideDocument>> } | undefined
  if (!remote?.userGuideDocument) throw new Error(t('userGuideServiceUnavailable'))
  const result = await remote.userGuideDocument(language)
  if (!result.ok) throw new Error(result.error.message)
  return result.value
}

/** The host renderer only receives explicitly shipped images; no URL depends on the GUI origin. */
export function guideImageResolver(document: UserGuideDocument): (destination: string) => string | undefined {
  const images = new Map(Object.entries(document.images))
  return destination => images.get(destination.replace(/^\.\//, ''))
}
