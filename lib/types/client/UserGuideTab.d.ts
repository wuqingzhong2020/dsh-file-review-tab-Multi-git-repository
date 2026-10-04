import type { Context } from '@deepseek-ai/cordis';
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
/** Unmount document and image previews when the owning tab hides or closes. */
export declare function UserGuideDialog({ ctx, sessionId, onClose }: {
    readonly ctx: Context;
    readonly sessionId: string;
    readonly onClose: () => void;
}): import("react").JSX.Element;
/** Restore old saved guide tabs without depending on the removed third-party bridge. */
export declare function LegacyUserGuideTab({ ctx, reviewSessionId: sessionId, useTabInfo }: PropsRuntime<'sidebar.right.pane.tab'> & {
    readonly ctx: Context;
    readonly reviewSessionId: string;
}): import("react").JSX.Element;
export declare function LegacyUserGuideTitle(): import("react").JSX.Element;
//# sourceMappingURL=UserGuideTab.d.ts.map