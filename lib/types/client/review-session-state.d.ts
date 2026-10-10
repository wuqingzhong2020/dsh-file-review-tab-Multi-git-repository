export interface ReviewResetPoint {
    readonly boundarySeq: number;
    readonly baseHostTurn: number | null;
    readonly resetAt: string;
}
export type ReviewSlice = 'comments' | 'discussions' | 'confirmations' | 'archive';
type Slices = Record<ReviewSlice, string>;
interface Payload {
    version: 1;
    generation: string;
    revision: number;
    reset: ReviewResetPoint | null;
    slices: Slices;
}
export interface ReviewSessionSnapshot extends Payload {
    readonly ready: boolean;
    readonly error: string | null;
    readonly invalid: boolean;
}
export interface ReviewStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}
export interface ReviewLocks {
    request<T>(name: string, options: {
        mode: 'shared' | 'exclusive';
        ifAvailable?: boolean;
    }, callback: (lock: unknown | null) => Promise<T>): Promise<T>;
}
export interface ReviewSliceStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    subscribe(listener: () => void): () => void;
    hasError(): boolean;
}
export declare const reviewStateKey: (id: string) => string;
export declare function parseArchive(raw: string): {
    open: boolean;
    pages: number;
};
export declare class ReviewSessionState {
    private snapshot;
    private readonly listeners;
    private pending;
    private flushing;
    private initialized;
    private activities;
    private resetting;
    private notificationPending;
    readonly key: string;
    readonly activityKey: string;
    readonly sessionId: string;
    private readonly storage;
    private readonly locks;
    constructor(sessionId: string, storage?: ReviewStorage, locks?: ReviewLocks);
    getSnapshot: () => ReviewSessionSnapshot;
    subscribe: (listener: () => void) => (() => void);
    private publish;
    private locked;
    initialize(): Promise<void>;
    private payload;
    sliceStorage(slice: ReviewSlice): ReviewSliceStorage;
    flush(): Promise<void>;
    reload(): void;
    acquireActivity(generation?: string): Promise<() => void>;
    runActivity<T>(generation: string, operation: () => Promise<T>): Promise<T>;
    reset(generation: string, captureBoundary: () => number): Promise<void>;
    establishBase(generation: string, hostTurn: number): Promise<void>;
    canReset(): boolean;
}
export declare function reviewStateFor(sessionId: string): ReviewSessionState;
export declare function displayReviewTurn(sessionId: string, turn: number): number;
/** Own the cross-window subscriptions once per plugin registration. */
export declare function registerReviewStateSynchronization(): () => void;
export {};
//# sourceMappingURL=review-session-state.d.ts.map