import type { Context } from '@deepseek-ai/cordis';
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
interface ReviewScope {
    readonly ctx: Context;
    readonly reviewSessionId: SessionId;
    readonly sessions: ISessions;
}
type BodyProps = PropsRuntime<'sidebar.right.pane.tab'> & ReviewScope;
type TitleProps = PropsRuntime<'sidebar.right.pane.tab.title'> & ReviewScope;
export declare function FileReviewIcon({ size }: {
    readonly size?: number | undefined;
}): import("react").JSX.Element;
/** Translate native session/tab information once, outside the review business components. */
export declare function NativeReviewTab({ ctx, reviewSessionId: sessionId, sessions: controller, useTabInfo }: BodyProps): import("react").JSX.Element;
/** Titles stay subscribed while the body is hidden; no stored-title mutation is needed. */
export declare function NativeReviewTitle({ ctx, reviewSessionId: sessionId, sessions }: TitleProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=NativeReviewTab.d.ts.map