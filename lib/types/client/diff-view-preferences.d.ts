export type DiffLayout = 'split' | 'unified';
export interface DiffViewPreferences {
    readonly layout: DiffLayout;
    readonly wrap: boolean;
}
export declare const DEFAULT_DIFF_VIEW: DiffViewPreferences;
export declare const DIFF_VIEW_STORAGE_KEY = "dsh-file-review-tab-multi-git-repository:diff-view";
export declare function parseDiffViewPreferences(raw: string | null): DiffViewPreferences;
/** Share display preferences across open tabs without storing project data. */
export declare class DiffViewStore {
    private value;
    private readonly listeners;
    private readonly storage;
    constructor(storage?: Pick<Storage, 'getItem' | 'setItem'>);
    getSnapshot: () => DiffViewPreferences;
    subscribe: (listener: () => void) => (() => void);
    set(patch: Partial<DiffViewPreferences>): void;
}
//# sourceMappingURL=diff-view-preferences.d.ts.map