import type { DiffLocation } from './diff-navigation.ts';
export interface DiffReferenceSelection {
    readonly identity: string;
    readonly start: DiffLocation;
    readonly end: DiffLocation;
    readonly side: 'old' | 'new';
}
/** Right-clicking inside a range preserves it; other rows start a single-line reference. */
export declare function contextSelection(current: DiffReferenceSelection | null, identity: string, location: DiffLocation, side: 'old' | 'new'): DiffReferenceSelection;
//# sourceMappingURL=review-context-selection.d.ts.map