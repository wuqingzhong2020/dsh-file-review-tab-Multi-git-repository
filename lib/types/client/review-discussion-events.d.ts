import type { ReviewDiscussion } from './review-discussions.ts';
/** Reconcile durable request -> user event -> turn -> assistant messages, never the latest unrelated reply. */
export declare function reconcileDiscussions(records: readonly ReviewDiscussion[], entries: readonly unknown[]): readonly ReviewDiscussion[];
//# sourceMappingURL=review-discussion-events.d.ts.map