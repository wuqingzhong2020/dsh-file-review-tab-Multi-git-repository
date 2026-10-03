import type { Context } from '@deepseek-ai/cordis';
import type { NamedReviewRepository, ReviewProject, ReviewProjectPage, ReviewWorkspace } from '../repository-types.ts';
/** Own the session form, remote requests, directory picker and temporary-repository updates. */
export declare function useRepositorySettings(ctx: Context, sessionId: string): {
    page: ReviewProjectPage | null;
    draft: ReviewProject | null;
    preview: ReviewWorkspace | null;
    busy: boolean;
    dirty: boolean;
    message: string | {
        key: "projectSaved";
    };
    pendingDelete: number | null;
    pickerError: {
        index: number;
        message: string;
    } | null;
    load: () => Promise<void>;
    save: () => Promise<void>;
    edit: (patch: Partial<ReviewProject>) => void;
    chooseDirectory: (index: number) => Promise<void>;
    updateRepository: (index: number, patch: Partial<NamedReviewRepository>) => void;
    normalizeRepositoryPath: (index: number) => void;
    addRepository: () => void;
    requestRepositoryRemoval: import("react").Dispatch<import("react").SetStateAction<number | null>>;
    cancelRepositoryRemoval: () => void;
    confirmRepositoryRemoval: () => void;
};
//# sourceMappingURL=use-repository-settings.d.ts.map