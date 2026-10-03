/** Stateless turn summary; inspection and undo/redo remain in ProducedFiles. */
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
import type { FileReviewAction } from '../change-types.ts';
import { type ProducedFileReview } from './turn-deliverables.ts';
import type { NS } from './chat-locales.ts';
import type { UnifiedDiffStats } from './UnifiedDiff.tsx';
interface ProducedFileStats {
    readonly review: ProducedFileReview;
    readonly stats: UnifiedDiffStats;
}
interface ProducedFilesSummaryProps {
    readonly reviews: readonly ProducedFileStats[];
    readonly totalStats: UnifiedDiffStats;
    readonly allPaths: readonly string[];
    readonly hasReversibleFiles: boolean;
    readonly toggleDisabled: boolean;
    readonly togglePending: boolean;
    readonly toggleAction: FileReviewAction;
    readonly onToggle: () => void;
    readonly onReview: (paths: readonly string[]) => void;
    readonly t: PropsLocale<typeof NS>['t'];
}
export declare function ProducedFilesSummary({ reviews, totalStats, allPaths, hasReversibleFiles, toggleDisabled, togglePending, toggleAction, onToggle, onReview, t, }: ProducedFilesSummaryProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=produced-files-summary.d.ts.map