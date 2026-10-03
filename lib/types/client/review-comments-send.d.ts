import type { Context } from '@deepseek-ai/cordis';
/** Use the session-addressed host send, preserving the composer's existing draft. */
export declare function sendReviewComments(ctx: Context, sessionId: string, text: string, onPrepared?: (requestId: string) => void): Promise<void>;
export declare class ReviewSendFailure extends Error {
    readonly code: string;
    get uncertain(): boolean;
    constructor(code: string);
}
//# sourceMappingURL=review-comments-send.d.ts.map