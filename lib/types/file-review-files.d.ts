import type { FileReviewAction, FileReviewChange, FileReviewFileResult } from './change-types.ts';
interface ResolvedFile {
    readonly filename: string;
    readonly mode: number;
    readonly bytes: Uint8Array;
    /** Raw disk text (line endings as stored). */
    readonly text: string;
    /** Whether the file uses CRLF line endings on disk. */
    readonly crlf: boolean;
    /** Disk text normalized to the backend diff basis (LF), used for hunk math. */
    readonly lfText: string;
}
export declare function resolveReviewFile(cwd: string, requestedPath: string, roots: readonly string[]): Promise<ResolvedFile>;
/** Apply a complete file's hunk sequence in memory, or report a strict mismatch. */
export declare function transformFile(text: string, file: FileReviewChange, action: FileReviewAction): string | null;
export declare function inspectReviewFile(cwd: string, file: FileReviewChange, roots: readonly string[]): Promise<FileReviewFileResult>;
export declare function applyReviewFile(cwd: string, file: FileReviewChange, action: FileReviewAction, roots: readonly string[]): Promise<FileReviewFileResult>;
export {};
//# sourceMappingURL=file-review-files.d.ts.map