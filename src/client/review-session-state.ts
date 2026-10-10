/** One session's authoritative review state, with atomic reset and generation fencing. */
import { parseReviewComments } from './review-comments.ts'
import { parseReviewDiscussions } from './review-discussions.ts'
import { parseConfirmations } from './review-confirmations.ts'

export interface ReviewResetPoint {
  readonly boundarySeq: number
  readonly baseHostTurn: number | null
  readonly resetAt: string
}
export type ReviewSlice = 'comments' | 'discussions' | 'confirmations' | 'archive'
type Slices = Record<ReviewSlice, string>
interface Payload {
  version: 1
  generation: string
  revision: number
  reset: ReviewResetPoint | null
  slices: Slices
}
export interface ReviewSessionSnapshot extends Payload {
  readonly ready: boolean
  readonly error: string | null
  readonly invalid: boolean
}
export interface ReviewStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}
export interface ReviewLocks {
  request<T>(name: string, options: { mode: 'shared' | 'exclusive'; ifAvailable?: boolean },
    callback: (lock: unknown | null) => Promise<T>): Promise<T>
}
export interface ReviewSliceStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  subscribe(listener: () => void): () => void
  hasError(): boolean
}
const PREFIX = 'dsh-file-review-tab-multi-git-repository:'
export const reviewStateKey = (id: string): string => PREFIX + 'review-state:' + id
const emptySlices = (): Slices => ({
  comments: '{"version":1,"comments":[]}',
  discussions: '{"version":1,"records":[]}',
  confirmations: '{"version":2,"confirmed":[]}',
  archive: '{"open":false,"pages":1}',
})
export function parseArchive(raw: string): { open: boolean; pages: number } {
  const value = JSON.parse(raw)
  if (!value || typeof value.open !== 'boolean' || !Number.isSafeInteger(value.pages) || value.pages < 1)
    throw new Error('Invalid review archive')
  return { open: value.open, pages: value.pages }
}
function validateSlice(slice: ReviewSlice, raw: string): void {
  if (slice === 'comments') parseReviewComments(raw)
  else if (slice === 'discussions') parseReviewDiscussions(raw)
  else if (slice === 'confirmations') parseConfirmations(raw)
  else parseArchive(raw)
}
function parsePayload(raw: string): Payload {
  const value = JSON.parse(raw) as Payload
  if (!value || value.version !== 1 || typeof value.generation !== 'string' || !value.generation
    || !Number.isSafeInteger(value.revision) || value.revision < 0 || !value.slices)
    throw new Error('Invalid session review state')
  if (value.reset !== null && (!value.reset || !Number.isSafeInteger(value.reset.boundarySeq)
    || value.reset.boundarySeq < 0 || typeof value.reset.resetAt !== 'string'
    || (value.reset.baseHostTurn !== null && (!Number.isSafeInteger(value.reset.baseHostTurn) || value.reset.baseHostTurn < 1))))
    throw new Error('Invalid review reset point')
  for (const slice of Object.keys(emptySlices()) as ReviewSlice[]) validateSlice(slice, value.slices[slice])
  return value
}
interface SliceUpdate { slice: ReviewSlice; before: string; after: string; generation: string }
/** Merge item deltas into the latest slice; concurrent additions in other windows survive. */
function mergeSlice(update: SliceUpdate, latest: string): string {
  if (update.slice === 'archive') return update.after
  const field = update.slice === 'comments' ? 'comments' : update.slice === 'discussions' ? 'records' : 'confirmed'
  const previous = JSON.parse(update.before)[field] as unknown[]
  const next = JSON.parse(update.after)[field] as unknown[]
  const current = JSON.parse(latest)
  const key = (item: unknown): string => update.slice === 'confirmations'
    ? String((item as unknown[])[0]) : (item as { id: string }).id
  const before = new Map(previous.map(item => [key(item), item]))
  const after = new Map(next.map(item => [key(item), item]))
  const merged = new Map((current[field] as unknown[]).map(item => [key(item), item]))
  for (const id of before.keys()) if (!after.has(id)) merged.delete(id)
  for (const [id, item] of after) {
    if (before.has(id) && JSON.stringify(before.get(id)) === JSON.stringify(item)) continue
    if (!before.has(id) || !merged.has(id) || update.slice === 'confirmations') {
      merged.set(id, item)
    } else if (JSON.stringify(before.get(id)) !== JSON.stringify(item)) {
      const previousItem = before.get(id) as Record<string, unknown>
      const nextItem = item as Record<string, unknown>
      const currentItem = { ...(merged.get(id) as Record<string, unknown>) }
      for (const field of new Set([...Object.keys(previousItem), ...Object.keys(nextItem)])) {
        if (JSON.stringify(previousItem[field]) === JSON.stringify(nextItem[field])) continue
        if (field in nextItem) currentItem[field] = nextItem[field]
        else delete currentItem[field]
      }
      merged.set(id, currentItem)
    }
  }
  return JSON.stringify({ ...current, [field]: [...merged.values()] })
}
export class ReviewSessionState {
  private snapshot: ReviewSessionSnapshot
  private readonly listeners = new Set<() => void>()
  private pending: SliceUpdate[] = []
  private flushing: Promise<void> | undefined
  private initialized: Promise<void> | undefined
  private activities = 0
  private resetting = false
  private notificationPending = false
  readonly key: string
  readonly activityKey: string
  readonly sessionId: string
  private readonly storage: ReviewStorage | undefined
  private readonly locks: ReviewLocks | undefined
  constructor(sessionId: string, storage?: ReviewStorage, locks?: ReviewLocks) {
    this.sessionId = sessionId
    this.storage = storage
    this.locks = locks
    this.key = reviewStateKey(sessionId)
    this.activityKey = this.key + ':activity'
    const initial: Payload = { version: 1, generation: 'initial', revision: 0, reset: null, slices: emptySlices() }
    this.snapshot = { ...initial, ready: false, error: null, invalid: false }
    try {
      const raw = storage?.getItem(this.key)
      if (raw) this.snapshot = { ...parsePayload(raw), ready: false, error: null, invalid: false }
      else if (storage) {
        const slices = emptySlices()
        for (const slice of Object.keys(slices) as ReviewSlice[]) {
          const value = storage.getItem(PREFIX + slice + ':' + sessionId)
            ?? (slice === 'archive' ? storage.getItem('dsh-file-review-tab:archive:' + sessionId) : null)
          if (value !== null) { validateSlice(slice, value); slices[slice] = value }
        }
        this.snapshot = { ...this.snapshot, slices }
      }
    } catch (cause) {
      this.snapshot = { ...this.snapshot, error: String(cause), invalid: true }
    }
  }
  getSnapshot = (): ReviewSessionSnapshot => this.snapshot
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }
  private publish(value: ReviewSessionSnapshot): void {
    this.snapshot = value
    if (this.notificationPending) return
    this.notificationPending = true
    queueMicrotask(() => {
      this.notificationPending = false
      for (const listener of [...this.listeners]) listener()
    })
  }
  private async locked<T>(callback: () => Promise<T>): Promise<T> {
    return this.locks ? this.locks.request(this.key, { mode: 'exclusive' }, callback) : callback()
  }
  initialize(): Promise<void> {
    if (this.initialized) return this.initialized
    this.initialized = this.locked(async () => {
      if (!this.storage) throw new Error('Review storage is unavailable')
      const raw = this.storage.getItem(this.key)
      if (!raw && this.snapshot.error) throw new Error(this.snapshot.error)
      const value: Payload = raw ? parsePayload(raw) : this.payload()
      if (!raw) {
        this.storage.setItem(this.key, JSON.stringify(value))
        if (this.storage.getItem(this.key) !== JSON.stringify(value)) throw new Error('Review migration verification failed')
      }
      for (const slice of Object.keys(emptySlices()) as ReviewSlice[]) {
        const key = PREFIX + slice + ':' + this.sessionId
        this.storage.removeItem(key)
        if (this.storage.getItem(key) !== null) throw new Error('Old review data could not be removed')
      }
      const legacy = 'dsh-file-review-tab:archive:' + this.sessionId
      this.storage.removeItem(legacy)
      if (this.storage.getItem(legacy) !== null) throw new Error('Old archive could not be removed')
      // Local edits queued during migration are replayed over the authoritative payload.
      const slices = { ...value.slices }
      for (const update of this.pending) if (update.generation === value.generation)
        slices[update.slice] = mergeSlice(update, slices[update.slice])
      this.publish({ ...value, slices, ready: true, error: null, invalid: false })
    }).catch(cause => {
      this.publish({ ...this.snapshot, ready: false, error: String(cause) })
    })
    return this.initialized
  }
  private payload(): Payload {
    const { version, generation, revision, reset, slices } = this.snapshot
    return { version, generation, revision, reset, slices }
  }
  sliceStorage(slice: ReviewSlice): ReviewSliceStorage {
    return {
      getItem: () => this.snapshot.slices[slice],
      hasError: () => this.snapshot.error !== null,
      subscribe: listener => this.subscribe(listener),
      setItem: (_key, raw) => {
        if (this.resetting) throw new Error('Review reset is in progress')
        validateSlice(slice, raw)
        const before = this.snapshot.slices[slice]
        if (before === raw) return
        this.pending.push({ slice, before, after: raw, generation: this.snapshot.generation })
        this.publish({ ...this.snapshot, slices: { ...this.snapshot.slices, [slice]: raw } })
        void this.flush()
      },
    }
  }
  async flush(): Promise<void> {
    if (this.flushing) return this.flushing
    this.flushing = (async () => {
      await this.initialize()
      while (this.pending.length) {
        const batch = this.pending.splice(0)
        try {
          await this.locked(async () => {
            if (!this.storage || !this.snapshot.ready) throw new Error(this.snapshot.error ?? 'Review storage is unavailable')
            const latest = parsePayload(this.storage.getItem(this.key) ?? '')
            const slices = { ...latest.slices }
            for (const update of batch) {
              if (update.generation !== latest.generation) continue
              slices[update.slice] = mergeSlice(update, slices[update.slice])
            }
            const value = { ...latest, revision: latest.revision + 1, slices }
            this.storage.setItem(this.key, JSON.stringify(value))
            const visible = { ...slices }
            for (const update of this.pending) if (update.generation === value.generation)
              visible[update.slice] = mergeSlice(update, visible[update.slice])
            this.publish({ ...value, slices: visible, ready: true, error: null, invalid: false })
          })
        } catch (cause) {
          this.pending.unshift(...batch)
          this.publish({ ...this.snapshot, error: String(cause) })
          break
        }
      }
    })().finally(() => { this.flushing = undefined })
    return this.flushing
  }
  reload(): void {
    try {
      const raw = this.storage?.getItem(this.key)
      if (!raw) return
      const value = parsePayload(raw)
      const slices = { ...value.slices }
      for (const update of this.pending) if (update.generation === value.generation)
        slices[update.slice] = mergeSlice(update, slices[update.slice])
      this.pending = this.pending.filter(update => update.generation === value.generation)
      this.publish({ ...value, slices, ready: this.snapshot.ready, error: null, invalid: false })
    } catch (cause) { this.publish({ ...this.snapshot, error: String(cause), invalid: true }) }
  }
  async acquireActivity(generation = this.snapshot.generation): Promise<() => void> {
    await this.flush()
    let release!: () => void
    let acquired!: () => void
    let rejected!: (cause: unknown) => void
    const started = new Promise<void>((resolve, reject) => { acquired = resolve; rejected = reject })
    const perform = async (lock: unknown | null) => {
      try {
        if (!lock || this.resetting) throw new Error('Review reset is in progress')
        if (!this.snapshot.error) this.reload()
        if (generation !== this.snapshot.generation) throw new Error('This review record has been reset')
        this.activities++
        this.publish({ ...this.snapshot })
        await new Promise<void>(resolve => {
          let active = true
          release = () => { if (active) { active = false; this.activities--; this.publish({ ...this.snapshot }); resolve() } }
          acquired()
        })
      } catch (cause) { rejected(cause) }
    }
    if (this.locks) void this.locks.request(this.activityKey, { mode: 'shared', ifAvailable: true }, perform).catch(rejected)
    else void perform({})
    await started
    return release
  }
  async runActivity<T>(generation: string, operation: () => Promise<T>): Promise<T> {
    const release = await this.acquireActivity(generation)
    try { return await operation() } finally { release() }
  }
  async reset(generation: string, captureBoundary: () => number): Promise<void> {
    await this.flush()
    if (!this.storage || !this.locks || !this.snapshot.ready || this.snapshot.error)
      throw new Error(this.snapshot.error ?? 'Shared review storage and locks are unavailable')
    await this.locks.request(this.activityKey, { mode: 'exclusive', ifAvailable: true }, async lock => {
      if (!lock || this.activities || this.resetting) throw new Error('Review operations are still running')
      this.resetting = true
      try {
        await this.locked(async () => {
          const current = parsePayload(this.storage!.getItem(this.key) ?? '')
          if (current.generation !== generation) throw new Error('Review state changed; open the reset dialog again')
          const boundarySeq = captureBoundary()
          if (!Number.isSafeInteger(boundarySeq) || boundarySeq < 0) throw new Error('Review history is not ready')
          const value: Payload = {
            version: 1, generation: globalThis.crypto.randomUUID(), revision: current.revision + 1,
            reset: { boundarySeq, baseHostTurn: null, resetAt: new Date().toISOString() }, slices: emptySlices(),
          }
          this.storage!.setItem(this.key, JSON.stringify(value))
          this.pending = []
          this.publish({ ...value, ready: true, error: null, invalid: false })
        })
      } finally { this.resetting = false }
    })
  }
  async establishBase(generation: string, hostTurn: number): Promise<void> {
    await this.flush()
    await this.locked(async () => {
      if (!this.storage || !this.snapshot.ready) throw new Error('Review storage is unavailable')
      const current = parsePayload(this.storage.getItem(this.key) ?? '')
      if (current.generation !== generation || !current.reset || current.reset.baseHostTurn !== null) return
      if (!Number.isSafeInteger(hostTurn) || hostTurn < 1) throw new Error('Invalid review turn')
      const value = { ...current, revision: current.revision + 1, reset: { ...current.reset, baseHostTurn: hostTurn } }
      this.storage.setItem(this.key, JSON.stringify(value))
      const slices = { ...value.slices }
      for (const update of this.pending) if (update.generation === value.generation)
        slices[update.slice] = mergeSlice(update, slices[update.slice])
      this.publish({ ...value, slices, ready: true, error: null, invalid: false })
    })
  }
  canReset(): boolean { return !!this.storage && !!this.locks && this.snapshot.ready && !this.snapshot.error && !this.activities && !this.resetting }
}
const states = new Map<string, ReviewSessionState>()
export function reviewStateFor(sessionId: string): ReviewSessionState {
  let state = states.get(sessionId)
  if (!state) {
    let storage: Storage | undefined
    try { storage = window.localStorage } catch { /* Ordinary review keeps its memory fallback. */ }
    const locks = typeof navigator === 'object' ? navigator.locks as unknown as ReviewLocks | undefined : undefined
    state = new ReviewSessionState(sessionId, storage, locks)
    states.set(sessionId, state)
    void state.initialize()

  }
  return state
}
export function displayReviewTurn(sessionId: string, turn: number): number {
  const base = reviewStateFor(sessionId).getSnapshot().reset?.baseHostTurn
  return base == null ? turn : turn - base + 1
}

/** Own the cross-window subscriptions once per plugin registration. */
export function registerReviewStateSynchronization(): () => void {
  if (typeof window !== 'object' || typeof window.addEventListener !== 'function') return () => {}
  const refresh = () => { for (const state of states.values()) state.reload() }
  const storage = (event: StorageEvent) => {
    for (const state of states.values()) if (event.key === null || event.key === state.key) state.reload()
  }
  window.addEventListener('storage', storage)
  window.addEventListener('focus', refresh)
  return () => {
    window.removeEventListener('storage', storage)
    window.removeEventListener('focus', refresh)
  }
}
