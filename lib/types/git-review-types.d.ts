import type { ProducedFileDiff } from './change-types.ts';
export type GitReviewMode = 'uncommitted' | 'unstaged' | 'staged' | 'commit' | 'branch';
export interface GitReviewRequest {
    mode: GitReviewMode;
    repository?: string | undefined;
    ref?: string | undefined;
}
export interface GitReviewFileRequest extends GitReviewRequest {
    repository: string;
    path: string;
}
export interface GitReviewRepository {
    name: string;
    path: string;
    branch: string;
    branches: string[];
    commits: {
        oid: string;
        subject: string;
        date: string;
    }[];
}
export interface GitReviewFile {
    repository: string;
    path: string;
    oldPath?: string | undefined;
    status: string;
    added: number;
    removed: number;
    binary: boolean;
    untracked: boolean;
}
export interface GitReviewResult {
    repositories: GitReviewRepository[];
    files: GitReviewFile[];
    warnings: string[];
    comparisons: string[];
}
export interface GitReviewDiff {
    diffs: ProducedFileDiff[];
    binary: boolean;
    note: string;
}
//# sourceMappingURL=git-review-types.d.ts.map