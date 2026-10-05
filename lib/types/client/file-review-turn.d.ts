import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type { TargetPathResolution } from 'dsh-multi-git-repo-manager/types';
import type { ReviewWorkspace } from '../repository-types.ts';
import { type TurnFileChanges } from './session-changes.ts';
import { type UnifiedDiffStats } from './UnifiedDiff.tsx';
import { type ReviewConfirmationSnapshot, type ReviewConfirmationStore } from './review-confirmations.ts';
import { type ReviewMode } from './file-review-model.ts';
import type { FileReviewActions } from './use-file-review-actions.ts';
interface FileReviewExpansion {
    readonly expanded: ReadonlySet<string>;
    readonly collapsedRepositories: ReadonlySet<string>;
    readonly setExpanded: Dispatch<SetStateAction<ReadonlySet<string>>>;
    readonly setCollapsedRepositories: Dispatch<SetStateAction<ReadonlySet<string>>>;
}
/** Controlled turn rendering; lifecycle and Host operations stay in the page hooks. */
export interface FileReviewTurnView {
    readonly sessionId: string;
    readonly cwd: string | undefined;
    readonly workspace: ReviewWorkspace | null;
    readonly ownership: ReadonlyMap<string, TargetPathResolution>;
    readonly reviewMode: ReviewMode;
    readonly expansion: FileReviewExpansion;
    readonly actions: FileReviewActions;
    readonly confirmationStore: ReviewConfirmationStore;
    readonly confirmationSnapshot: ReviewConfirmationSnapshot;
    readonly rowRefs: MutableRefObject<Map<string, HTMLLIElement>>;
    readonly turnRefs: MutableRefObject<Map<number, HTMLElement>>;
    readonly toggleExpanded: (key: string) => void;
    readonly openInEditor: (path: string) => void;
}
export declare function FileReviewStats({ stats }: {
    readonly stats: UnifiedDiffStats;
}): import("react").JSX.Element;
export declare function FileReviewChevron({ open }: {
    readonly open: boolean;
}): import("react").JSX.Element;
/** A filtered turn retains its complete original turn for confirmation identity. */
export declare function FileReviewTurn({ turn, fullTurn, view, }: {
    readonly turn: TurnFileChanges;
    readonly fullTurn: TurnFileChanges;
    readonly view: FileReviewTurnView;
}): import("react").JSX.Element;
export {};
//# sourceMappingURL=file-review-turn.d.ts.map