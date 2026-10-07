/** One selection contract is shared by session filtering, Git comparison and deep links. */
import type { ManagedTarget, TargetPathResolution } from 'dsh-multi-git-repo-manager/types';
export type TargetSelection = {
    kind: 'all-git';
} | {
    kind: 'git';
    path: string;
} | {
    kind: 'all-directories';
} | {
    kind: 'directory';
    path: string;
} | {
    kind: 'project';
    root: string;
} | {
    kind: 'unmanaged';
};
export declare const ALL_DIRECTORIES = "@directories";
/** Every target and undisclosed boundary inside one project directory. */
export declare const PROJECT_DIRECTORY = "@project";
export declare function defaultTargetFilter(targets: readonly ManagedTarget[] | undefined): string;
export declare function targetSelection(value: string, targets: readonly ManagedTarget[], projectRoot?: string): TargetSelection;
export declare function selectionIncludes(selection: TargetSelection, owner: TargetPathResolution | undefined): boolean;
export declare function isDirectorySelection(selection: TargetSelection): boolean;
/** Git comparisons accept one concrete repository; aggregate selections mean every repository. */
export declare function gitRepositoryFilter(value: string): string;
//# sourceMappingURL=review-target-selection.d.ts.map