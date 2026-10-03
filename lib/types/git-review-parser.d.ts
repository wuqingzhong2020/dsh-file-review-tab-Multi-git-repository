import type { ProducedFileDiff } from './change-types.ts';
import type { GitReviewFile, GitReviewRepository } from './git-review-types.ts';
export declare function parseGitNames(output: string, repository: string): GitReviewFile[];
export declare function applyGitNumstat(output: string, files: GitReviewFile[]): void;
export declare function parseGitCommits(output: string): GitReviewRepository['commits'];
export declare function parseGitTextDiffs(patch: string, filename: string): ProducedFileDiff[];
//# sourceMappingURL=git-review-parser.d.ts.map