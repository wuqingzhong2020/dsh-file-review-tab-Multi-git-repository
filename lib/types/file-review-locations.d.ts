import { type ReviewLocationRequest, type ReviewLocationResult } from './review-location.ts';
import type { ReviewWorkspace } from './repository-types.ts';
interface ReferenceFileAccess {
    workspace(): Promise<ReviewWorkspace>;
    cwd(): string;
    approvedRoots?(): Promise<string[]>;
}
interface ReferenceEditorAccess extends ReferenceFileAccess {
    locateReference(): Promise<ReviewLocationResult>;
}
export declare function locateReferenceOnDisk(request: ReviewLocationRequest, access: ReferenceFileAccess): Promise<ReviewLocationResult>;
export declare function openReferenceInEditor(request: ReviewLocationRequest, access: ReferenceEditorAccess): Promise<ReviewLocationResult>;
export {};
//# sourceMappingURL=file-review-locations.d.ts.map