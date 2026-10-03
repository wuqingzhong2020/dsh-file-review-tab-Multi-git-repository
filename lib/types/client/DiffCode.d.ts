import type { SyntaxToken } from './diff-highlight.ts';
import type { DiffSearchMatch } from './diff-search.ts';
interface DiffCodeProps {
    readonly text: string;
    readonly tokens?: readonly SyntaxToken[] | undefined;
    readonly matches?: readonly DiffSearchMatch[] | undefined;
    readonly active?: string | undefined;
}
/** React text nodes retain exact whitespace and escape HTML; search marks wrap syntax spans. */
export declare function DiffCode({ text, tokens, matches, active }: DiffCodeProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=DiffCode.d.ts.map