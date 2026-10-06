import type { ManagedWorkspace } from 'dsh-multi-git-repo-manager/types';
import type { GitReviewDiff, GitReviewFileRequest, GitReviewRequest, GitReviewResult } from './git-review-types.ts';
export { parseGitNames } from './git-review-parser.ts';
export declare function gitReview(workspace: ManagedWorkspace, cwd: string, request: GitReviewRequest): Promise<GitReviewResult>;
export declare function gitReviewDiff(workspace: ManagedWorkspace, cwd: string, request: GitReviewFileRequest): Promise<GitReviewDiff>;
//# sourceMappingURL=git-review.d.ts.map