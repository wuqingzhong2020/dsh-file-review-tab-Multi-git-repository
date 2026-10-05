/** Profile owns portable display choices; local-only appearance fields never cross the wire. */
import type { Context } from '@deepseek-ai/cordis'
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client'
import { type DiffViewPreferences, type DiffViewStore } from './diff-view-preferences.ts'
import { REVIEW_PACKET_PACKAGE } from './review-comment-packet.ts'

export const PROFILE_FIELDS = ['layout', 'wrap', 'dock', 'adaptive', 'foldMessages'] as const
export type ProfileReviewPreferences = Pick<DiffViewPreferences, typeof PROFILE_FIELDS[number]>
interface ReviewProfileConfig {
  reviewSettings?: ProfileReviewPreferences
}
type ReviewProfileForm = ConfigForm<ReviewProfileConfig>
let activeForm: ReviewProfileForm | undefined

export function portablePreferences(value: DiffViewPreferences): ProfileReviewPreferences {
  return Object.fromEntries(PROFILE_FIELDS.map(key => [key, value[key]])) as ProfileReviewPreferences
}

function preferenceOperations(
  values: ProfileReviewPreferences,
  keys: readonly (keyof ProfileReviewPreferences)[],
) {
  return keys.map(key => ({ op: 'set' as const, path: ['reviewSettings', key], value: values[key] }))
}

export async function saveReviewPreferences(
  store: DiffViewStore,
  patch: Partial<DiffViewPreferences>,
): Promise<boolean> {
  const form = activeForm
  const snapshot = form?.getSnapshot()
  if (form && snapshot?.status === 'ready' && snapshot.writable) {
    const next = { ...store.getSnapshot(), ...patch }
    const operations = preferenceOperations(next, PROFILE_FIELDS.filter(key => key in patch))
    if (operations.length && !await form.mutate(operations, snapshot.revision)) return false
    if (activeForm !== form) return false
  }
  store.set(patch)
  return !store.storageError
}

/** Each form attachment owns its migration state and ignores late asynchronous completions. */
function observeProfileForm(
  form: ReviewProfileForm,
  store: DiffViewStore,
  isMigrated: () => boolean,
  markMigrated: () => void,
): () => void {
  let disposed = false
  let migrating = false
  const sync = () => {
    if (disposed || migrating) return
    const snapshot = form.getSnapshot()
    const values = snapshot.value?.reviewSettings
    if (snapshot.status !== 'ready' || !values) return
    const user = snapshot.user as ReviewProfileConfig | undefined
    const base = snapshot.base as ReviewProfileConfig | undefined
    const missing = PROFILE_FIELDS.filter(key =>
      user?.reviewSettings?.[key] === undefined && base?.reviewSettings?.[key] === undefined,
    )
    if (missing.length && !isMigrated()) {
      if (!snapshot.writable) return // Keep usable old local values in read-only mode.
      migrating = true
      const operations = preferenceOperations(portablePreferences(store.getSnapshot()), missing)
      void form.mutate(operations, snapshot.revision).then(ok => {
        if (disposed) return
        migrating = false
        if (ok) {
          markMigrated()
          sync()
        }
      }, () => { migrating = false })
      return
    }
    store.set(values)
  }
  const unsubscribe = form.subscribe(sync)
  sync()
  return () => {
    disposed = true
    unsubscribe()
  }
}

export function bindProfileReviewPreferences(ctx: Context, store: DiffViewStore): () => void {
  const mirror = ctx.configForms.describe()
  const migratedNamespaces = new Set<string>()
  let attachment: { form: ReviewProfileForm; dispose: () => void } | undefined
  let disposed = false

  const detach = () => {
    attachment?.dispose()
    if (activeForm === attachment?.form) activeForm = undefined
    attachment = undefined
  }
  const attach = () => {
    if (disposed) return
    const namespace = mirror.getSnapshot().view?.namespaces.find(item => {
      const value = item.value as { reviewSettingsOwner?: unknown } | null
      return value?.reviewSettingsOwner === REVIEW_PACKET_PACKAGE
    })
    if (!namespace) {
      detach()
      return
    }
    const form = ctx.configForms.get<ReviewProfileConfig>(namespace.ns)
    if (attachment?.form === form) return
    detach()
    activeForm = form
    attachment = {
      form,
      dispose: observeProfileForm(
        form,
        store,
        () => migratedNamespaces.has(namespace.ns),
        () => { migratedNamespaces.add(namespace.ns) },
      ),
    }
  }
  const offMirror = mirror.subscribe(attach)
  void mirror.ensure().then(attach).catch(() => {
    // Optional Profile discovery can be unavailable; local preferences remain usable.
  })
  attach()
  return () => {
    disposed = true
    offMirror()
    detach()
  }
}
