import { useState } from 'react'
import type { PluginConfigViewProps } from '@deepseek-ai/dsh-client-ui-plugin-manager/client'
import { DiffViewControls, useDiffViewPreferences } from './DiffViewControls.tsx'
import { ReviewEnhancementControls, type ReviewEnhancement } from './ReviewEnhancementControls.tsx'
import { t } from './locales.ts'
import { useReviewLocale } from './use-review-locale.ts'
import css from './ReviewComments.module.css'

export function ReviewSettingsCard({ view, form }: PluginConfigViewProps) {
  useReviewLocale()
  const preferences = useDiffViewPreferences()
  const [notice, setNotice] = useState('')
  const saveEnhancement = async (key: ReviewEnhancement, checked: boolean) => {
    if (!form) return
    try {
      const saved = await form.mutate(
        [{ op: 'set', path: ['reviewSettings', key], value: checked }],
        form.state.revision,
      )
      setNotice(saved ? '' : t('diffPreferencesStorageError'))
    } catch {
      setNotice(t('diffPreferencesStorageError'))
    }
  }
  if (view === 'summary') return t('reviewProfileHint')
  return (
    <section className={css.card}>
      <h3>{t('diffSettings')}</h3>
      <p>{t('reviewProfileHint')}</p>
      <DiffViewControls />
      <ReviewEnhancementControls
        value={preferences}
        disabled={!form?.state.writable}
        className={css.meta}
        onChange={(key, checked) => { void saveEnhancement(key, checked) }}
      />
      {notice && <p role="alert">{notice}</p>}
    </section>
  )
}
