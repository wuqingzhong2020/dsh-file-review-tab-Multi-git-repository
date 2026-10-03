import type { SyntaxToken } from './diff-highlight.ts';
import type { DiffSearchMatch } from './diff-search.ts';
/** React text nodes retain exact whitespace and escape HTML; search marks wrap syntax spans. */
export declare function DiffCode({ text, tokens, matches, active }: {
    readonly text: string;
    readonly tokens?: readonly SyntaxToken[] | undefined;
    readonly matches?: readonly DiffSearchMatch[] | undefined;
    readonly active?: string | undefined;
}): import("react").JSX.Element;
//# sourceMappingURL=DiffCode.d.ts.map