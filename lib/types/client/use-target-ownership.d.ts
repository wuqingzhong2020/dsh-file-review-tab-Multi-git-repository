import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client';
import type { ManagedWorkspace, TargetPathResolution } from 'dsh-multi-git-repo-manager/types';
import { type TurnFileChanges } from './session-changes.ts';
/** Epoch fenced Host ownership. No directory inference from browser labels grants access. */
export declare function useTargetOwnership(sessions: ISessions, sessionId: string, cwd: string | undefined, visible: boolean, workspace: ManagedWorkspace | null, turns: readonly TurnFileChanges[]): {
    owners: ReadonlyMap<string, TargetPathResolution>;
    ready: boolean;
};
//# sourceMappingURL=use-target-ownership.d.ts.map