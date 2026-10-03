/** Shared read-only line contract. A displayed historical coordinate is never a disk coordinate by default. */
export interface ReviewLocationRequest {
    readonly repository: string;
    readonly path: string;
    readonly source: string;
    readonly side: 'old' | 'new';
    readonly line: number;
    readonly endLine: number;
    readonly quote: string;
    readonly before: string;
    readonly after: string;
    readonly fullText?: string | undefined;
    readonly allowRelocate?: boolean | undefined;
    readonly editorPath?: string | undefined;
}
export interface ReviewLocationResult {
    readonly state: 'exact' | 'moved' | 'ambiguous' | 'changed' | 'missing' | 'unsupported' | 'started' | 'editor-missing' | 'error';
    readonly line?: number | undefined;
    readonly endLine?: number | undefined;
    readonly reason?: string | undefined;
}
export declare const REFERENCE_TEXT_LIMIT = 65536;
export declare const referenceTextFits: (text: string) => boolean;
export declare const normalizeReferenceText: (text: string) => string;
/** Exact full-version validation, otherwise require a unique complete quote + adjacent context. */
export declare function locateReviewReference(text: string, request: ReviewLocationRequest): ReviewLocationResult;
//# sourceMappingURL=review-location.d.ts.map