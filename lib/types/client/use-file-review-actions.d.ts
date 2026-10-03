import type { Dispatch, SetStateAction } from 'react';
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client';
import type { FileReviewAction, FileReviewFileState } from '../change-types.ts';
import { type CopyKey } from './locales.ts';
import { type FlatChange } from './file-review-model.ts';
interface FileReviewActionState {
    readonly states: ReadonlyMap<string, FileReviewFileState>;
    readonly setStates: Dispatch<SetStateAction<ReadonlyMap<string, FileReviewFileState>>>;
    readonly statusPending: boolean;
    readonly setStatusPending: Dispatch<SetStateAction<boolean>>;
    readonly busyKey: string | null;
    readonly setBusyKey: Dispatch<SetStateAction<string | null>>;
}
interface FileReviewActionOptions {
    readonly sessions: ISessions;
    readonly sessionId: string;
    readonly visible: boolean;
    readonly isGitMode: boolean;
    readonly flat: readonly FlatChange[];
    readonly inspectable: readonly FlatChange[];
    readonly flatKey: string;
    readonly tick: number;
    readonly showNotice: (tone: 'success' | 'error', key: CopyKey, details?: string) => void;
    readonly state: FileReviewActionState;
}
/** Inspect displayed changes and serialize per-turn/per-file undo and redo. */
export declare function useFileReviewActions({ sessions, sessionId, visible, isGitMode, flat, inspectable, flatKey, tick, showNotice, state, }: FileReviewActionOptions): {
    states: ReadonlyMap<string, FileReviewFileState>;
    statusPending: boolean;
    busyKey: string | null;
    runToggle: (key: string, items: readonly FlatChange[], action: FileReviewAction) => void;
};
export type FileReviewActions = ReturnType<typeof useFileReviewActions>;
export {};
//# sourceMappingURL=use-file-review-actions.d.ts.map