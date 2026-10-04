import { useCallback, useEffect, useState } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import { UserGuideContent } from './UserGuideContent.tsx'
import { t } from './locales.ts'
import { useReviewLocale } from './use-review-locale.ts'
import css from './UserGuideTab.module.css'

/** Unmount document and image previews when the owning tab hides or closes. */
export function UserGuideDialog({ ctx, sessionId, onClose }: {
  readonly ctx: Context
  readonly sessionId: string
  readonly onClose: () => void
}) {
  const language = useReviewLocale()
  return <Modal open title={t('userGuide')} closeLabel={t('userGuideClose')}
    onClose={onClose} className={css.modal!} contentClassName={css.modalContent!}>
    <UserGuideContent key={`${sessionId}:${language}`} ctx={ctx} sessionId={sessionId} />
  </Modal>
}

/** Restore old saved guide tabs without depending on the removed third-party bridge. */
export function LegacyUserGuideTab({ ctx, reviewSessionId: sessionId, useTabInfo }:
  PropsRuntime<'sidebar.right.pane.tab'> & { readonly ctx: Context; readonly reviewSessionId: string }) {
  useReviewLocale()
  const { tab } = useTabInfo()
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  useEffect(() => { if (!tab.visible) close() }, [tab.visible, close])
  return <div className={css.message}>
    <p>{t('userGuideLegacyHint')}</p>
    <button type="button" onClick={() => setOpen(true)}>{t('userGuide')}</button>{' '}
    <button type="button" onClick={() => tab.actions.close()}>{t('userGuideCloseLegacy')}</button>
    {open && tab.visible && <UserGuideDialog ctx={ctx} sessionId={sessionId} onClose={close} />}
  </div>
}

export function LegacyUserGuideTitle() {
  useReviewLocale()
  return <span title={t('userGuide')}>{t('userGuide')}</span>
}
