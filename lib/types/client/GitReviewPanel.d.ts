import type { Context } from '@deepseek-ai/cordis';
import type { GitReviewMode } from '../git-review-types.ts';
interface GitReviewPanelProps {
    readonly ctx: Context;
    readonly sessionId: string;
    readonly mode: GitReviewMode;
    readonly visible: boolean;
    readonly tick: number;
}
/** Own the comparison epoch and loading queue; individual files only render their state. */
export declare function GitReviewPanel({ ctx, sessionId, mode, visible, tick }: GitReviewPanelProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=GitReviewPanel.d.ts.map