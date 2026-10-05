import type { ConversationSnapshot } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { GitReviewRepository } from '../git-review-types.ts'
import {
  REVIEW_SCOPES,
  isSessionReviewMode,
  type GitReviewMode,
  type GitReviewReference,
  type ReviewMode,
  type SessionReviewMode,
} from '../review-scopes.ts'
import { lastTurnChanges, type TurnFileChanges } from './session-changes.ts'
import { pendingTurnChanges } from './review-confirmations.ts'
import type { CopyKey } from './locales.ts'

interface SessionScopeInput {
  snapshot: ConversationSnapshot | null
  turns: readonly TurnFileChanges[]
  confirmed: ReadonlyMap<number, string>
}

interface SessionScopeBehavior {
  select(input: SessionScopeInput): readonly TurnFileChanges[]
  pagination: 'archive' | 'pending'
  empty: CopyKey
  filteredEmpty: CopyKey
}

/** A new session scope must explicitly choose its filtering and paging behavior. */
const SESSION_SCOPE_BEHAVIORS = {
  'last-turn': {
    select: ({ snapshot, turns }) => lastTurnChanges(snapshot, turns),
    pagination: 'archive',
    empty: 'lastTurnEmpty',
    filteredEmpty: 'lastTurnRepoEmpty',
  },
  session: {
    select: ({ turns }) => turns,
    pagination: 'archive',
    empty: 'empty',
    filteredEmpty: 'repoFilterEmpty',
  },
  pending: {
    select: ({ turns, confirmed }) => pendingTurnChanges(turns, confirmed),
    pagination: 'pending',
    empty: 'pendingEmpty',
    filteredEmpty: 'pendingRepoEmpty',
  },
} satisfies Record<SessionReviewMode, SessionScopeBehavior>

/** Session hooks remain mounted in Git scopes and keep their existing all-turn view. */
export function sessionScopeBehavior(mode: ReviewMode): SessionScopeBehavior {
  return SESSION_SCOPE_BEHAVIORS[isSessionReviewMode(mode) ? mode : 'session']
}

interface ReferenceOption {
  value: string
  label: string
}

interface ReferenceSelector {
  defaultLabel: CopyKey
  options(repository: GitReviewRepository): ReferenceOption[]
}

const REFERENCE_SELECTORS = {
  commit: {
    defaultLabel: 'reviewHead',
    options: repository =>
      repository.commits.map(commit => ({
        value: commit.oid,
        label: `${commit.oid.slice(0, 8)} · ${commit.subject} · ${commit.date}`,
      })),
  },
  branch: {
    defaultLabel: 'reviewAutoBranch',
    options: repository => repository.branches.map(branch => ({ value: branch, label: branch })),
  },
} satisfies Record<Exclude<GitReviewReference, 'none'>, ReferenceSelector>

export function gitReferenceSelector(mode: GitReviewMode, repository?: GitReviewRepository) {
  const scope = REVIEW_SCOPES[mode]
  if (scope.reference === 'none') return null
  const selector = REFERENCE_SELECTORS[scope.reference]
  return {
    label: scope.label,
    defaultLabel: selector.defaultLabel,
    options: repository === undefined ? [] : selector.options(repository),
  }
}
