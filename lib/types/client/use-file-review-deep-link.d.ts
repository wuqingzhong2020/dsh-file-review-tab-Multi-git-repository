import type { Dispatch, SetStateAction } from 'react';
import { type TurnFileChanges } from './session-changes.ts';
import { type ReviewMode } from './file-review-model.ts';
interface DeepLinkOptions {
    readonly sessionId: string;
    readonly turns: readonly TurnFileChanges[];
    readonly visible: boolean;
    readonly ready: boolean;
    readonly meta: unknown;
    readonly expanded: ReadonlySet<string>;
    readonly flatKey: string;
    readonly setReviewMode: Dispatch<SetStateAction<ReviewMode>>;
    readonly setRepositoryFilter: Dispatch<SetStateAction<string>>;
    readonly setArchiveOpen: Dispatch<SetStateAction<boolean>>;
    readonly setArchivePages: Dispatch<SetStateAction<number>>;
    readonly setExpanded: Dispatch<SetStateAction<ReadonlySet<string>>>;
    readonly setCollapsedRepositories: Dispatch<SetStateAction<ReadonlySet<string>>>;
    readonly onMissing: () => void;
}
/** Replay chat links without replacing the user's expansion or scrolling the sidebar shell. */
export declare function useFileReviewDeepLink({ sessionId, turns, visible, ready, meta, expanded, flatKey, setReviewMode, setRepositoryFilter, setArchiveOpen, setArchivePages, setExpanded, setCollapsedRepositories, onMissing, }: DeepLinkOptions): {
    rowRefs: import("react").MutableRefObject<Map<string, HTMLLIElement>>;
    turnRefs: import("react").MutableRefObject<Map<number, HTMLElement>>;
    bodyRef: import("react").MutableRefObject<HTMLDivElement | null>;
};
export {};
//# sourceMappingURL=use-file-review-deep-link.d.ts.map