import type { GitReviewDiff, GitReviewFile } from '../git-review-types.ts';
import { type AggregateDiffFile } from './aggregate-diff.ts';
export declare function gitReviewFileKey(file: Pick<GitReviewFile, 'repository' | 'path'>): string;
interface GitReviewReportOptions {
    source: string;
    load: (file: GitReviewFile) => Promise<GitReviewDiff>;
    /** Refuse cancellation or a changed comparison before and after each asynchronous read. */
    ensureActive: () => void;
}
/** Retain file order and partial failures while bounding the in-memory copy payload. */
export declare function loadGitReviewReport(files: readonly GitReviewFile[], { source, load, ensureActive }: GitReviewReportOptions): Promise<AggregateDiffFile[]>;
export {};
//# sourceMappingURL=git-review-report.d.ts.map