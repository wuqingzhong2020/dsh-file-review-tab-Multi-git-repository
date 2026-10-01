/** Refresh visible review tabs after this client saves native project settings. */
const listeners = new Set<() => void>()
export function repositoriesChanged(): void { for (const listener of listeners) listener() }
export function subscribeRepositories(listener: () => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}
