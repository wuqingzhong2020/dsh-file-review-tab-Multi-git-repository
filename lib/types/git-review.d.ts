import type { ReviewWorkspace } from './repository-types.ts';
import type { GitReviewDiff, GitReviewFile, GitReviewFileRequest, GitReviewRequest, GitReviewResult } from './git-review-types.ts';
export declare function parseGitNames(output: string, repository: string): GitReviewFile[];
export declare function gitReview(workspace: ReviewWorkspace, cwd: string, request: GitReviewRequest): Promise<GitReviewResult>;
export declare function gitReviewDiff(workspace: ReviewWorkspace, cwd: string, request: GitReviewFileRequest): Promise<GitReviewDiff>;
//# sourceMappingURL=git-review.d.ts.map