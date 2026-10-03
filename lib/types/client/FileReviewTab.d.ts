import type { Context } from '@deepseek-ai/cordis';
/** Tab component props (a narrowing of better-sidebar's TabComponentProps). */
export interface FileReviewTabProps {
    readonly ctx: Context;
    readonly sessionId: string;
    readonly cwd: string | undefined;
    /** Active tab + open panel; live status inspection pauses while false. */
    readonly visible: boolean;
    /**
     * Sidebar tab handle. New deep links arrive through the plugin's seed
     * channel; meta.expandPaths is still accepted for older links. Both expand
     * the requested diffs and scroll this tab's own container to the first file.
     */
    readonly tab: {
        readonly id: string;
        readonly title: string;
        readonly meta?: unknown;
    };
}
/** The sidebar tab body; all hooks remain unconditional across review scopes. */
export declare function FileReviewTab({ ctx, sessionId, cwd, visible, tab }: FileReviewTabProps): import("react").JSX.Element;
//# sourceMappingURL=FileReviewTab.d.ts.map