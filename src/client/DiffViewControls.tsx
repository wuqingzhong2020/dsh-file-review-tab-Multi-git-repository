import { useId, useRef, useState, useSyncExternalStore, type FormEvent } from 'react'
import {
  DEFAULT_DIFF_VIEW,
  DiffViewStore,
  type DiffLayout,
  type DiffViewPreferences,
} from './diff-view-preferences.ts'
import { t } from './locales.ts'
import { useReviewLocale } from './use-review-locale.ts'
import css from './DiffViewControls.module.css'
import { saveReviewPreferences } from './profile-review-preferences.ts'
import { ReviewEnhancementControls } from './ReviewEnhancementControls.tsx'

let store: DiffViewStore | undefined
export function viewStore(): DiffViewStore {
  if (!store) {
    let storage: Storage | undefined
    try {
      storage = window.localStorage
    } catch {
      /* Display preferences remain usable in memory. */
    }
    store = new DiffViewStore(storage)
  }
  return store
}
export function useDiffViewPreferences() {
  const store = viewStore()
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
}
export function DiffViewControls() {
  useReviewLocale()
  const preferences = useDiffViewPreferences()
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const inputId = useId()
  const hintId = useId()
  const [count, setCount] = useState(String(preferences.contextExpansionLines))
  const [draft, setDraft] = useState(preferences)
  const openedPreferences = useRef(preferences)
  const [storageError, setStorageError] = useState(false)
  const patch = (value: Partial<DiffViewPreferences>) =>
    setDraft(current => ({ ...current, ...value }))
  const openSettings = () => {
    setCount(String(preferences.contextExpansionLines))
    setDraft(preferences)
    openedPreferences.current = preferences
    setStorageError(false)
    dialog.current?.showModal()
  }
  const saveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const lines = Number(count)
    if (!Number.isSafeInteger(lines) || lines < 1) return
    const store = viewStore()
    // Save only user edits so a newer Profile update cannot be overwritten by an old dialog.
    const edits = Object.fromEntries(
      Object.entries({ ...draft, contextExpansionLines: lines }).filter(([key, value]) =>
        value !== openedPreferences.current[key as keyof DiffViewPreferences],
      ),
    ) as Partial<DiffViewPreferences>
    try {
      if (!await saveReviewPreferences(store, edits)) setStorageError(true)
      else dialog.current?.close()
    } catch {
      setStorageError(true)
    }
  }
  const saveQuickPreference = async (patch: Partial<DiffViewPreferences>) => {
    try {
      setStorageError(!await saveReviewPreferences(viewStore(), patch))
    } catch {
      setStorageError(true)
    }
  }
  const resetSettings = () => {
    setDraft(DEFAULT_DIFF_VIEW)
    setCount(String(DEFAULT_DIFF_VIEW.contextExpansionLines))
  }
  return (
    <div className={css.controls}>
      <button
        type="button"
        aria-label={t('diffSettings')}
        title={t('diffSettings')}
        aria-haspopup="dialog"
        onClick={openSettings}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="m6.5 2 .5-1h2l.5 1 1.5.9 1.2-.1 1 1.7-.7 1v1.8l.7 1-1 1.7-1.2-.1-1.5.9-.5 1H7l-.5-1-1.5-.9-1.2.1-1-1.7.7-1V5.5l-.7-1 1-1.7 1.2.1Z" />
          <circle cx="8" cy="6.4" r="2" />
        </svg>
        {t('diffSettings')}
      </button>
      <dialog ref={dialog} className={css.settingsDialog} aria-labelledby={titleId}>
        <form onSubmit={saveSettings}>
          <h2 id={titleId}>{t('diffSettings')}</h2>
          <p>{t('reviewProfileHint')}</p>
          <ReviewEnhancementControls
            value={draft}
            className={css.checkbox}
            onChange={(key, checked) => patch({ [key]: checked })}
          />
          <label htmlFor={inputId}>{t('diffContextExpansionLines')}</label>
          <input
            id={inputId}
            type="number"
            min="1"
            max={Number.MAX_SAFE_INTEGER}
            step="1"
            required
            autoFocus
            value={count}
            aria-describedby={hintId}
            onChange={event => {
              setCount(event.target.value)
            }}
          />
          <p id={hintId}>{t('diffContextExpansionHint')}</p>
          <fieldset>
            <legend>{t('appearance')}</legend>
            <label>
              {t('diffFontSize')}
              <input
                type="number"
                min="10"
                max="24"
                step="1"
                required
                value={draft.fontSize}
                onChange={event => patch({ fontSize: Number(event.target.value) })}
              />
            </label>
            <label>
              {t('diffFontFamily')}
              <select
                value={draft.fontFamily}
                onChange={event =>
                  patch({ fontFamily: event.target.value as DiffViewPreferences['fontFamily'] })
                }
              >
                <option value="mono">{t('diffSystemMono')}</option>
                <option value="consolas">Consolas</option>
                <option value="cascadia">Cascadia Code</option>
                <option value="jetbrains">JetBrains Mono</option>
              </select>
            </label>
            <small>{t('diffFontHint')}</small>
            <label>
              {t('diffLineHeight')}
              <input
                type="number"
                min="1.2"
                max="2.5"
                step="0.1"
                required
                value={draft.lineHeight}
                onChange={event => patch({ lineHeight: Number(event.target.value) })}
              />
            </label>
            <label>
              {t('diffTabSize')}
              <input
                type="number"
                min="1"
                max="8"
                step="1"
                required
                value={draft.tabSize}
                onChange={event => patch({ tabSize: Number(event.target.value) })}
              />
            </label>
            <label>
              {t('diffColors')}
              <select
                value={draft.colors}
                onChange={event =>
                  patch({ colors: event.target.value as DiffViewPreferences['colors'] })
                }
              >
                <option value="theme">{t('diffThemeColors')}</option>
                <option value="blue-orange">{t('diffAccessibleColors')}</option>
              </select>
            </label>
            <label>
              {t('diffColorStrength')}
              <input
                type="number"
                min="5"
                max="40"
                step="1"
                required
                value={draft.colorStrength}
                onChange={event => patch({ colorStrength: Number(event.target.value) })}
              />
            </label>
          </fieldset>
          <fieldset>
            <legend>{t('externalEditor')}</legend>
            <label>
              {t('editorPath')}
              <input
                type="text"
                maxLength={4096}
                value={draft.editorPath}
                placeholder={t('editorAutoDetect')}
                onChange={event => patch({ editorPath: event.target.value })}
              />
            </label>
            <small>{t('editorPathHint')}</small>
          </fieldset>
          <fieldset>
            <legend>{t('diffShortcuts')}</legend>
            <label>
              {t('diffSearch')}
              <select
                value={draft.searchShortcut}
                onChange={event =>
                  patch({
                    searchShortcut: event.target.value as DiffViewPreferences['searchShortcut'],
                  })
                }
              >
                {['mod+f', 'mod+shift+f', 'mod+alt+f'].map(value => (
                  <option key={value} value={value}>
                    {value.replace('mod', 'Ctrl/Cmd')}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t('diffChangeNavigation')}
              <select
                value={draft.changeShortcut}
                onChange={event =>
                  patch({
                    changeShortcut: event.target.value as DiffViewPreferences['changeShortcut'],
                  })
                }
              >
                <option value="mod+arrow">Ctrl/Cmd + ↑ / ↓</option>
                <option value="alt+arrow">Alt + ↑ / ↓</option>
              </select>
            </label>
            <small>{t('diffScopedShortcuts')}</small>
          </fieldset>
          <label className={css.checkbox}>
            <input
              type="checkbox"
              checked={draft.discussionEnabled}
              onChange={event => patch({ discussionEnabled: event.target.checked })}
            />
            {t('discussionEnabled')}
          </label>
          <label className={css.checkbox}>
            <input
              type="checkbox"
              checked={draft.virtualize}
              onChange={event => patch({ virtualize: event.target.checked })}
            />
            {t('diffVirtualize')}
          </label>
          {storageError && <p role="alert">{t('diffPreferencesStorageError')}</p>}
          <div className={css.settingsActions}>
            <button type="button" onClick={resetSettings}>
              {t('diffReset')}
            </button>
            <button
              type="button"
              onClick={() => {
                dialog.current?.close()
              }}
            >
              {t('projectCancel')}
            </button>
            <button type="submit" className={css.settingsSave}>
              {t('diffSettingsSave')}
            </button>
          </div>
        </form>
      </dialog>
      <select
        aria-label={t('diffLayout')}
        title={t('diffLayout')}
        value={preferences.layout}
        onChange={event => {
          void saveQuickPreference({ layout: event.target.value as DiffLayout })
        }}
      >
        <option value="split">{t('diffSplit')}</option>
        <option value="unified">{t('diffUnified')}</option>
      </select>
      <button
        type="button"
        aria-pressed={preferences.wrap}
        title={t('diffWrap')}
        onClick={() => {
          void saveQuickPreference({ wrap: !preferences.wrap })
        }}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M2 3h12M2 7h9a3 3 0 0 1 0 6H7m2-2-2 2 2 2M2 11h2" />
        </svg>
        {t('diffWrap')}
      </button>
      {storageError && <small role="alert">{t('diffPreferencesStorageError')}</small>}
    </div>
  )
}
