import type { ReactNode } from 'react';
import type { ProducedFileDiff } from '../change-types.ts';
import type { DiffIndex, DiffLocation } from './diff-navigation.ts';
import type { DiffViewPreferences } from './diff-view-preferences.ts';
import type { ReviewCommentAnchor } from './review-comments.ts';
import { type UnifiedGap, type UnifiedLine, type UnifiedVisibleBlock } from './unified-diff-model.ts';
import type { UnifiedDiffLabels } from './UnifiedDiff.tsx';
interface GapControlsProps {
    readonly gap: UnifiedGap;
    readonly expandedLines: number;
    readonly expansionLines: number;
    readonly labels: UnifiedDiffLabels;
    readonly expand: (gap: UnifiedGap, direction?: 'up' | 'down') => void;
    readonly collapse: (gap: UnifiedGap) => void;
}
interface DiffBlockProps {
    readonly diff: ProducedFileDiff;
    readonly block: UnifiedVisibleBlock;
    readonly blockIndex: number;
    readonly hunkIndex: number;
    readonly hunkLines: readonly UnifiedLine[];
    readonly identity: string;
    readonly index: DiffIndex;
    readonly preferences: DiffViewPreferences;
    readonly labels: UnifiedDiffLabels;
    readonly expandedLines: number;
    readonly focused: {
        readonly location: DiffLocation;
        readonly side: 'old' | 'new';
        readonly serial: number;
    } | null;
    readonly commentAnchor: ReviewCommentAnchor | undefined;
    readonly expand: GapControlsProps['expand'];
    readonly collapse: GapControlsProps['collapse'];
    readonly renderLine: (row: UnifiedLine, key: string, lines: readonly UnifiedLine[]) => ReactNode;
    readonly renderSplitCell: (row: UnifiedLine | null, side: 'old' | 'new', key: number, lines: readonly UnifiedLine[]) => ReactNode;
}
/** Share block identity and pinned comment rows across both presentations. */
export declare function DiffBlock({ diff, block, blockIndex, hunkIndex, hunkLines, identity, index, preferences, labels, expandedLines, focused, commentAnchor, expand, collapse, renderLine, renderSplitCell, }: DiffBlockProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=unified-diff-block.d.ts.map