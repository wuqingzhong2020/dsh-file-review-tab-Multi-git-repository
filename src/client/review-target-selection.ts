/** One selection contract is shared by session filtering, Git comparison and deep links. */
import type { ManagedTarget, TargetPathResolution } from 'dsh-multi-git-repo-manager/types'
import { relativeProjectDirectory } from 'dsh-multi-git-repo-manager/paths'
export type TargetSelection =
  | { kind: 'all-git' }
  | { kind: 'git'; path: string }
  | { kind: 'all-directories' }
  | { kind: 'directory'; path: string }
  | { kind: 'project'; root: string }
  | { kind: 'unmanaged' }

export const ALL_DIRECTORIES = '@directories'
/** Every target and undisclosed boundary inside one project directory. */
export const PROJECT_DIRECTORY = '@project'
export function defaultTargetFilter(targets: readonly ManagedTarget[] | undefined): string {
  if (targets?.some(target => target.kind === 'git' && target.state === 'ready')) return '*'
  return targets?.some(target => target.kind === 'directory' && target.state === 'ready') ? ALL_DIRECTORIES : '*'
}
export function targetSelection(value: string, targets: readonly ManagedTarget[], projectRoot = ''): TargetSelection {
  if (value === '*') return { kind: 'all-git' }
  if (value === ALL_DIRECTORIES) return { kind: 'all-directories' }
  if (value === PROJECT_DIRECTORY) return { kind: 'project', root: projectRoot }
  if (value === '?') return { kind: 'unmanaged' }
  return { kind: targets.find(target => target.path === value)?.kind === 'directory' ? 'directory' : 'git', path: value }
}
export function selectionIncludes(selection: TargetSelection, owner: TargetPathResolution | undefined): boolean {
  if (selection.kind === 'unmanaged') return owner?.state !== 'managed'
  // The project selection spans Git repositories, ordinary directories and the
  // undisclosed boundaries between them; only the project root bounds it.
  if (selection.kind === 'project') {
    if (owner === undefined) return false
    if (owner.state !== 'managed' && owner.state !== 'unmanaged') return false
    return selection.root === '' || relativeProjectDirectory(selection.root, owner.path) !== null
  }
  if (owner?.state !== 'managed' || !owner.target) return false
  switch (selection.kind) {
    case 'all-git': return owner.target.kind === 'git'
    case 'all-directories': return owner.target.kind === 'directory'
    default: return owner.target.kind === selection.kind && owner.target.path === selection.path
  }
}
export function isDirectorySelection(selection: TargetSelection): boolean {
  return selection.kind === 'directory' || selection.kind === 'all-directories' || selection.kind === 'unmanaged'
}
/** Git comparisons accept one concrete repository; aggregate selections mean every repository. */
export function gitRepositoryFilter(value: string): string {
  return value === ALL_DIRECTORIES || value === PROJECT_DIRECTORY || value === '?' ? '*' : value
}
