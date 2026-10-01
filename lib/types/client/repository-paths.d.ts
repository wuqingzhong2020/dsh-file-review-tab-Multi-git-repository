import type { ReviewRepository } from '../repository-types.ts';
/** Browser-side path labels; the Host independently enforces canonical roots. */
export declare function normalizeReviewPath(path: string): string;
export declare function absoluteReviewPath(path: string): boolean;
/** Return a portable path when both absolute paths share a volume/share. */
export declare function relativeProjectDirectory(root: string, selected: string): string | null;
export declare function fileRepository(path: string, repositories: readonly ReviewRepository[]): ReviewRepository | undefined;
export declare function repositoryRelativePath(path: string, repo: ReviewRepository): string;
//# sourceMappingURL=repository-paths.d.ts.map