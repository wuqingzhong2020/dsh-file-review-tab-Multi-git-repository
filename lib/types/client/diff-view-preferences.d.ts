export type DiffLayout = 'split' | 'unified';
export interface DiffViewPreferences {
    readonly layout: DiffLayout;
    readonly wrap: boolean;
    readonly contextExpansionLines: number;
    readonly fontSize: number;
    readonly lineHeight: number;
    readonly tabSize: number;
    readonly fontFamily: 'mono' | 'consolas' | 'cascadia' | 'jetbrains';
    readonly colors: 'theme' | 'blue-orange';
    readonly colorStrength: number;
    readonly editorPath: string;
    readonly discussionEnabled: boolean;
    readonly virtualize: boolean;
    readonly searchShortcut: 'mod+f' | 'mod+shift+f' | 'mod+alt+f';
    readonly changeShortcut: 'mod+arrow' | 'alt+arrow';
}
export declare const DEFAULT_DIFF_VIEW: DiffViewPreferences;
export declare const DIFF_VIEW_STORAGE_KEY = "dsh-file-review-tab-multi-git-repository:diff-view";
export declare function parseDiffViewPreferences(raw: string | null): DiffViewPreferences;
/** Share display preferences across open tabs without storing project data. */
export declare class DiffViewStore {
    storageError: boolean;
    private value;
    private readonly listeners;
    private readonly storage;
    constructor(storage?: Pick<Storage, 'getItem' | 'setItem'>);
    getSnapshot: () => DiffViewPreferences;
    subscribe: (listener: () => void) => (() => void);
    set(patch: Partial<DiffViewPreferences>): void;
}
//# sourceMappingURL=diff-view-preferences.d.ts.map