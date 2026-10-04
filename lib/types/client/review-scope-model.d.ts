import type { ConversationSnapshot } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { GitReviewRepository } from '../git-review-types.ts';
import { type GitReviewMode, type ReviewMode } from '../review-scopes.ts';
import { type TurnFileChanges } from './session-changes.ts';
import type { CopyKey } from './locales.ts';
interface SessionScopeInput {
    snapshot: ConversationSnapshot | null;
    turns: readonly TurnFileChanges[];
    confirmed: ReadonlyMap<number, string>;
}
interface SessionScopeBehavior {
    select(input: SessionScopeInput): readonly TurnFileChanges[];
    pagination: 'archive' | 'pending';
    empty: CopyKey;
    filteredEmpty: CopyKey;
}
/** Session hooks remain mounted in Git scopes and keep their existing all-turn view. */
export declare function sessionScopeBehavior(mode: ReviewMode): SessionScopeBehavior;
export declare function gitReferenceSelector(mode: GitReviewMode, repository?: GitReviewRepository): {
    label: "reviewCommit" | "reviewBranch";
    defaultLabel: "reviewHead" | "reviewAutoBranch";
    options: {
        value: string;
        label: string;
    }[];
} | null;
export {};
//# sourceMappingURL=review-scope-model.d.ts.map