import schema from '@deepseek-ai/schemastery';
import type { ReviewProject } from './repository-types.ts';
export interface FileReviewConfig {
    enabled?: boolean;
    projects: ReviewProject[];
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