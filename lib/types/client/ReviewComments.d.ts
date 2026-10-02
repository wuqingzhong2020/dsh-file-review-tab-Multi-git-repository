import type { ReactNode } from 'react';
import type { Context } from '@deepseek-ai/cordis';
import { type CommentScope, type ReviewCommentAnchor, type ReviewCommentTarget } from './review-comments.ts';
export declare function commentScopeLabel(scope: CommentScope): string;
export declare function ReviewCommentsProvider({ ctx, sessionId, children }: {
    ctx: Context;
    sessionId: string;
    children: ReactNode;
}): import("react").JSX.Element;
/** Inline comment affordance shared by historical tool diffs and working-tree diffs. */
export declare function ReviewCommentLine({ anchor, children }: {
    anchor?: ReviewCommentAnchor | undefined;
    children: (button: ReactNode) => ReactNode;
}): string | number | boolean | Iterable<ReactNode> | import("react").JSX.Element | null | undefined;
export declare function ReviewFileCommentButton({ target }: {
    target?: ReviewCommentTarget | undefined;
}): import("react").JSX.Element | null;
export declare function ReviewFileCommentThread({ target }: {
    target?: ReviewCommentTarget | undefined;
}): import("react").JSX.Element | null;
export declare function ReviewOutdatedComments({ target, revision }: {
    target?: ReviewCommentTarget | undefined;
    revision: string;
}): import("react").JSX.Element | null;
//# sourceMappingURL=ReviewComments.d.ts.map