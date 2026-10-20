import type { GitReviewResult } from '../git-review-types.ts'

/** Replace one repository's data without changing other repository objects or file order. */
export function mergeGitRepositoryReview(
  current: GitReviewResult,
  repository: string,
  update: GitReviewResult,
): GitReviewResult {
  if (update.files.some(file => file.repository !== repository))
    throw new Error('Repository update returned files from another repository')
  if (!update.comparisons.length && update.warnings.length)
    throw new Error(update.warnings.join('\n'))
  const previous = current.repositories.find(repo => repo.path === repository)
  const latest = update.repositories.find(repo => repo.path === repository)
  const names = new Set([previous?.name, latest?.name].filter((name): name is string => name !== undefined))
  // Host descriptions use "<repository name>: ...". Keep ambiguous names rather than
  // deleting another repository's descriptions when two configured names are equal.
  const owned = (line: string) => [...names].some(name =>
    line.startsWith(name + ': ') && !current.repositories.some(repo => repo.path !== repository && repo.name === name))
  const files = []
  let inserted = false
  for (const file of current.files) {
    if (file.repository === repository) {
      if (!inserted) { files.push(...update.files); inserted = true }
    } else files.push(file)
  }
  if (!inserted) files.push(...update.files)
  return {
    repositories: current.repositories.map(repo => repo.path === repository ? latest ?? repo : repo),
    files,
    comparisons: [...new Set([...current.comparisons.filter(line => !owned(line)), ...update.comparisons])],
    warnings: [...new Set([...current.warnings.filter(line => !owned(line)), ...update.warnings])],
  }
}
