import type { TurnFileChanges } from './session-changes.ts';
/** Identify the complete recorded turn, independent of repository filtering. */
export declare function turnConfirmationRevision(turn: TurnFileChanges): string;
export declare function isTurnConfirmed(turn: TurnFileChanges, confirmed: ReadonlyMap<number, string>): boolean;
export declare function pendingTurnChanges(turns: readonly TurnFileChanges[], confirmed: ReadonlyMap<number, string>): readonly TurnFileChanges[];
interface ConfirmationStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}
export interface ReviewConfirmationSnapshot {
    readonly confirmed: ReadonlyMap<number, string>;
    readonly storageError: boolean;
}
/** Session-local review decisions; confirming never writes project files or Git. */
export declare class ReviewConfirmationStore {
    private snapshot;
    private readonly listeners;
    private readonly storage;
    private readonly key;
    constructor(storage?: ConfirmationStorage, key?: string);
    getSnapshot: () => ReviewConfirmationSnapshot;
    subscribe: (listener: () => void) => (() => void);
    setConfirmed(turn: TurnFileChanges, confirm: boolean): boolean;
}
export declare function confirmationStoreFor(sessionId: string): ReviewConfirmationStore;
export {};
//# sourceMappingURL=review-confirmations.d.ts.map