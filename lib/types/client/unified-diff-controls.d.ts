import type { RefObject } from 'react';
import type { DiffChangeBlock } from './diff-navigation.ts';
import type { DiffSearchMatch, DiffSearchSide } from './diff-search.ts';
import type { DiffViewPreferences } from './diff-view-preferences.ts';
import type { UnifiedDiffLabels } from './UnifiedDiff.tsx';
import type { DiffSelectionController } from './use-diff-selection.ts';
interface DiffToolbarProps {
    readonly preferences: DiffViewPreferences;
    readonly labels: UnifiedDiffLabels;
    readonly searchButton: RefObject<HTMLButtonElement>;
    readonly searchOpen: boolean;
    readonly toggleSearch: () => void;
    readonly changes: readonly DiffChangeBlock[];
    readonly changeIndex: number;
    readonly moveChange: (direction: 1 | -1) => void;
    readonly selectChange: (index: number) => void;
    readonly path: string;
    readonly contextExpanded: boolean;
    readonly collapseContext: () => void;
    readonly showCopyButton: boolean;
    readonly copied: boolean;
    readonly copyDiff: () => void;
}
export declare function DiffToolbar({ preferences, labels, searchButton, searchOpen, toggleSearch, changes, changeIndex, moveChange, selectChange, path, contextExpanded, collapseContext, showCopyButton, copied, copyDiff, }: DiffToolbarProps): import("react").JSX.Element;
interface DiffSearchControlsProps {
    readonly input: RefObject<HTMLInputElement>;
    readonly query: string;
    readonly setQuery: (query: string) => void;
    readonly side: DiffSearchSide;
    readonly setSide: (side: DiffSearchSide) => void;
    readonly caseSensitive: boolean;
    readonly toggleCase: () => void;
    readonly wholeWord: boolean;
    readonly toggleWholeWord: () => void;
    readonly matches: readonly DiffSearchMatch[];
    readonly truncated: boolean;
    readonly matchIndex: number;
    readonly activeMatch: DiffSearchMatch | undefined;
    readonly moveMatch: (direction: 1 | -1) => void;
    readonly closeSearch: () => void;
}
export declare function DiffSearchControls({ input, query, setQuery, side, setSide, caseSensitive, toggleCase, wholeWord, toggleWholeWord, matches, truncated, matchIndex, activeMatch, moveMatch, closeSearch, }: DiffSearchControlsProps): import("react").JSX.Element;
interface DiffReferenceMenuProps {
    readonly selection: DiffSelectionController;
    readonly commentEnabled: boolean;
    readonly commentsBusy: boolean;
}
/** Display actions without owning selection or request state. */
export declare function DiffReferenceMenu({ selection, commentEnabled, commentsBusy, }: DiffReferenceMenuProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=unified-diff-controls.d.ts.map