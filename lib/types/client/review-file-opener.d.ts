import type { Context } from '@deepseek-ai/cordis';
import type { ReviewLocationRequest, ReviewLocationResult } from '../review-location.ts';
import type { ReviewCommentAnchor } from './review-comments.ts';
type LocationMethod = 'openEditor' | 'locateReference';
export declare function referenceRequest(anchor: ReviewCommentAnchor, editorPath?: string, fullText?: string): ReviewLocationRequest;
export declare function reviewLocation(ctx: Context, sessionId: string, request: ReviewLocationRequest, method?: LocationMethod): Promise<ReviewLocationResult>;
export {};
//# sourceMappingURL=review-file-opener.d.ts.map