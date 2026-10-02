import type { BetterSidebarService } from 'dsh-better-sidebar/client/service'
import { subscribeLocale, t } from './locales.ts'

/** Native sidebar chips keep a stored title, separate from the tab descriptor. */
export function followReviewTabTitle(
  sidebar: Pick<BetterSidebarService, 'updateTab'>,
  tab: { readonly id: string; readonly title: string },
): () => void {
  let currentTitle = tab.title
  const sync = () => {
    const title = t('tabTitle')
    if (title === currentTitle) return
    sidebar.updateTab(tab.id, { title })
    currentTitle = title
  }
  sync()
  return subscribeLocale(sync)
}
