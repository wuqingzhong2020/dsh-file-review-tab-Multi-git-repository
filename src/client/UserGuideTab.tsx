import { useEffect, useMemo, useState } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import { MarkdownDelegateProvider, MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import type { UserGuideDocument } from '../user-guide.ts'
import { guideImageResolver, loadUserGuide } from './user-guide.ts'
import { t } from './locales.ts'
import { useReviewLocale } from './use-review-locale.ts'
import css from './UserGuideTab.module.css'

export function UserGuideTab({ ctx, sessionId, visible, tabId }: { ctx: Context; sessionId: string; visible: boolean; tabId: string }) {
  const language = useReviewLocale()
  const [tick, setTick] = useState(0)
  const [loaded, setLoaded] = useState<{ key: string; document: UserGuideDocument } | null>(null)
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null)
  const key = JSON.stringify([sessionId, language, tick])
  const document = loaded?.key === key ? loaded.document : null
  useEffect(() => { ctx.betterSidebar.updateTab(tabId, { title: t('userGuide') }) }, [ctx, tabId, language])
  useEffect(() => {
    if (!visible || loaded?.key === key) return
    let active = true
    setFailure(null)
    void loadUserGuide(ctx, sessionId, language).then(document => {
      if (active) setLoaded({ key, document })
    }).catch(error => {
      if (active) setFailure({ key, message: error instanceof Error ? error.message : t('userGuideFailed') })
    })
    return () => { active = false }
    // Keep a loaded guide when the user returns to its tab; refresh creates a new key.
  }, [ctx, sessionId, language, key, visible])
  const imageResolver = useMemo(() => document === null ? () => undefined : guideImageResolver(document), [document])
  const pathImages = useMemo(() => ({ resolve: imageResolver }), [imageResolver])
  const fileImages = useMemo(() => ({ resolve: imageResolver, labels: {
    open: t('userGuideImageOpen'), dialog: t('userGuideImageDialog'), close: t('userGuideImageClose'),
    loading: t('userGuideImageLoading'), failed: t('userGuideImageFailed'),
  } }), [imageResolver, language])
  const labels = useMemo(() => ({ code: { copyLabel: t('userGuideCodeCopy'), copiedLabel: t('copied') }, footnotes: t('userGuideFootnotes') }), [language])
  return <div className={css.root}>
    <header className={css.header}>
      <strong>{t('userGuide')}</strong>
      <span>{language === 'zh' ? 'USER_GUIDE.md' : 'USER_GUIDE.en.md'}</span>
      <button type="button" onClick={() => { setTick(value => value + 1) }}>{t('refresh')}</button>
    </header>
    {failure?.key === key ? <div className={css.message} role="alert">{t('userGuideFailed')} {failure.message}</div>
      : document === null ? <div className={css.message} role="status">{t('userGuideOpening')}</div>
      : <div className={css.content} key={key}>
        <MarkdownDelegateProvider fileImages={fileImages}>
          <MarkdownText text={document.markdown} labels={labels} pathImages={pathImages} />
        </MarkdownDelegateProvider>
      </div>}
  </div>
}
