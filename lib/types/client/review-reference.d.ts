import type { DiffLocation } from './diff-navigation.ts';
import type { ReviewCommentAnchor, ReviewCommentTarget } from './review-comments.ts';
export interface ReviewReference extends ReviewCommentAnchor {
    readonly endLine: number;
    readonly sourceKey: string;
}
/** Select complete, contiguous original rows on one side and in one hunk/version. */
export declare function rangeReference(target: ReviewCommentTarget, locations: readonly DiffLocation[], start: DiffLocation, end: DiffLocation, side: 'old' | 'new', revision: string, sourceKey: string): ReviewReference | null;
/** Verbatim text + explicit provenance. This only copies; it never edits the composer. */
export declare function formatReviewReference(reference: ReviewReference): string;
//# sourceMappingURL=review-reference.d.ts.map