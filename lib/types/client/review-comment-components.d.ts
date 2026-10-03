import type { ReactNode } from 'react';
import { type ReviewComment, type ReviewCommentAnchor, type ReviewCommentTarget } from './review-comments.ts';
import { ReviewCommentsContext as Comments, type CommentComposer as Composer } from './review-comment-context.ts';
import type { ReviewDiscussion } from './review-discussions.ts';
export declare function CommentEditor(): import("react").JSX.Element | null;
type CurrentCommentAnchor = (anchor: ReviewCommentAnchor, line: number) => ReviewCommentAnchor | null;
interface CommentCardProps {
    comment: ReviewComment;
    placement: Composer['placement'];
    showFile?: boolean;
    currentAnchor?: CurrentCommentAnchor | undefined;
}
export declare function CommentCard({ comment, placement, showFile, currentAnchor, }: CommentCardProps): import("react").JSX.Element | null;
/** Inline comment affordance shared by historical tool diffs and working-tree diffs. */
export declare function ReviewCommentLine({ anchor, alternateAnchor, children, }: {
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
export declare function ReviewOutdatedComments({ target, revision, currentAnchor, }: {
    target?: ReviewCommentTarget | undefined;
    revision: string;
    currentAnchor?: CurrentCommentAnchor | undefined;
}): import("react").JSX.Element | null;
/** Shared explicit actions; standalone diff viewers can still copy references without a provider. */
export declare function useReviewInteractions(): Comments | null;
export declare function DiscussionCard({ discussion, anchor, }: {
    discussion: ReviewDiscussion;
    anchor?: ReviewCommentAnchor;
}): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=review-comment-components.d.ts.map