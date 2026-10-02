export interface ReviewRepositoryIdentity {
    readonly key: string;
    readonly name: string;
    readonly path: string;
}
export interface ReviewRepositoryFileGroup<T> extends ReviewRepositoryIdentity {
    readonly files: readonly T[];
}
export declare function repositoryGroupId(session: string, range: string | number, repository: string): string;
export declare function allFileContentsExpanded(expanded: ReadonlySet<string>, keys: readonly string[]): boolean;
/** Change only these file contents; repository lists and other scopes are independent. */
export declare function setFileContentsExpanded(current: ReadonlySet<string>, keys: readonly string[], expanded: boolean): ReadonlySet<string>;
/** Scope the command to these visible groups; other turns and repositories stay as they were. */
export declare function setRepositoryGroupsCollapsed(current: ReadonlySet<string>, keys: readonly string[], collapsed: boolean): ReadonlySet<string>;
/** Preserve file order and keep identically named repositories isolated by root. */
export declare function groupReviewFiles<T>(files: readonly T[], owner: (file: T) => ReviewRepositoryIdentity): ReviewRepositoryFileGroup<T>[];
//# sourceMappingURL=review-repository-groups.d.ts.map