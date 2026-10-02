import type { ProducedFileDiff as DiffHunk } from '../change-types.ts';
import { type ReviewCommentTarget } from './review-comments.ts';
export { summarizeDiffs, unifiedDiffText } from './unified-diff-model.ts';
export type { UnifiedDiffStats } from './unified-diff-model.ts';
export interface UnifiedDiffLabels {
    readonly copy: string;
    readonly copied: string;
    readonly expandContext: (count: number, remaining: number) => string;
    readonly collapseContext: string;
    readonly unavailableContext: (count: number) => string;
}
interface UnifiedDiffProps {
    readonly diffs: readonly DiffHunk[];
    readonly contextLines: number;
    readonly labels: UnifiedDiffLabels;
    readonly className?: string | undefined;
    readonly showCopyButton?: boolean | undefined;
    readonly showFileHeaders?: boolean | undefined;
    readonly reviewTarget?: ReviewCommentTarget | undefined;
}
/** Two presentations share the original rows, context expansion, and anchors. */
export declare function UnifiedDiff({ diffs, contextLines, labels, className, showCopyButton, showFileHeaders, reviewTarget }: UnifiedDiffProps): import("react").JSX.Element | null;
//# sourceMappingURL=UnifiedDiff.d.ts.map