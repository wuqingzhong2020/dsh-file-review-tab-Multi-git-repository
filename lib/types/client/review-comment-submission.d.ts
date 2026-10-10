import type { Context } from '@deepseek-ai/cordis';
import { type ReviewComment } from './review-comments.ts';
import { type ReviewDiscussion, type ReviewDiscussionStore } from './review-discussions.ts';
/** Follow-up opinions include each parent once, with a bounded copy of its replies. */
export declare function formatReviewSubmission(comments: readonly ReviewComment[], discussions: readonly ReviewDiscussion[]): string;
interface ReviewSubmissionOptions {
    ctx: Context;
    sessionId: string;
    comments: readonly ReviewComment[];
    discussions: readonly ReviewDiscussion[];
    discussionStore: ReviewDiscussionStore;
    discussionEnabled: boolean;
    /** Resend an existing failed/uncertain batch instead of opening a new discussion. */
    resubmitId?: string | undefined;
}
/** Shared activity permission prevents reset from overlapping admission or resend. */
export declare function submitReviewCommentBatch(options: ReviewSubmissionOptions): Promise<void>;
export {};
//# sourceMappingURL=review-comment-submission.d.ts.map