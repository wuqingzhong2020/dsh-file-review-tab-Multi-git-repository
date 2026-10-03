import type { ContextExpansion, UnifiedGap, UnifiedHunk, UnifiedLine } from './unified-diff-model.ts';
export interface DiffLocation {
    readonly id: string;
    readonly hunkIndex: number;
    readonly lineIndex: number;
    readonly line: UnifiedLine;
}
export interface DiffChangeBlock {
    readonly id: string;
    readonly first: DiffLocation;
    readonly last: DiffLocation;
}
export interface DiffIndex {
    readonly lines: readonly DiffLocation[];
    readonly byLine: ReadonlyMap<UnifiedLine, DiffLocation>;
    readonly changes: readonly DiffChangeBlock[];
}
/** Identities use the recorded hunk, never a potentially repeated line number. */
export declare function indexDiff(hunks: readonly UnifiedHunk[], contextLines: number): DiffIndex;
export declare function stepDiffIndex(current: number, direction: 1 | -1, count: number): number;
/** Search only reveals a small window around the recorded line, including inside a large gap. */
export declare function revealDiffLocation(hunks: readonly UnifiedHunk[], expansions: ReadonlyMap<string, ContextExpansion>, location: DiffLocation, context?: number): ReadonlyMap<string, ContextExpansion>;
/** Expand the interval shown beside a search window, without revealing unrelated code. */
export declare function expandDiffGapSlice(gap: UnifiedGap, previous: ContextExpansion, count: number, direction?: 'up' | 'down'): ContextExpansion;
export declare function nearestDiffChange(changes: readonly DiffChangeBlock[], location: DiffLocation): number;
//# sourceMappingURL=diff-navigation.d.ts.map