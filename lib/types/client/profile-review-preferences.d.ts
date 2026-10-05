/** Profile owns portable display choices; local-only appearance fields never cross the wire. */
import type { Context } from '@deepseek-ai/cordis';
import { type DiffViewPreferences, type DiffViewStore } from './diff-view-preferences.ts';
export declare const PROFILE_FIELDS: readonly ["layout", "wrap", "dock", "adaptive", "foldMessages"];
export type ProfileReviewPreferences = Pick<DiffViewPreferences, typeof PROFILE_FIELDS[number]>;
export declare function portablePreferences(value: DiffViewPreferences): ProfileReviewPreferences;
export declare function saveReviewPreferences(store: DiffViewStore, patch: Partial<DiffViewPreferences>): Promise<boolean>;
export declare function bindProfileReviewPreferences(ctx: Context, store: DiffViewStore): () => void;
//# sourceMappingURL=profile-review-preferences.d.ts.map