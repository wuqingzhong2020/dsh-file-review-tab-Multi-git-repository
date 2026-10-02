import type { ProducedFileDiff } from '../change-types.ts';
export type CommentScope = 'last-turn' | 'session' | 'pending' | 'uncommitted' | 'unstaged';
export interface ReviewCommentTarget {
    readonly scope: CommentScope;
    readonly turn?: number | undefined;
    readonly repository: string;
    readonly repositoryName: string;
    readonly path: string;
    readonly absolutePath: string;
}
export interface ReviewCommentLine {
    readonly kind: 'context' | 'add' | 'del';
    readonly oldNumber: number | null;
    readonly newNumber: number | null;
    readonly text: string;
}
export interface ReviewCommentAnchor extends ReviewCommentTarget {
    readonly side: 'old' | 'new' | 'file';
    readonly line: number | null;
    readonly quote: string;
    readonly before: string;
    readonly after: string;
    readonly revision: string;
}
export interface ReviewComment {
    readonly id: string;
    readonly anchor: ReviewCommentAnchor;
    readonly text: string;
}
export declare const COMMENT_TEXT_LIMIT = 6000;
/** Session review scopes address the same recorded turn, regardless of the filter. */
export declare function commentFileKey(target: ReviewCommentTarget): string;
export declare function commentAnchorKey(anchor: ReviewCommentAnchor): string;
/** A deterministic snapshot tag: comments never silently move to another diff revision. */
export declare function reviewDiffRevision(diffs: readonly ProducedFileDiff[]): string;
export declare function fileCommentAnchor(target: ReviewCommentTarget): ReviewCommentAnchor;
export declare function lineCommentAnchor(target: ReviewCommentTarget, row: ReviewCommentLine, lines: readonly ReviewCommentLine[], revision: string): ReviewCommentAnchor;
export declare function parseReviewComments(raw: string): readonly ReviewComment[];
export interface CommentMessageLabels {
    readonly introduction: string;
    readonly repository: string;
    readonly file: string;
    readonly source: string;
    readonly reference: string;
    readonly opinion: string;
    readonly scope: (scope: CommentScope) => string;
    readonly turn: (turn: number) => string;
    readonly position: (anchor: ReviewCommentAnchor) => string;
}
export declare function formatReviewComments(comments: readonly ReviewComment[], labels: CommentMessageLabels): string;
interface CommentStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}
export interface ReviewCommentSnapshot {
    readonly comments: readonly ReviewComment[];
    readonly busy: boolean;
    readonly storageError: boolean;
}
/** Per-session draft store. Submission clears only the batch accepted by the host. */
export declare class ReviewCommentStore {
    private snapshot;
    private readonly listeners;
    private readonly storage;
    private readonly key;
    constructor(storage?: CommentStorage, key?: string);
    getSnapshot: () => ReviewCommentSnapshot;
    subscribe: (listener: () => void) => (() => void);
    private publish;
    save(anchor: ReviewCommentAnchor, text: string, id?: string): void;
    remove(id: string): void;
    submit(send: (comments: readonly ReviewComment[]) => Promise<void>): Promise<boolean>;
}
export {};
//# sourceMappingURL=review-comments.d.ts.map