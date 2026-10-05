import type { Context } from '@deepseek-ai/cordis';
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client';
import type { ConversationSnapshot } from '@deepseek-ai/dsh-client-ui-conversation/client';
/** Read the conversation and merge Host-only nested Code Mode mutations. */
export declare function useFileReviewConversation(ctx: Context, sessions: ISessions, sessionId: string, visible: boolean, tick: number): {
    snapshot: ConversationSnapshot | null;
    turns: readonly import("./session-changes.ts").TurnFileChanges[];
    recordedWarnings: readonly string[];
    ready: boolean;
};
//# sourceMappingURL=use-file-review-conversation.d.ts.map