/** Stable scope IDs shared by menus, comments, persistence and Host validation. */
interface ScopeLabel {
    readonly label: string;
}
type ScopeDefinition = ScopeLabel & ({
    readonly source: 'session';
} | {
    readonly source: 'git';
    readonly reference: 'none' | 'commit' | 'branch';
    readonly workingTree: boolean;
});
/** Property order is the review menu order; persisted IDs must not be renamed. */
export declare const REVIEW_SCOPES: {
    readonly 'last-turn': {
        readonly source: "session";
        readonly label: "reviewLastTurn";
    };
    readonly session: {
        readonly source: "session";
        readonly label: "reviewSession";
    };
    readonly pending: {
        readonly source: "session";
        readonly label: "reviewPending";
    };
    readonly uncommitted: {
        readonly source: "git";
        readonly label: "reviewUncommitted";
        readonly reference: "none";
        readonly workingTree: true;
    };
    readonly unstaged: {
        readonly source: "git";
        readonly label: "reviewUnstaged";
        readonly reference: "none";
        readonly workingTree: true;
    };
    readonly staged: {
        readonly source: "git";
        readonly label: "reviewStaged";
        readonly reference: "none";
        readonly workingTree: false;
    };
    readonly commit: {
        readonly source: "git";
        readonly label: "reviewCommit";
        readonly reference: "commit";
        readonly workingTree: false;
    };
    readonly branch: {
        readonly source: "git";
        readonly label: "reviewBranch";
        readonly reference: "branch";
        readonly workingTree: false;
    };
};
export type ReviewMode = keyof typeof REVIEW_SCOPES;
type ModeForSource<Source extends ScopeDefinition['source']> = {
    [Mode in ReviewMode]: (typeof REVIEW_SCOPES)[Mode]['source'] extends Source ? Mode : never;
}[ReviewMode];
export type SessionReviewMode = ModeForSource<'session'>;
export type GitReviewMode = ModeForSource<'git'>;
export type GitReviewReference = (typeof REVIEW_SCOPES)[GitReviewMode]['reference'];
export declare const REVIEW_MODES: readonly ReviewMode[];
export declare function isReviewMode(value: unknown): value is ReviewMode;
export declare function isSessionReviewMode(value: unknown): value is SessionReviewMode;
export declare function isGitReviewMode(value: unknown): value is GitReviewMode;
export declare function usesWorkingTree(mode: ReviewMode): boolean;
export declare const GIT_REVIEW_MODES: GitReviewMode[];
export {};
//# sourceMappingURL=review-scopes.d.ts.map