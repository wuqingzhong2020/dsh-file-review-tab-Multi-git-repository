import { type LifecycleImage, type LifecycleRecord } from './lifecycle-record.ts';
import type { FileReviewAction, FileReviewFileResult } from './change-types.ts';
export declare function lifecyclePath(cwd: string, path: string, roots: readonly string[]): Promise<string>;
export declare function captureImage(filename: string): Promise<LifecycleImage | null>;
/** Content equality deliberately ignores inode changes made by our own atomic writes. */
export declare function sameLifecycleImage(a: LifecycleImage | null, b: LifecycleImage | null): boolean;
/** Host verified records are the sole authority for whole-file writes/deletions. */
export declare function applyLifecycle(cwd: string, path: string, roots: readonly string[], records: readonly LifecycleRecord[], action?: FileReviewAction, identities?: Map<string, LifecycleImage>): Promise<FileReviewFileResult>;
//# sourceMappingURL=file-lifecycle.d.ts.map