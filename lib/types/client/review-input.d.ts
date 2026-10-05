/** Official reference codec + session admission tracking, with no draft replacement. */
import type { Context } from '@deepseek-ai/cordis';
import type { InputTriggerSource } from '@deepseek-ai/dsh-client-ui-input-trigger/client';
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client';
import type { InputActions } from '@deepseek-ai/dsh-client-ui-conversation/client';
export declare const REVIEW_INPUT_SOURCE = "dsh-file-review-tab-multi-git-repository:comments";
export declare function reviewInputSource(): InputTriggerSource;
/** Prepend a frozen batch, then restore the caret after accounting for the new chip. */
export declare function attachReviewInput(ctx: Context, sessions: ISessions, sessionId: string, actions: InputActions, discussionEnabled?: boolean): boolean;
/** Observe real request identities from the official pending submissions and durable events. */
export declare function bindReviewInputAdmission(sessions: ISessions, sessionId: string): () => void;
export declare function clearReviewInput(ctx: Context, sessions: ISessions, sessionId: string, actions: InputActions): void;
export declare function disposeReviewInput(): void;
/** Track in-flight batches even after the user leaves their chat or hides the Dock. */
export declare function registerReviewInputTracking(sessions: ISessions): () => void;
//# sourceMappingURL=review-input.d.ts.map