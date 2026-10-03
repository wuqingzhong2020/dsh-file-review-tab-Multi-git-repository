import { type ReviewComment } from './review-comments.ts';
export { reconcileDiscussions } from './review-discussion-events.ts';
export interface DiscussionReply {
    readonly id: string;
    readonly seq: number;
    readonly text: string;
    readonly interrupted: boolean;
}
export type DiscussionState = 'submitting' | 'queued' | 'running' | 'answered' | 'completed' | 'cancelled' | 'failed' | 'unknown' | 'unlinked';
export interface ReviewDiscussion {
    readonly id: string;
    readonly requestId: string;
    readonly parentId?: string | undefined;
    readonly createdAt: number;
    readonly comments: readonly ReviewComment[];
    readonly state: DiscussionState;
    readonly userSeq?: number | undefined;
    readonly turn?: number | undefined;
    readonly replies: readonly DiscussionReply[];
    readonly readSeq: number;
    readonly resolved: readonly string[];
}
interface DiscussionStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}
export interface DiscussionSnapshot {
    readonly records: readonly ReviewDiscussion[];
    readonly storageError: boolean;
}
export declare function isAdmittedDiscussionState(state: DiscussionState): boolean;
export declare function parseReviewDiscussions(raw: string): readonly ReviewDiscussion[];
export declare class ReviewDiscussionStore {
    private snapshot;
    private readonly listeners;
    private readonly storage;
    private readonly key;
    constructor(storage?: DiscussionStorage, key?: string);
    getSnapshot: () => DiscussionSnapshot;
    subscribe: (listener: () => void) => (() => void);
    private publish;
    begin(comments: readonly ReviewComment[], requestId: string, parentId?: string): string;
    settle(id: string, state: DiscussionState): void;
    read(id: string): void;
    resolve(id: string, commentId: string, resolved: boolean): void;
    reconcile(entries: readonly unknown[]): void;
}
//# sourceMappingURL=review-discussions.d.ts.map