import type { Context } from '@deepseek-ai/cordis'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { NativeReviewTab, NativeReviewTitle, FileReviewIcon } from './NativeReviewTab.tsx'
import { LegacyUserGuideTab, LegacyUserGuideTitle } from './UserGuideTab.tsx'
import { registrationLifetime } from './registration-lifetime.ts'
import { clearFileReviewSeeds } from './deep-link.ts'
import { REVIEW_IMPLEMENTATION, REVIEW_KIND, LEGACY_GUIDE_IMPLEMENTATION, LEGACY_GUIDE_KIND } from './sidebar-navigation.ts'
import { t } from './locales.ts'

/** Cordis waits for native services; slot injection also follows late declarations and reloads. */
export function registerNativeSidebar(ctx: Context): () => void {
  // The Host's legacy SessionStore also augments Context.sessions; narrow only at this service boundary.
  const sessions = ctx.get('sessions') as unknown as ISessions
  const injectReview = (sessionId: string) => ({ ctx, sessions, reviewSessionId: sessionId as SessionId })
  const lifetime = registrationLifetime(error => {
    console.error('[file-review] native sidebar registration failed:', error)
  })
  lifetime.register(() => ctx.sidebarRightTabs.register({
    id: REVIEW_IMPLEMENTATION, kind: REVIEW_KIND, priority: 'extension', keepMounted: true,
    title: () => t('tabTitle'),
    guide: [{ id: 'review', order: 35, title: () => t('tabTitle'), description: () => t('sidebarGuideDescription'), icon: FileReviewIcon }],
  }))
  lifetime.register(() => ctx.sidebarRightTabs.register({
    id: LEGACY_GUIDE_IMPLEMENTATION, kind: LEGACY_GUIDE_KIND, priority: 'extension',
    title: () => t('userGuide'),
  }))
  lifetime.register(() => ctx.slots.inject('sidebar.right.pane.tab', () => {
    const seats = registrationLifetime(error => { lifetime.release(); console.error('[file-review] native body failed:', error) })
    seats.register(() => ctx.slots.register({ name: 'sidebar.right.pane.tab', key: REVIEW_IMPLEMENTATION, inject: injectReview }, NativeReviewTab))
    seats.register(() => ctx.slots.register({ name: 'sidebar.right.pane.tab', key: LEGACY_GUIDE_IMPLEMENTATION, inject: injectReview }, LegacyUserGuideTab))
    return seats.release
  }))
  lifetime.register(() => ctx.slots.inject('sidebar.right.pane.tab.title', () => {
    const seats = registrationLifetime(error => { lifetime.release(); console.error('[file-review] native title failed:', error) })
    seats.register(() => ctx.slots.register({ name: 'sidebar.right.pane.tab.title', key: REVIEW_IMPLEMENTATION, inject: injectReview }, NativeReviewTitle))
    seats.register(() => ctx.slots.register({ name: 'sidebar.right.pane.tab.title', key: LEGACY_GUIDE_IMPLEMENTATION }, LegacyUserGuideTitle))
    return seats.release
  }))
  return () => { lifetime.release(); clearFileReviewSeeds() }
}
