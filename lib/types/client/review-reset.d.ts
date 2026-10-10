/** Read-only reset boundaries from the official Session event window and Inbox projection. */
import type { ISessions, SessionBinding } from '@deepseek-ai/dsh-api-session-controller/client';
import type { Context } from '@deepseek-ai/cordis';
export declare function durableReviewSeqs(entries: readonly unknown[]): number[];
export declare function captureReviewBoundary(ctx: Context, sessions: ISessions, sessionId: string): number;
export declare function reviewHistoryCovered(binding: SessionBinding, boundarySeq: number): boolean;
export declare function loadReviewHistory(binding: SessionBinding, boundarySeq: number): Promise<void>;
//# sourceMappingURL=review-reset.d.ts.map