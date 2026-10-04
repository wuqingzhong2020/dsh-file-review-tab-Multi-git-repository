import { createContext, useContext, type ReactNode } from 'react'
import { t } from './locales.ts'

export type ReviewFileOpener = (absolutePath: string) => void
const FileNavigation = createContext<ReviewFileOpener | null>(null)

/** One navigation capability covers file headers, comments and selection fallbacks. */
export function ReviewNavigationProvider({ openFile, children }: {
  readonly openFile: ReviewFileOpener
  readonly children: ReactNode
}) {
  return <FileNavigation.Provider value={openFile}>{children}</FileNavigation.Provider>
}

export function useReviewFileOpener(): ReviewFileOpener {
  const openFile = useContext(FileNavigation)
  return openFile ?? (() => { throw new Error(t('sidebarUnavailable')) })
}
