import type { ReactNode } from 'react';
import type { Context } from '@deepseek-ai/cordis';
import { ReviewCommentStore, type CommentScope, type ReviewComment, type ReviewCommentAnchor, type ReviewCommentSnapshot, type ReviewCommentTarget } from './review-comments.ts';
import { ReviewDiscussionStore, type DiscussionSnapshot } from './review-discussions.ts';
export declare function commentScopeLabel(scope: CommentScope): string;
interface Composer {
    anchor: ReviewCommentAnchor;
    id?: string | undefined;
    discussionId?: string | undefined;
    text: string;
    placement: 'inline' | 'list';
}
interface CommentsContext {
    snapshot: ReviewCommentSnapshot;
    store: ReviewCommentStore;
    composer: Composer | null;
    setComposer: (value: Composer | null) => void;
    start: (anchor: ReviewCommentAnchor, placement: Composer['placement'], comment?: ReviewComment, discussionId?: string) => void;
    discussions: DiscussionSnapshot;
    discussionStore: ReviewDiscussionStore;
    ctx: Context;
    sessionId: string;
}
export declare function ReviewCommentsProvider({ ctx, sessionId, children, controls }: {
    ctx: Context;
    sessionId: string;
    children: ReactNode;
    controls?: ReactNode;
}): import("react").JSX.Element;
/** Inline comment affordance shared by historical tool diffs and working-tree diffs. */
export declare function ReviewCommentLine({ anchor, alternateAnchor, children }: {
    anchor?: ReviewCommentAnchor | undefined;
    alternateAnchor?: ReviewCommentAnchor | undefined;
    children: (button: ReactNode) => ReactNode;
}): string | number | boolean | Iterable<ReactNode> | import("react").JSX.Element | null | undefined;
export declare function ReviewFileCommentButton({ target }: {
    target?: ReviewCommentTarget | undefined;
}): import("react").JSX.Element | null;
export declare function ReviewFileCommentThread({ target }: {
    target?: ReviewCommentTarget | undefined;
}): import("react").JSX.Element | null;
export declare function ReviewOutdatedComments({ target, revision, currentAnchor }: {
    target?: ReviewCommentTarget | undefined;
    revision: string;
    currentAnchor?: ((anchor: ReviewCommentAnchor, line: number) => ReviewCommentAnchor | null) | undefined;
}): import("react").JSX.Element | null;
/** Shared explicit actions; standalone diff viewers can still copy references without a provider. */
export declare function useReviewInteractions(): CommentsContext | null;
export {};
//# sourceMappingURL=ReviewComments.d.ts.map