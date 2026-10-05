/** One selection contract is shared by session filtering, Git comparison and deep links. */
import type { ManagedTarget, TargetPathResolution } from 'dsh-multi-git-repo-manager/types'
export type TargetSelection =
  | { kind: 'all-git' }
  | { kind: 'git'; path: string }
  | { kind: 'all-directories' }
  | { kind: 'directory'; path: string }
  | { kind: 'unmanaged' }

export const ALL_DIRECTORIES = '@directories'
export function defaultTargetFilter(targets: readonly ManagedTarget[] | undefined): string {
  if (targets?.some(target => target.kind === 'git' && target.state === 'ready')) return '*'
  return targets?.some(target => target.kind === 'directory' && target.state === 'ready') ? ALL_DIRECTORIES : '*'
}
export function targetSelection(value: string, targets: readonly ManagedTarget[]): TargetSelection {
  if (value === '*') return { kind: 'all-git' }
  if (value === ALL_DIRECTORIES) return { kind: 'all-directories' }
  if (value === '?') return { kind: 'unmanaged' }
  return { kind: targets.find(target => target.path === value)?.kind === 'directory' ? 'directory' : 'git', path: value }
}
export function selectionIncludes(selection: TargetSelection, owner: TargetPathResolution | undefined): boolean {
  if (selection.kind === 'unmanaged') return owner?.state !== 'managed'
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
