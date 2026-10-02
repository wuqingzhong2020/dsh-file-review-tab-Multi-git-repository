export interface ReviewRepositoryIdentity { readonly key: string; readonly name: string; readonly path: string }
export interface ReviewRepositoryFileGroup<T> extends ReviewRepositoryIdentity { readonly files: readonly T[] }

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
