/** Immutable, explicitly namespaced transport shared by both submission entries. */
import { type ReviewComment } from './review-comments.ts';
export declare const REVIEW_PACKET_PACKAGE = "dsh-file-review-tab-multi-git-repository";
export declare const REVIEW_PACKET_LIMIT: number;
export interface ReviewCommentPacket {
    readonly package: typeof REVIEW_PACKET_PACKAGE;
    readonly version: 1;
    readonly sessionId: string;
    readonly batchId: string;
    readonly comments: readonly ReviewComment[];
    readonly context: string;
}
export interface ParsedReviewPacket {
    packet: ReviewCommentPacket;
    visibleText: string;
    original: string;
}
export declare function serializeReviewPacket(packet: ReviewCommentPacket): string;
/** A full, known envelope at the beginning; examples and legacy text remain ordinary messages. */
export declare function parseReviewPacket(text: string): ParsedReviewPacket | null;
//# sourceMappingURL=review-comment-packet.d.ts.map