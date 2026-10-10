import type { SetStateAction } from 'react';
import { type TurnFileChanges } from './session-changes.ts';
import type { ReviewMode } from './file-review-model.ts';
/** Pending queues page newest-first; other session scopes use a saved archive. */
export declare function useFileReviewArchive(sessionId: string, filteredTurns: readonly TurnFileChanges[], reviewMode: ReviewMode, pendingPages: number): {
    mainTurns: readonly TurnFileChanges[];
    archivedTurns: readonly TurnFileChanges[];
    archivedVisible: TurnFileChanges[];
    renderedTurns: TurnFileChanges[];
    pendingRemaining: number;
    archivedRemaining: number;
    archiveOpen: boolean;
    setArchiveOpen: (value: SetStateAction<boolean>) => void;
    setArchivePages: (value: SetStateAction<number>) => void;
};
//# sourceMappingURL=use-file-review-archive.d.ts.map