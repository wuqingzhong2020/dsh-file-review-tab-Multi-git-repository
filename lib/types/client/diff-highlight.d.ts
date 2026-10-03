import type { ProducedFileDiff } from '../change-types.ts';
import type { UnifiedHunk, UnifiedLine } from './unified-diff-model.ts';
export type DiffLanguage = 'cpp' | 'javascript' | 'typescript' | 'python' | 'json' | 'markdown' | 'text';
export type SyntaxKind = 'keyword' | 'string' | 'comment' | 'number' | 'property' | 'heading';
export interface SyntaxToken {
    readonly start: number;
    readonly end: number;
    readonly kind: SyntaxKind;
}
export interface SyntaxState {
    blockComment?: boolean;
    quote?: string;
    /** Closing delimiter for a C++ raw string or Python triple-quoted string. */
    rawClose?: string;
    /** Markdown fences are highlighted as source, without rendering their contents. */
    fence?: string;
}
export declare const HIGHLIGHT_CHARACTER_LIMIT = 500000;
export declare const HIGHLIGHT_LINE_LIMIT = 16000;
export declare function diffLanguage(path: string): DiffLanguage;
/** Bounded, linear basic lexer. Tokens only describe ranges; recorded text is never rewritten. */
export declare function highlightLine(text: string, language: DiffLanguage, state: SyntaxState): readonly SyntaxToken[];
/** Independent old/new lexical states handle edits that change multiline comment boundaries. */
export declare function highlightDiff(diffs: readonly ProducedFileDiff[], hunks: readonly UnifiedHunk[]): ReadonlyMap<UnifiedLine, {
    old: readonly SyntaxToken[];
    next: readonly SyntaxToken[];
}>;
//# sourceMappingURL=diff-highlight.d.ts.map