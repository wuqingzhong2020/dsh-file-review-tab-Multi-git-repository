/** Shared identities and Host contract for the session review page. */
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
import type { FileReviewRequest, FileReviewResult, RecordedRequest, RecordedResult } from '../change-types.ts';
import type { ManagedWorkspace } from 'dsh-multi-git-repo-manager/types';
import type { SessionFileChange } from './session-changes.ts';
import type { UnifiedDiffStats } from './UnifiedDiff.tsx';
export type { ReviewMode } from '../review-scopes.ts';
export interface FileReviewRemote {
    workspace(): Promise<RemoteResult<ManagedWorkspace>>;
    status(request: FileReviewRequest): Promise<RemoteResult<FileReviewResult>>;
    apply(request: FileReviewRequest): Promise<RemoteResult<FileReviewResult>>;
    recorded(request: RecordedRequest): Promise<RemoteResult<RecordedResult>>;
}
/** One flattened (turn, file) change unit used for status and apply requests. */
export interface FlatChange {
    readonly turn: number;
    readonly path: string;
    readonly diffs: SessionFileChange['diffs'];
    /** Deleted paths stay listed but never reach the Host inspector. */
    readonly deleted?: true;
}
/** Keep the existing row identity: expansion, status and deep links share it. */
export declare function stateKey(turn: number, path: string): string;
/** UI eligibility only: contextual hunks or lifecycle identities still need Host validation. */
export declare function isReversible(file: SessionFileChange): boolean;
export declare function addStats(left: UnifiedDiffStats, right: UnifiedDiffStats): UnifiedDiffStats;
//# sourceMappingURL=file-review-model.d.ts.map