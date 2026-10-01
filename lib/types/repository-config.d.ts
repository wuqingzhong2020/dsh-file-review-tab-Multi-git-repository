import schema from '@deepseek-ai/schemastery';
import type { ReviewProject } from './repository-types.ts';
export interface FileReviewConfig {
    enabled?: boolean;
    projects: ReviewProject[];
}
/** DSH's volatile schema preserves the service and recordings during live saves. */
export declare const Config: schema;
//# sourceMappingURL=repository-config.d.ts.map