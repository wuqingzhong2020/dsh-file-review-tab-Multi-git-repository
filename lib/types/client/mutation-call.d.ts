/**
 * Shared file-mutation facts for dsh 0.1.5.
 *
 * The Conversation Definition contract no longer hands matches a pre-rendered
 * wire view, so both the chat turn-tail row and the sidebar tab derive a
 * mutation from the same two sources the dsh 0.1.5 tooling uses:
 *
 * - `tool/call` arguments identify the mutated path and the intended hunks
 *   (`write` / `edit` / `str_replace_editor`), or the terminal command whose
 *   literal rm-family arguments name deleted paths (`bash` / `pwsh`);
 * - `tool/result` `meta.diffs` carries the applied contextual hunks that
 *   dsh-tool-fs attaches on settlement (no line numbers in 0.1.5).
 *
 * Unknown tools and malformed arguments yield null, keeping the vocabulary
 * conservative: a call only produces review data when its shape is known.
 */
import type { ProducedFileDiff } from '../change-types.ts';
/** One mutation call's parsed intent, captured at `tool/call` time. */
export interface CallIntent {
    /** The single path the call mutates; null for a deletion-only terminal call. */
    readonly path: string | null;
    /** Call-argument-derived hunks, used when the result carries no meta diff. */
    readonly diffs: readonly ProducedFileDiff[];
    /** Literal paths a terminal call deletes. */
    readonly deletions: readonly string[];
}
/**
 * The call-argument-derived mutation intent for one write/edit/str_replace_editor
 * or terminal call. Unknown tools and malformed arguments return null.
 */
export declare function callIntent(name: string, argsRaw: unknown): CallIntent | null;
/** Validate the tool-private result metadata's contextual diff hunks. */
export declare function appliedDiffs(meta: unknown): readonly ProducedFileDiff[] | null;
//# sourceMappingURL=mutation-call.d.ts.map