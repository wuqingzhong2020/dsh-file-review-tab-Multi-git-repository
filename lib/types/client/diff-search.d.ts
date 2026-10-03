import type { DiffLocation } from './diff-navigation.ts';
export type DiffSearchSide = 'both' | 'old' | 'new';
export interface DiffSearchOptions {
    readonly side: DiffSearchSide;
    readonly caseSensitive: boolean;
    readonly wholeWord: boolean;
}
export interface DiffSearchMatch {
    readonly id: string;
    readonly location: DiffLocation;
    readonly side: 'old' | 'new';
    readonly start: number;
    readonly end: number;
}
export declare const DIFF_SEARCH_LIMIT = 10000;
/** Literal Unicode search: regex metacharacters in user input are always escaped. */
export declare function searchDiff(lines: readonly DiffLocation[], query: string, options: DiffSearchOptions): {
    matches: readonly DiffSearchMatch[];
    truncated: boolean;
};
//# sourceMappingURL=diff-search.d.ts.map