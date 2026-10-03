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
}
/** Persist request identity before sending so late admission can acknowledge the right drafts. */
export declare function submitReviewCommentBatch({ ctx, sessionId, comments, discussions, discussionStore, discussionEnabled, }: ReviewSubmissionOptions): Promise<void>;
export {};
//# sourceMappingURL=review-comment-submission.d.ts.map