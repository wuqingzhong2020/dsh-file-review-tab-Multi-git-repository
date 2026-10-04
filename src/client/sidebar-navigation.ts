import type { ISidebarRight, SidebarRightTabActions } from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import { fileAddressFor } from '@deepseek-ai/dsh-util-workspace-path'
import { publishFileReviewSeed, discardFileReviewSeed } from './deep-link.ts'
import { t } from './locales.ts'

export const REVIEW_KIND = 'file-review'
export const REVIEW_IMPLEMENTATION = 'dsh-file-review-tab-multi-git-repository:file-review'
export const LEGACY_GUIDE_KIND = 'file-review-guide'
export const LEGACY_GUIDE_IMPLEMENTATION = 'dsh-file-review-tab-multi-git-repository:legacy-guide'

/** Chat actions may only navigate the session currently owned by the public controller. */
export function openReviewTab(
  sidebar: Pick<ISidebarRight, 'mounted' | 'openTab'>,
  sessionId: string,
  paths: readonly string[],
  turn?: number,
): void {
  if (paths.length === 0) return
  if (sidebar.mounted.getSnapshot() !== sessionId) throw new Error(t('sidebarSessionNotVisible'))
  const seed = publishFileReviewSeed(sessionId, paths, turn)
  try {
    sidebar.openTab(REVIEW_KIND, { revealIfOpened: true })
  } catch (error) {
    discardFileReviewSeed(sessionId, seed.nonce)
    throw error
  }
}

/** Keep file opens bound to their originating tab, including after asynchronous work. */
export function openReviewResource(
  actions: Pick<SidebarRightTabActions, 'openResource'>,
  sessionId: string,
  cwd: string | undefined,
  path: string,
  signal: AbortSignal,
): void {
  if (signal.aborted) throw new Error(t('sessionUnavailable'))
  if (!cwd) throw new Error(t('sidebarWorkspaceUnavailable'))
  actions.openResource(fileAddressFor(sessionId, cwd, path), { revealIfOpened: true })
}
