import { type ReviewLocationRequest, type ReviewLocationResult } from './review-location.ts';
interface ReferenceFileAccess {
    cwd(): string;
    approvedRoots(): Promise<string[]>;
}
interface ReferenceEditorAccess extends ReferenceFileAccess {
    locateReference(): Promise<ReviewLocationResult>;
}
export declare function locateReferenceOnDisk(request: ReviewLocationRequest, access: ReferenceFileAccess): Promise<ReviewLocationResult>;
export declare function openReferenceInEditor(request: ReviewLocationRequest, access: ReferenceEditorAccess): Promise<ReviewLocationResult>;
export {};
//# sourceMappingURL=file-review-locations.d.ts.map