import { useEffect, useMemo, useRef, useState } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import { MarkdownDelegateProvider, MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import type { UserGuideDocument } from '../user-guide.ts'
import { guideImageResolver, loadUserGuide } from './user-guide.ts'
import { t } from './locales.ts'
import { useReviewLocale } from './use-review-locale.ts'
import css from './UserGuideTab.module.css'

/** The scoped document channel supplies both Markdown and shipped image bytes. */
export function UserGuideContent({ ctx, sessionId }: { readonly ctx: Context; readonly sessionId: string }) {
  const language = useReviewLocale()
  const [tick, setTick] = useState(0)
  const [loaded, setLoaded] = useState<{ key: string; document: UserGuideDocument } | null>(null)
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const chapterTarget = useRef<string | null>(null)
  const [chapters, setChapters] = useState<string[]>([])
  const key = JSON.stringify([sessionId, language, tick])
  const document = loaded?.key === key ? loaded.document : null
  // The host renders fragment links as plain text. Navigate its actual headings
  // without replacing Markdown rendering or parsing code examples as chapters.
  useEffect(() => {
    chapterTarget.current = null
    const headings = contentRef.current?.querySelectorAll('h2') ?? []
    setChapters(Array.from(headings, heading => heading.textContent?.trim() ?? '')
      .filter(title => /^\d+\.\s/.test(title)))
  }, [document])
  function alignChapter() {
    const content = contentRef.current
    const heading = Array.from(content?.querySelectorAll('h2') ?? [])
      .find(element => element.textContent?.trim() === chapterTarget.current)
    if (!content || !heading) return
    content.scrollTop += heading.getBoundingClientRect().top - content.getBoundingClientRect().top - 8
  }
  function jumpToChapter(title: string) {
    chapterTarget.current = title
    alignChapter()
  }
  function stopChapterNavigation() { chapterTarget.current = null }
  useEffect(() => {
    let active = true
    setFailure(null)
    void loadUserGuide(ctx, sessionId, language).then(document => {
      if (active) setLoaded({ key, document })
    }).catch(error => {
      if (active) setFailure({ key, message: error instanceof Error ? error.message : t('userGuideFailed') })
    })
    return () => { active = false }
  }, [ctx, sessionId, language, key])
  const imageResolver = useMemo(() => document === null ? () => undefined : guideImageResolver(document), [document])
  const pathImages = useMemo(() => ({ resolve: imageResolver }), [imageResolver])
  const fileImages = useMemo(() => ({ resolve: imageResolver, labels: {
    open: t('userGuideImageOpen'), dialog: t('userGuideImageDialog'), close: t('userGuideImageClose'),
    loading: t('userGuideImageLoading'), failed: t('userGuideImageFailed'),
  } }), [imageResolver, language])
  const labels = useMemo(() => ({ code: { copyLabel: t('userGuideCodeCopy'), copiedLabel: t('copied') }, footnotes: t('userGuideFootnotes') }), [language])
  return <div className={css.root}>
    <header className={css.header}>
      <span>{language === 'zh' ? 'USER_GUIDE.md' : 'USER_GUIDE.en.md'}</span>
      {document && chapters.length > 0 && <select key={key} className={css.chapterSelect}
        aria-label={t('userGuideChapter')} defaultValue="" onChange={event => jumpToChapter(event.target.value)}>
        <option value="" disabled>{t('userGuideChapter')}</option>
        {chapters.map(title => <option key={title} value={title}>{title}</option>)}
      </select>}
      <button type="button" data-modal-autofocus onClick={() => setTick(value => value + 1)}>{t('refresh')}</button>
    </header>
    {failure?.key === key ? <div className={css.message} role="alert">{t('userGuideFailed')} {failure.message}</div>
      : document === null ? <div className={css.message} role="status">{t('userGuideOpening')}</div>
      // Lazy images can grow earlier chapters after a jump. Keep its target
      // aligned until the user starts another reading interaction.
      : <div className={css.content} key={key} ref={contentRef} onLoadCapture={alignChapter}
        onWheel={stopChapterNavigation} onPointerDown={stopChapterNavigation}
        onKeyDown={stopChapterNavigation} onTouchStart={stopChapterNavigation}>
        <MarkdownDelegateProvider fileImages={fileImages}>
          <MarkdownText text={document.markdown} labels={labels} pathImages={pathImages} />
        </MarkdownDelegateProvider>
      </div>}
  </div>
}
