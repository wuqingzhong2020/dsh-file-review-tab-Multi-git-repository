import type { Context } from '@deepseek-ai/cordis';
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
type ReviewCommentsDockProps = PropsRuntime<'conversation.input.dock'> & {
    ctx: Context;
    sessionId: string;
};
export declare function ReviewCommentsDock({ ctx, sessionId, inputActions }: ReviewCommentsDockProps): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=ReviewCommentsDock.d.ts.map