import type { Context } from '@deepseek-ai/cordis';
import type { ReviewCommentStore } from './review-comments.ts';
import { type DiscussionSnapshot, type ReviewDiscussionStore } from './review-discussions.ts';
/** Reattach when the host replaces a session binding, including after reconnect. */
export declare function useReviewDiscussionEvents(ctx: Context, sessionId: string, store: ReviewDiscussionStore): void;
/** Preserve newly edited drafts while removing the exact opinions accepted by the host. */
export declare function useAdmittedReviewComments(discussions: DiscussionSnapshot, store: ReviewCommentStore): void;
//# sourceMappingURL=use-review-discussion-events.d.ts.map