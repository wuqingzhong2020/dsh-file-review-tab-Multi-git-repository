import schema from '@deepseek-ai/schemastery';
import type { ReviewProject } from './repository-types.ts';
import type { Volatile } from '@deepseek-ai/cordis';
export interface FileReviewConfig {
    /** @deprecated Read only to migrate the previous Profile index to the manager. */
    projects: ReviewProject[] | Volatile<ReviewProject[]>;
    reviewSettings?: {
        layout: 'unified' | 'split';
        wrap: boolean;
        dock: boolean;
        adaptive: boolean;
        foldMessages: boolean;
    };
}
/** DSH's volatile schema preserves the service and recordings during live saves. */
export declare const Config: schema;
//# sourceMappingURL=repository-config.d.ts.map