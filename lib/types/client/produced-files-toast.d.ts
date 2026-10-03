import type { DeliverablesKey } from './chat-locales.ts';
export interface NoticeFile {
    readonly path: string;
}
export interface ToggleNotice {
    readonly seq: number;
    readonly tone: 'success' | 'error';
    readonly title: DeliverablesKey;
    readonly description?: string | undefined;
    readonly descriptionKey?: DeliverablesKey | undefined;
    readonly files: readonly NoticeFile[];
}
export declare function ResultToast({ notice, closeLabel, dismissLabel, fileListLabel, fileOpenLabel, openFile, onDone, }: {
    readonly notice: Omit<ToggleNotice, 'title'> & {
        readonly title: string;
    };
    readonly closeLabel: string;
    readonly dismissLabel: string;
    readonly fileListLabel: string;
    readonly fileOpenLabel: (path: string) => string;
    readonly openFile: (path: string) => void;
    readonly onDone: () => void;
}): import("react").JSX.Element;
//# sourceMappingURL=produced-files-toast.d.ts.map