import type { Context } from '@deepseek-ai/cordis';
import { ReviewCommentStore, type ReviewComment, type ReviewCommentAnchor, type ReviewCommentSnapshot } from './review-comments.ts';
import { ReviewDiscussionStore, type DiscussionSnapshot } from './review-discussions.ts';
export interface CommentComposer {
    anchor: ReviewCommentAnchor;
    id?: string | undefined;
    discussionId?: string | undefined;
    text: string;
    placement: 'inline' | 'list';
}
export interface ReviewCommentsContext {
    snapshot: ReviewCommentSnapshot;
    store: ReviewCommentStore;
    composer: CommentComposer | null;
    setComposer: (value: CommentComposer | null) => void;
    start: (anchor: ReviewCommentAnchor, placement: CommentComposer['placement'], comment?: ReviewComment, discussionId?: string) => void;
    discussions: DiscussionSnapshot;
    discussionStore: ReviewDiscussionStore;
    ctx: Context;
    sessionId: string;
}
export declare const ReviewCommentsContext: import("react").Context<ReviewCommentsContext | null>;
export declare function commentStoreFor(sessionId: string): ReviewCommentStore;
export declare function discussionStoreFor(sessionId: string): ReviewDiscussionStore;
//# sourceMappingURL=review-comment-context.d.ts.map