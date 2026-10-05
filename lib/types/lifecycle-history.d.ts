/** Replay and index Host-owned lifecycle facts independently of filesystem operations. */
import type { FileReviewChange, RecordedMutation } from './change-types.ts';
import { type LifecycleRecord } from './lifecycle-record.ts';
interface SessionEvent {
    type: string;
    data: unknown;
}
/** Bounded observation cache; durable session events remain the replay authority. */
export declare class LifecycleRecordCache {
    private readonly entries;
    private bytes;
    add(record: LifecycleRecord): void;
    records(): IterableIterator<LifecycleRecord>;
}
/** One immutable lookup snapshot shared by every file in a status/apply request. */
export declare class LifecycleHistory {
    readonly records: readonly LifecycleRecord[];
    readonly truncated: boolean;
    private readonly index;
    constructor(records: readonly LifecycleRecord[], truncated: boolean);
    /** null selects the legacy path; an empty sequence rejects untrusted/mixed records. */
    sequence(file: FileReviewChange): LifecycleRecord[] | null;
}
export declare function replayLifecycleHistory(sessionId: string, events: Iterable<SessionEvent>, cached?: Iterable<LifecycleRecord>): LifecycleHistory;
export declare function lifecycleMutation(record: LifecycleRecord): RecordedMutation;
export {};
//# sourceMappingURL=lifecycle-history.d.ts.map