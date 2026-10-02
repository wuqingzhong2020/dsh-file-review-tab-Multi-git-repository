/** Deduplicate queued/in-flight diffs and bound a bulk expansion to four requests. */
export declare function loadMissingReviewDiffs<T>(files: readonly T[], keyOf: (file: T) => string, requested: Set<string>, load: (file: T) => Promise<void>): Promise<void>;
//# sourceMappingURL=git-review-diff-loader.d.ts.map