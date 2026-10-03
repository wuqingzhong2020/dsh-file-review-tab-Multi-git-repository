import type { Context } from '@deepseek-ai/cordis';
import type { ReviewLocale } from './locales.ts';
import type { UserGuideDocument } from '../user-guide.ts';
/** Ask the Host for its installed manual; browser URLs and the active cwd are unrelated. */
export declare function openUserGuide(ctx: Context, sessionId: string): Promise<void>;
export declare function loadUserGuide(ctx: Context, sessionId: string, language: ReviewLocale): Promise<UserGuideDocument>;
/** The host renderer only receives explicitly shipped images; no URL depends on the GUI origin. */
export declare function guideImageResolver(document: UserGuideDocument): (destination: string) => string | undefined;
//# sourceMappingURL=user-guide.d.ts.map