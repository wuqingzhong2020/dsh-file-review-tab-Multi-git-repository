/** Deduplicate queued/in-flight diffs and bound a bulk expansion to four requests. */
export declare class ReviewDiffQueue<T> {
    private active;
    private readonly waiting;
    private readonly requests;
    load(key: string, fetch: () => Promise<T>): Promise<T>;
}
export declare function loadMissingReviewDiffs<T>(files: readonly T[], keyOf: (file: T) => string, requested: Set<string>, load: (file: T) => Promise<void>): Promise<void>;
//# sourceMappingURL=git-review-diff-loader.d.ts.map