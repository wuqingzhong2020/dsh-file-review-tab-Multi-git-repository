import type { GitReviewRequest } from './git-review-types.ts';
export declare const MAX_GIT_REVIEW_BYTES: number;
export declare const GIT_DIFF_FLAGS: string[];
export interface GitReviewComparison {
    args: string[];
    comparison: string;
}
/** Injection point for comparison planning tests; production always uses the bounded runner. */
export type ReviewGitRunner = (root: string, args: string[]) => Promise<string>;
export declare function runReviewGit(root: string, args: string[]): Promise<string>;
/** An omitted branch uses the remote default, main/master, then another branch. */
export declare function resolveDefaultBranchRequest(root: string, request: GitReviewRequest, run?: ReviewGitRunner): Promise<GitReviewRequest>;
export declare function resolveGitComparison(root: string, request: GitReviewRequest, run?: ReviewGitRunner): Promise<GitReviewComparison>;
//# sourceMappingURL=git-review-command.d.ts.map