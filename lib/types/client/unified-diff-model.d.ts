import type { ProducedFileDiff } from '../change-types.ts';
export declare const CONTEXT_EXPANSION_LINES = 20;
export interface UnifiedDiffStats {
    readonly added: number;
    readonly removed: number;
}
export interface UnifiedLine {
    readonly kind: 'context' | 'del' | 'add';
    readonly oldNumber: number | null;
    readonly newNumber: number | null;
    readonly text: string;
}
export interface UnifiedGap {
    readonly kind: 'gap';
    readonly id: string;
    readonly position: 'leading' | 'middle' | 'trailing';
    readonly lines: readonly UnifiedLine[];
}
export type UnifiedRow = UnifiedLine | UnifiedGap;
export interface UnifiedHunk {
    readonly lines: readonly UnifiedLine[];
    readonly rows: readonly UnifiedRow[];
    readonly added: number;
    readonly removed: number;
    /** Count only: a historical tool hunk may not contain the omitted text. */
    readonly unchangedBefore: number;
}
export interface ContextExpansion {
    readonly before: number;
    readonly after: number;
}
export interface UnifiedVisibleBlock {
    readonly gap: UnifiedGap | null;
    readonly lines: readonly UnifiedLine[];
}
export interface SplitDiffRow {
    readonly old: UnifiedLine | null;
    readonly next: UnifiedLine | null;
}
/** Align each contiguous replacement, keeping absent lines blank on that side. */
export declare function splitDiffRows(lines: readonly UnifiedLine[]): SplitDiffRow[];
export declare function hunkLines(diff: ProducedFileDiff): UnifiedLine[];
export declare function buildUnifiedHunks(diffs: readonly ProducedFileDiff[], contextLines: number): UnifiedHunk[];
/** Reveal up to the configured number of lines next to the visible changes. */
export declare function expandContextGap(gap: UnifiedGap, previous?: ContextExpansion, lines?: number): ContextExpansion;
/** Reveal the whole remaining interval from the selected neighboring change. */
export declare function expandAllContextGap(gap: UnifiedGap, direction: 'up' | 'down', previous?: ContextExpansion): ContextExpansion;
/** Expansion never changes the recorded hunks, line anchors, or change totals. */
export declare function visibleHunkRows(hunk: UnifiedHunk, expansions: ReadonlyMap<string, ContextExpansion>, preserveExpandedGaps?: boolean): UnifiedRow[];
/** Each blue separator describes the actual contiguous block below it. */
export declare function unifiedVisibleBlocks(rows: readonly UnifiedRow[]): UnifiedVisibleBlock[];
export declare function unifiedHunkRange(lines: readonly UnifiedLine[], diff: ProducedFileDiff): string;
export declare function unifiedDiffText(diffs: readonly ProducedFileDiff[]): string;
export declare function summarizeDiffs(diffs: readonly ProducedFileDiff[]): UnifiedDiffStats;
//# sourceMappingURL=unified-diff-model.d.ts.map