/**
 * Turn-scoped produced-file definition and readers.
 *
 * DSH 0.2's turn-tail slot is an ordered list, and its built-in `deliverables`
 * definition owns the `deliverables` Turn key plus native Git-change cards.
 * This plugin publishes a separate `fileReviewTab` Turn key so its own review
 * entry can coexist without shadowing the host. Mutation facts come from the
 * `tool/call` arguments and tool-private `meta.diffs` on `tool/result`; the
 * hunks let the plugin show line stats and offer Host-backed undo/redo.
 *
 * Client-only and model-free: the vocabulary is the mutation tools' own call
 * arguments and result metadata, never the closing prose.
 */
import type { ConversationNodeDefinition } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { MarkdownFileMentions } from '@deepseek-ai/dsh-client-ui-primitives';
import type { TurnTailOwnerProps } from '@deepseek-ai/dsh-client-ui-chat/client';
import type { ProducedFileDiff, ProducedFileReview } from '../change-types.ts';
import { callIntent } from './mutation-call.ts';
export type { ProducedFileDiff, ProducedFileReview } from '../change-types.ts';
interface ProducedPath {
    readonly seq: number;
    readonly path: string;
    readonly diffs: readonly ProducedFileDiff[];
    /** Terminal commands deleted this path in the same Turn (display-only). */
    readonly deleted?: true;
}
/** Immutable produced-file facts published against one Turn. */
export interface DeliverablesTurnData {
    readonly produced: readonly ProducedPath[];
}
declare module '@deepseek-ai/dsh-client-ui-conversation/client' {
    interface ConversationTurnDataMap {
        /** Successful mutation paths (and their hunks) accumulated in this Turn. */
        fileReviewTab: DeliverablesTurnData;
    }
}
interface DeliverablesState extends DeliverablesTurnData {
    readonly turn: number;
    readonly calls: ReadonlyMap<string, ReturnType<typeof callIntent>>;
}
/**
 * Files and review hunks available at one closing Assistant boundary.
 * @param data - engine-published Deliverables data for one Turn.
 * @param seq - closing Assistant seq; later Tool settlements are excluded.
 * @returns Produced files in first-seen order with same-path hunks appended in settlement order.
 */
export declare function reviewsForClosing(data: Readonly<DeliverablesTurnData> | undefined, seq?: number): readonly ProducedFileReview[];
/**
 * Files produced by one Turn data value.
 *
 * A mutation is recognized by its tool call intent, not by a result view: a
 * write/edit/str_replace_editor call mutates one path, and a successful
 * terminal call's literal rm-family arguments name deleted paths. Reads
 * contribute nothing (looking at a file does not produce it); failed calls
 * contribute nothing. Paths keep first-seen order and appear once.
 * @param data - engine-published Deliverables data for one Turn.
 * @param seq - closing Assistant seq; later Tool settlements are excluded.
 * @returns Produced paths in first-seen order; empty when the turn wrote nothing.
 */
export declare function producedForClosing(data: Readonly<DeliverablesTurnData> | undefined, seq?: number): readonly string[];
/**
 * Select this list entry only when its closing turn produced files.
 * @param owner - Turn-tail owner currency for the closing assistant.
 * @returns Produced-file reviews as the component's match, or null to decline before mount.
 */
export declare function selectProducedFiles(owner: TurnTailOwnerProps): readonly ProducedFileReview[] | null;
/** Turn-local successful mutation accumulator; it publishes no view Node. */
export declare const deliverablesDefinition: ConversationNodeDefinition<DeliverablesState>;
/**
 * Trailing path segment, the part that identifies the file at a glance.
 * @param path - Slash- or backslash-separated path.
 * @returns The final segment, or the whole string when separator-free.
 */
export declare function basename(path: string): string;
/**
 * File-mention vocabulary over one turn's produced paths, for the closing
 * message's prose: an inline-code token opens the file it names. A token
 * resolves by exact path, or by being exactly the basename of exactly one
 * produced path — a basename two paths share stays inert rather than
 * guessing, so a mention link can never open the wrong file or 404.
 * @param paths - The turn's produced paths (tool order, already deduped).
 * @param openFile - The chat view's file opener.
 * @param label - Localizes the accessible open-label for a resolved path.
 * @returns The resolver MarkdownText consumes; the full path rides `title`,
 * the same disambiguator the row's chips carry.
 */
export declare function producedFileMentions(paths: readonly string[], openFile: (path: string) => void, label: (path: string) => string): MarkdownFileMentions;
//# sourceMappingURL=turn-deliverables.d.ts.map