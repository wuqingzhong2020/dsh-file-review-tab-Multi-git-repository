export type DiffLayout = 'split' | 'unified'
export interface DiffViewPreferences { readonly layout: DiffLayout; readonly wrap: boolean }
export const DEFAULT_DIFF_VIEW: DiffViewPreferences = Object.freeze({ layout: 'unified', wrap: true })
export const DIFF_VIEW_STORAGE_KEY = 'dsh-file-review-tab-multi-git-repository:diff-view'

export function parseDiffViewPreferences(raw: string | null): DiffViewPreferences {
  try {
    const value: unknown = raw === null ? null : JSON.parse(raw)
    if (value && typeof value === 'object' && 'layout' in value && ['split', 'unified'].includes(String(value.layout)) && 'wrap' in value && typeof value.wrap === 'boolean') {
      return { layout: value.layout as DiffLayout, wrap: value.wrap }
    }
  } catch { /* An invalid display preference must not block file review. */ }
  return DEFAULT_DIFF_VIEW
}

/** Share display preferences across open tabs without storing project data. */
export class DiffViewStore {
  private value: DiffViewPreferences
  private readonly listeners = new Set<() => void>()
  private readonly storage: Pick<Storage, 'getItem' | 'setItem'> | undefined
  constructor(storage?: Pick<Storage, 'getItem' | 'setItem'>) {
    this.storage = storage
    let raw: string | null = null
    try { raw = storage?.getItem(DIFF_VIEW_STORAGE_KEY) ?? null } catch { /* Use defaults. */ }
    this.value = parseDiffViewPreferences(raw)
  }
  getSnapshot = (): DiffViewPreferences => this.value
  subscribe = (listener: () => void): (() => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener) } }
  set(patch: Partial<DiffViewPreferences>): void {
    const next = parseDiffViewPreferences(JSON.stringify({ ...this.value, ...patch }))
    if (next.layout === this.value.layout && next.wrap === this.value.wrap) return
    this.value = next
    try { this.storage?.setItem(DIFF_VIEW_STORAGE_KEY, JSON.stringify(next)) } catch { /* Keep the current display usable in memory. */ }
    for (const listener of this.listeners) listener()
  }
}
