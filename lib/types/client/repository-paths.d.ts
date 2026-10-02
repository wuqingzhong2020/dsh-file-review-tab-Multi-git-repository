import type { ReviewRepository } from '../repository-types.ts';
/** Browser-side path labels; the Host independently enforces canonical roots. */
export declare function normalizeReviewPath(path: string): string;
export declare function absoluteReviewPath(path: string): boolean;
/** Return a portable path only for the project itself or its descendants. */
export declare function relativeProjectDirectory(root: string, selected: string): string | null;
/** Normalize manual ../ entries to absolute temporary paths outside the project. */
export declare function repositoryProjectPath(root: string, input: string): string;
export declare function fileRepository(path: string, repositories: readonly ReviewRepository[]): ReviewRepository | undefined;
export declare function repositoryRelativePath(path: string, repo: ReviewRepository): string;
//# sourceMappingURL=repository-paths.d.ts.map