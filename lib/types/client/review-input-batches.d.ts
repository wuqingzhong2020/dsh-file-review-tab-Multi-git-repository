/** Frozen batches and submission locks, independent of the editor and Dock lifetime. */
import type { PendingSubmission } from '@deepseek-ai/dsh-api-session-controller/client';
import { type ReviewCommentPacket } from './review-comment-packet.ts';
export declare function reviewBatchReference(packet: ReviewCommentPacket): string;
export declare class ReviewInputBatches {
    private readonly batches;
    private readonly listeners;
    subscribe: (listener: () => void) => (() => void);
    private notify;
    sessionIds(): Set<string>;
    canAttach(sessionId: string): boolean;
    attach(packet: ReviewCommentPacket, discussionEnabled: boolean): void;
    serialize(ref: string, signal: AbortSignal): string;
    /** Admission acknowledges only the frozen comments, preserving edits made after attachment. */
    reconcile(sessionId: string, submissions: readonly PendingSubmission[], entries: readonly unknown[]): void;
    remove(ref: string): void;
    clear(): void;
}
//# sourceMappingURL=review-input-batches.d.ts.map