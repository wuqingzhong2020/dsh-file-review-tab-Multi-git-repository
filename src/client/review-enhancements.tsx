/** Optional UI integrations share the plugin lifetime and keep core registrations small. */
import type { Context } from '@deepseek-ai/cordis'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import type {} from '@deepseek-ai/dsh-client-ui-plugin-manager/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-input-trigger/client'
import { ReviewCommentsDock } from './ReviewCommentsDock.tsx'
import { reviewInputSource, disposeReviewInput, registerReviewInputTracking } from './review-input.ts'
import { registerReviewPacketMessages } from './ReviewPacketMessage.tsx'
import { ReviewSettingsCard } from './ReviewSettingsCard.tsx'
import { bindProfileReviewPreferences } from './profile-review-preferences.ts'
import { viewStore } from './DiffViewControls.tsx'
import { REVIEW_PACKET_PACKAGE } from './review-comment-packet.ts'

export function registerReviewEnhancements(ctx: Context): void {
  ctx.effect(
    () => ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
      name: 'conversation.input.dock',
      id: `${REVIEW_PACKET_PACKAGE}:comments`,
      order: -10,
      inject: (sessionId: string) => ({ ctx, sessionId }),
    }, ReviewCommentsDock)),
    'file-review: comment dock',
  )
  ctx.inject(['inputTriggers'], child => {
    child.effect(() => child.inputTriggers.registerSource(reviewInputSource()))
    child.effect(() => registerReviewInputTracking(ctx.sessions as unknown as ISessions))
    child.effect(() => disposeReviewInput)
  })
  ctx.effect(
    () => ctx.slots.inject('conversation.chat.node', () => registerReviewPacketMessages(ctx)),
    'file-review: packet display',
  )
  ctx.inject(['configForms'], child => {
    child.effect(() => bindProfileReviewPreferences(child, viewStore()))
  })
  ctx.effect(
    () => ctx.slots.inject('plugins.row.config', () => ctx.slots.register({
      name: 'plugins.row.config',
      key: `${REVIEW_PACKET_PACKAGE}#file-review-tab-multi-git-repository`,
    }, ReviewSettingsCard)),
    'file-review: official settings card',
  )
}
