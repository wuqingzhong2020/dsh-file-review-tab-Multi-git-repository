import type { Context } from '@deepseek-ai/cordis';
import type { ReviewProject, ReviewProjectSettings, SaveReviewProjects } from './repository-types.ts';
/** All writes go through the Desktop profile's native revision-fenced settings. */
export declare class RepositorySettings {
    private readonly ctx;
    private readonly initial;
    private settings;
    constructor(ctx: Context, initial?: ReviewProject[]);
    get(): ReviewProjectSettings;
    save(request: SaveReviewProjects): Promise<ReviewProjectSettings>;
    private entry;
}
//# sourceMappingURL=repository-settings.d.ts.map