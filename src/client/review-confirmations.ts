import type { TurnFileChanges } from './session-changes.ts'

const revisions = new WeakMap<TurnFileChanges, string>()

/** Identify the complete recorded turn, independent of repository filtering. */
export function turnConfirmationRevision(turn: TurnFileChanges): string {
  const cached = revisions.get(turn)
  if (cached !== undefined) return cached
  let first = 2166136261
  let second = 0x9e3779b9
  const add = (value: string) => {
    for (let index = 0; index < value.length; index++) {
      const code = value.charCodeAt(index)
      first = Math.imul(first ^ code, 16777619)
      second = Math.imul(second ^ code, 0x5bd1e995)
    }
    first = Math.imul(first ^ 0xff, 16777619)
    second = Math.imul(second ^ 0xff, 0x5bd1e995)
  }
  add(String(turn.turn))
  // Recorder arrival order can change without changing the actual files.
  for (const file of [...turn.files].sort((left, right) => left.path < right.path ? -1 : left.path > right.path ? 1 : 0)) {
    add(JSON.stringify([file.path, file.deleted === true, file.diffs.map(diff => [
      diff.path, diff.oldStart ?? null, diff.newStart ?? null, diff.oldText, diff.newText,
    ])]))
  }
  const revision = `r1:${(first >>> 0).toString(16).padStart(8, '0')}${(second >>> 0).toString(16).padStart(8, '0')}`
  revisions.set(turn, revision)
  return revision
}

export function isTurnConfirmed(turn: TurnFileChanges, confirmed: ReadonlyMap<number, string>): boolean {
  const revision = confirmed.get(turn.turn)
  return !turn.live && revision !== undefined && revision === turnConfirmationRevision(turn)
}

export function pendingTurnChanges(turns: readonly TurnFileChanges[], confirmed: ReadonlyMap<number, string>): readonly TurnFileChanges[] {
  return turns.filter(turn => !isTurnConfirmed(turn, confirmed))
}

interface ConfirmationStorage { getItem(key: string): string | null; setItem(key: string, value: string): void }
export interface ReviewConfirmationSnapshot {
  readonly confirmed: ReadonlyMap<number, string>
  readonly storageError: boolean
}

function parseConfirmations(raw: string): ReadonlyMap<number, string> {
  const value = JSON.parse(raw) as { version?: unknown; confirmed?: unknown } | null
  if (value?.version !== 1 || !Array.isArray(value.confirmed)) throw new Error('Invalid review confirmations')
  const confirmed = new Map<number, string>()
  for (const entry of value.confirmed) {
    if (!Array.isArray(entry) || entry.length !== 2 || !Number.isSafeInteger(entry[0]) || entry[0] < 1
      || typeof entry[1] !== 'string' || !/^r1:[0-9a-f]{16}$/.test(entry[1]) || confirmed.has(entry[0])) {
      throw new Error('Invalid review confirmation')
    }
    confirmed.set(entry[0], entry[1])
  }
  return confirmed
}

/** Session-local review decisions; confirming never writes project files or Git. */
export class ReviewConfirmationStore {
  private snapshot: ReviewConfirmationSnapshot = { confirmed: new Map(), storageError: false }
  private readonly listeners = new Set<() => void>()
  private readonly storage: ConfirmationStorage | undefined
  private readonly key: string
  constructor(storage?: ConfirmationStorage, key = '') {
    this.storage = storage; this.key = key
    try {
      const raw = storage?.getItem(key)
      if (raw !== null && raw !== undefined) this.snapshot = { confirmed: parseConfirmations(raw), storageError: false }
    } catch { this.snapshot = { ...this.snapshot, storageError: true } }
  }
  getSnapshot = (): ReviewConfirmationSnapshot => this.snapshot
  subscribe = (listener: () => void): (() => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener) } }
  setConfirmed(turn: TurnFileChanges, confirm: boolean): boolean {
    if (!Number.isSafeInteger(turn.turn) || turn.turn < 1 || (confirm && (turn.live || turn.files.length === 0))) return false
    const confirmed = new Map(this.snapshot.confirmed)
    if (confirm) confirmed.set(turn.turn, turnConfirmationRevision(turn))
    else confirmed.delete(turn.turn)
    let storageError = false
    try {
      if (!this.storage) storageError = true
      else this.storage.setItem(this.key, JSON.stringify({ version: 1, confirmed: [...confirmed] }))
    } catch { storageError = true }
    this.snapshot = { confirmed, storageError }
    for (const listener of this.listeners) listener()
    return true
  }
}

const stores = new Map<string, ReviewConfirmationStore>()
export function confirmationStoreFor(sessionId: string): ReviewConfirmationStore {
  let store = stores.get(sessionId)
  if (!store) {
    let storage: Storage | undefined
    try { storage = window.localStorage } catch { /* Review decisions remain usable in memory. */ }
    store = new ReviewConfirmationStore(storage, `dsh-file-review-tab-multi-git-repository:confirmations:${sessionId}`)
    stores.set(sessionId, store)
  }
  return store
}
