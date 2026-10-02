import { useId, useRef, useState, useSyncExternalStore } from 'react'
import { DiffViewStore, type DiffLayout } from './diff-view-preferences.ts'
import { t } from './locales.ts'
import css from './DiffViewControls.module.css'

let store: DiffViewStore | undefined
function viewStore(): DiffViewStore {
  if (!store) {
    let storage: Storage | undefined
    try { storage = window.localStorage } catch { /* Display preferences remain usable in memory. */ }
    store = new DiffViewStore(storage)
  }
  return store
}
export function useDiffViewPreferences() {
  const store = viewStore()
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
}
export function DiffViewControls() {
  const preferences = useDiffViewPreferences()
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const inputId = useId()
  const hintId = useId()
  const [count, setCount] = useState(String(preferences.contextExpansionLines))
  return <div className={css.controls}>
    <button type="button" aria-label={t('diffSettings')} title={t('diffSettings')} aria-haspopup="dialog" onClick={() => {
      setCount(String(preferences.contextExpansionLines))
      dialog.current?.showModal()
    }}>
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6.5 2 .5-1h2l.5 1 1.5.9 1.2-.1 1 1.7-.7 1v1.8l.7 1-1 1.7-1.2-.1-1.5.9-.5 1H7l-.5-1-1.5-.9-1.2.1-1-1.7.7-1V5.5l-.7-1 1-1.7 1.2.1Z" /><circle cx="8" cy="6.4" r="2" /></svg>{t('diffSettings')}
    </button>
    <dialog ref={dialog} className={css.settingsDialog} aria-labelledby={titleId}>
      <form onSubmit={event => {
        event.preventDefault()
        const lines = Number(count)
        if (!Number.isSafeInteger(lines) || lines < 1) return
        viewStore().set({ contextExpansionLines: lines })
        dialog.current?.close()
      }}>
        <h2 id={titleId}>{t('diffSettings')}</h2>
        <label htmlFor={inputId}>{t('diffContextExpansionLines')}</label>
        <input id={inputId} type="number" min="1" max={Number.MAX_SAFE_INTEGER} step="1" required autoFocus value={count}
          aria-describedby={hintId} onChange={event => { setCount(event.target.value) }} />
        <p id={hintId}>{t('diffContextExpansionHint')}</p>
        <div className={css.settingsActions}>
          <button type="button" onClick={() => { dialog.current?.close() }}>{t('projectCancel')}</button>
          <button type="submit" className={css.settingsSave}>{t('diffSettingsSave')}</button>
        </div>
      </form>
    </dialog>
    <select aria-label={t('diffLayout')} title={t('diffLayout')} value={preferences.layout}
      onChange={event => { viewStore().set({ layout: event.target.value as DiffLayout }) }}>
      <option value="split">{t('diffSplit')}</option><option value="unified">{t('diffUnified')}</option>
    </select>
    <button type="button" aria-pressed={preferences.wrap} title={t('diffWrap')} onClick={() => { viewStore().set({ wrap: !preferences.wrap }) }}>
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 3h12M2 7h9a3 3 0 0 1 0 6H7m2-2-2 2 2 2M2 11h2" /></svg>{t('diffWrap')}
    </button>
  </div>
}
