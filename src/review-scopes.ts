/** Stable scope IDs shared by menus, comments, persistence and Host validation. */
interface ScopeLabel {
  readonly label: string
}

type ScopeDefinition = ScopeLabel &
  (
    | { readonly source: 'session' }
    | {
        readonly source: 'git'
        readonly reference: 'none' | 'commit' | 'branch'
        readonly workingTree: boolean
      }
  )

/** Property order is the review menu order; persisted IDs must not be renamed. */
export const REVIEW_SCOPES = {
  'last-turn': { source: 'session', label: 'reviewLastTurn' },
  session: { source: 'session', label: 'reviewSession' },
  pending: { source: 'session', label: 'reviewPending' },
  uncommitted: { source: 'git', label: 'reviewUncommitted', reference: 'none', workingTree: true },
  unstaged: { source: 'git', label: 'reviewUnstaged', reference: 'none', workingTree: true },
  staged: { source: 'git', label: 'reviewStaged', reference: 'none', workingTree: false },
  commit: { source: 'git', label: 'reviewCommit', reference: 'commit', workingTree: false },
  branch: { source: 'git', label: 'reviewBranch', reference: 'branch', workingTree: false },
} as const satisfies Record<string, ScopeDefinition>

export type ReviewMode = keyof typeof REVIEW_SCOPES
type ModeForSource<Source extends ScopeDefinition['source']> = {
  [Mode in ReviewMode]: (typeof REVIEW_SCOPES)[Mode]['source'] extends Source ? Mode : never
}[ReviewMode]
export type SessionReviewMode = ModeForSource<'session'>
export type GitReviewMode = ModeForSource<'git'>
export type GitReviewReference = (typeof REVIEW_SCOPES)[GitReviewMode]['reference']

export const REVIEW_MODES: readonly ReviewMode[] = Object.keys(REVIEW_SCOPES) as ReviewMode[]

export function isReviewMode(value: unknown): value is ReviewMode {
  return typeof value === 'string' && Object.hasOwn(REVIEW_SCOPES, value)
}

export function isSessionReviewMode(value: unknown): value is SessionReviewMode {
  return isReviewMode(value) && REVIEW_SCOPES[value].source === 'session'
}

export function isGitReviewMode(value: unknown): value is GitReviewMode {
  return isReviewMode(value) && REVIEW_SCOPES[value].source === 'git'
}

export function usesWorkingTree(mode: ReviewMode): boolean {
  const scope = REVIEW_SCOPES[mode]
  return scope.source === 'git' && scope.workingTree
}

export const GIT_REVIEW_MODES = REVIEW_MODES.filter(isGitReviewMode)
