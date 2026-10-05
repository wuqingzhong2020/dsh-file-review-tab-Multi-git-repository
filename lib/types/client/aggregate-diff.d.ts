/** Multi-repository review report, deliberately distinct from an applicable Git patch. */
import type { ProducedFileDiff } from '../change-types.ts';
export declare const COPY_FILE_LIMIT = 256;
export declare const COPY_BYTE_LIMIT: number;
export interface AggregateDiffFile {
    repository: string;
    path: string;
    source: string;
    diffs: readonly ProducedFileDiff[];
    note?: string;
}
export declare function aggregateDiffText(files: readonly AggregateDiffFile[]): string;
//# sourceMappingURL=aggregate-diff.d.ts.map