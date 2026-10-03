import type { Context } from '@deepseek-ai/cordis';
import type { ReviewLocationRequest, ReviewLocationResult } from '../review-location.ts';
import type { ReviewCommentAnchor } from './review-comments.ts';
export declare function referenceRequest(anchor: ReviewCommentAnchor, editorPath?: string, fullText?: string): ReviewLocationRequest;
export declare function reviewLocation(ctx: Context, sessionId: string, request: ReviewLocationRequest, method?: 'openEditor' | 'locateReference'): Promise<ReviewLocationResult>;
export declare function openReviewFile(ctx: Context, sessionId: string, path: string): boolean;
//# sourceMappingURL=review-file-opener.d.ts.map