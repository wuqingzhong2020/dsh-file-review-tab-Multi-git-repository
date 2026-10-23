import { type KeyboardEvent, type MouseEvent } from 'react';
/** File-header actions stay separate from the diff's code-selection menu. */
export declare function useFilePathMenu(absolutePath: string, relativePath: string): {
    onContextMenu: (event: MouseEvent<HTMLElement>) => void;
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
    menu: import("react").JSX.Element;
};
//# sourceMappingURL=use-file-path-menu.d.ts.map