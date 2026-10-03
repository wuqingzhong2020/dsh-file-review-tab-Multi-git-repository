import type { NamedReviewRepository, ReviewWorkspace } from '../repository-types.ts';
interface RepositoryListEditorProps {
    projectRoot: string;
    entries: NamedReviewRepository[];
    pickerError: {
        index: number;
        message: string;
    } | null;
    onUpdate(index: number, patch: Partial<NamedReviewRepository>): void;
    onNormalizePath(index: number): void;
    onChooseDirectory(index: number): Promise<void>;
    onRemove(index: number): void;
}
export declare function RepositoryListEditor({ projectRoot, entries, pickerError, onUpdate, onNormalizePath, onChooseDirectory, onRemove, }: RepositoryListEditorProps): import("react").JSX.Element;
export declare function RepositoryPreview({ workspace }: {
    workspace: ReviewWorkspace;
}): import("react").JSX.Element;
export declare function RepositoryDeleteDialog({ name, onCancel, onConfirm, }: {
    name: string;
    onCancel(): void;
    onConfirm(): void;
}): import("react").JSX.Element;
export {};
//# sourceMappingURL=repository-settings-components.d.ts.map