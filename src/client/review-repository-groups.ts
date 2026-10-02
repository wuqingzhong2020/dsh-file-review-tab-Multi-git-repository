export interface ReviewRepositoryIdentity { readonly key: string; readonly name: string; readonly path: string }
export interface ReviewRepositoryFileGroup<T> extends ReviewRepositoryIdentity { readonly files: readonly T[] }

export function repositoryGroupId(session: string, range: string | number, repository: string): string {
  return JSON.stringify([session, range, repository])
}
export function allFileContentsExpanded(expanded: ReadonlySet<string>, keys: readonly string[]): boolean {
  return keys.length > 0 && keys.every(key => expanded.has(key))
}
/** Change only these file contents; repository lists and other scopes are independent. */
export function setFileContentsExpanded(current: ReadonlySet<string>, keys: readonly string[], expanded: boolean): ReadonlySet<string> {
  const next = new Set(current)
  for (const key of keys) { if (expanded) next.add(key); else next.delete(key) }
  return next
}
/** Scope the command to these visible groups; other turns and repositories stay as they were. */
export function setRepositoryGroupsCollapsed(current: ReadonlySet<string>, keys: readonly string[], collapsed: boolean): ReadonlySet<string> {
  const next = new Set(current)
  for (const key of keys) { if (collapsed) next.add(key); else next.delete(key) }
  return next
}

/** Preserve file order and keep identically named repositories isolated by root. */
export function groupReviewFiles<T>(files: readonly T[], owner: (file: T) => ReviewRepositoryIdentity): ReviewRepositoryFileGroup<T>[] {
  const groups = new Map<string, ReviewRepositoryIdentity & { files: T[] }>()
  for (const file of files) {
    const repository = owner(file)
    const existing = groups.get(repository.key)
    if (existing) existing.files.push(file)
    else groups.set(repository.key, { ...repository, files: [file] })
  }
  return [...groups.values()]
}
