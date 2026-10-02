import { useSyncExternalStore } from 'react'
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
  return <div className={css.controls}>
    <select aria-label={t('diffLayout')} title={t('diffLayout')} value={preferences.layout}
      onChange={event => { viewStore().set({ layout: event.target.value as DiffLayout }) }}>
      <option value="split">{t('diffSplit')}</option><option value="unified">{t('diffUnified')}</option>
    </select>
    <button type="button" aria-pressed={preferences.wrap} title={t('diffWrap')} onClick={() => { viewStore().set({ wrap: !preferences.wrap }) }}>
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 3h12M2 7h9a3 3 0 0 1 0 6H7m2-2-2 2 2 2M2 11h2" /></svg>{t('diffWrap')}
    </button>
  </div>
}
