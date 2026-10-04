/**
 * Chat → sidebar deep-link channel.
 *
 * The chat turn-tail row knows which paths (and which turn) the user wants to
 * inspect; the native right sidebar creates its own tab instance ids.
 * A package-local channel delivers repeated selections without coupling to
 * those native tab ids or storing transient selection in persisted tab state.
 *
 * The channel therefore carries the seed inside this plugin: the chat row
 * publishes it and then opens the tab by type; the tab body subscribes and
 * replays whatever arrived, whether it mounted just now or was already open.
 * Sessions are keyed separately, and each publish gets a monotonic nonce so a
 * replay can never be mistaken for a fresh link.
 */
/** One chat-issued review target inside a session. */
export interface FileReviewSeed {
    readonly paths: readonly string[];
    /** Turn anchor: expand only this turn's rows for the given paths. */
    readonly turn?: number;
    /** Monotonic publish id; a new value means a new link to replay. */
    readonly nonce: number;
}
type Listener = (sessionId: string, seed: FileReviewSeed) => void;
/** Publish a deep link for one session and return the stored seed. */
export declare function publishFileReviewSeed(sessionId: string, paths: readonly string[], turn?: number): FileReviewSeed;
/** The most recent seed for a session, if the tab has not consumed it yet. */
export declare function currentFileReviewSeed(sessionId: string): FileReviewSeed | undefined;
/** Only the request that actually completed may remove the session's latest target. */
export declare function discardFileReviewSeed(sessionId: string, consumedNonce?: number): void;
export declare function clearFileReviewSeeds(): void;
/** Observe every publish; the caller filters by session. */
export declare function subscribeFileReviewSeed(listener: Listener): () => void;
export {};
//# sourceMappingURL=deep-link.d.ts.map