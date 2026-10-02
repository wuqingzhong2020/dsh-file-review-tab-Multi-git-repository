export interface ReviewRepositoryIdentity {
    readonly key: string;
    readonly name: string;
    readonly path: string;
}
export interface ReviewRepositoryFileGroup<T> extends ReviewRepositoryIdentity {
    readonly files: readonly T[];
}
/** Preserve file order and keep identically named repositories isolated by root. */
export declare function groupReviewFiles<T>(files: readonly T[], owner: (file: T) => ReviewRepositoryIdentity): ReviewRepositoryFileGroup<T>[];
//# sourceMappingURL=review-repository-groups.d.ts.map