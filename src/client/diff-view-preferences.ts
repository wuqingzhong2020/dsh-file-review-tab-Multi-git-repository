export type DiffLayout = 'split' | 'unified'
export interface DiffViewPreferences {
  readonly layout: DiffLayout; readonly wrap: boolean; readonly contextExpansionLines: number
  readonly fontSize: number; readonly lineHeight: number; readonly tabSize: number
  readonly fontFamily: 'mono' | 'consolas' | 'cascadia' | 'jetbrains'
  readonly colors: 'theme' | 'blue-orange'; readonly colorStrength: number
  readonly editorPath: string; readonly discussionEnabled: boolean; readonly virtualize: boolean
  readonly searchShortcut: 'mod+f' | 'mod+shift+f' | 'mod+alt+f'
  readonly changeShortcut: 'mod+arrow' | 'alt+arrow'
}
export const DEFAULT_DIFF_VIEW: DiffViewPreferences = Object.freeze({
  layout: 'unified', wrap: true, contextExpansionLines: 20, fontSize: 13, lineHeight: 1.7, tabSize: 4,
  fontFamily: 'mono', colors: 'theme', colorStrength: 14, editorPath: '', discussionEnabled: true, virtualize: true,
  searchShortcut: 'mod+f', changeShortcut: 'mod+arrow',
})
export const DIFF_VIEW_STORAGE_KEY = 'dsh-file-review-tab-multi-git-repository:diff-view'

export function parseDiffViewPreferences(raw: string | null): DiffViewPreferences {
  try {
    const value: unknown = raw === null ? null : JSON.parse(raw)
    if (value && typeof value === 'object' && 'layout' in value && ['split', 'unified'].includes(String(value.layout)) && 'wrap' in value && typeof value.wrap === 'boolean') {
      const count = 'contextExpansionLines' in value ? value.contextExpansionLines : undefined
      const record = value as Record<string, unknown>
      const numeric = (key: 'fontSize' | 'lineHeight' | 'tabSize' | 'colorStrength', min: number, max: number, integer = false) => typeof record[key] === 'number' && Number.isFinite(record[key]) && record[key] >= min && record[key] <= max && (!integer || Number.isInteger(record[key])) ? record[key] as number : DEFAULT_DIFF_VIEW[key]
      const choice = <K extends 'fontFamily' | 'colors' | 'searchShortcut' | 'changeShortcut'>(key: K, options: readonly string[]): DiffViewPreferences[K] => options.includes(String(record[key])) ? record[key] as DiffViewPreferences[K] : DEFAULT_DIFF_VIEW[key]
      return { ...DEFAULT_DIFF_VIEW, layout: value.layout as DiffLayout, wrap: value.wrap,
        contextExpansionLines: typeof count === 'number' && Number.isSafeInteger(count) && count > 0 ? count : DEFAULT_DIFF_VIEW.contextExpansionLines,
        fontSize: numeric('fontSize', 10, 24, true), lineHeight: numeric('lineHeight', 1.2, 2.5), tabSize: numeric('tabSize', 1, 8, true), colorStrength: numeric('colorStrength', 5, 40, true),
        fontFamily: choice('fontFamily', ['mono', 'consolas', 'cascadia', 'jetbrains']), colors: choice('colors', ['theme', 'blue-orange']),
        searchShortcut: choice('searchShortcut', ['mod+f', 'mod+shift+f', 'mod+alt+f']), changeShortcut: choice('changeShortcut', ['mod+arrow', 'alt+arrow']),
        editorPath: typeof record.editorPath === 'string' && record.editorPath.length <= 4096 ? record.editorPath.trim() : '',
        discussionEnabled: typeof record.discussionEnabled === 'boolean' ? record.discussionEnabled : true,
        virtualize: typeof record.virtualize === 'boolean' ? record.virtualize : true,
      }
    }
  } catch { /* An invalid display preference must not block file review. */ }
  return DEFAULT_DIFF_VIEW
}

/** Share display preferences across open tabs without storing project data. */
export class DiffViewStore {
  storageError = false
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
    if (JSON.stringify(next) === JSON.stringify(this.value) && !this.storageError) return
    this.value = next
    try { if (!this.storage) throw new Error('Storage unavailable'); this.storage.setItem(DIFF_VIEW_STORAGE_KEY, JSON.stringify(next)); this.storageError = false } catch { this.storageError = true }
    for (const listener of this.listeners) listener()
  }
}
