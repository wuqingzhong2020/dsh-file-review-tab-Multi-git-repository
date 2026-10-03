import type { ReactNode } from 'react';
import type { Context } from '@deepseek-ai/cordis';
export { commentScopeLabel } from './review-comment-labels.ts';
export { ReviewCommentLine, ReviewFileCommentButton, ReviewFileCommentThread, ReviewOutdatedComments, useReviewInteractions, } from './review-comment-components.tsx';
interface ReviewCommentsProviderProps {
    ctx: Context;
    sessionId: string;
    children: ReactNode;
    controls?: ReactNode;
}
/** Compose draft/discussion stores with the toolbar; card rendering and request handling live separately. */
export declare function ReviewCommentsProvider({ ctx, sessionId, children, controls, }: ReviewCommentsProviderProps): import("react").JSX.Element;
//# sourceMappingURL=ReviewComments.d.ts.map