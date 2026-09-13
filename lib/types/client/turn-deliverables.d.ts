/**
 * Turn-scoped produced-file definition and readers.
 *
 * dsh 0.1.5 moved the Chat turn-tail slot and its owner currency into
 * `@deepseek-ai/dsh-client-ui-chat`, and the Conversation Definition contract
 * no longer hands each match a pre-rendered wire view. The mutation facts are
 * therefore derived the same way dsh 0.1.5's own ui-deliverables does it: from
 * the `tool/call` arguments, plus the tool-private `meta.diffs` attached to a
 * `tool/result` (dsh-tool-fs publishes the result-time contextual diff there).
 * The Definition still publishes a richer `deliverables` Turn value than the
 * built-in row — the hunks ride along so the turn-tail card can show +M −K and
 * offer undo/redo through this plugin's Host service.
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
        deliverables: DeliverablesTurnData;
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
 * Claim the turn-tail chain only when its closing turn produced files.
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