import schema from '@deepseek-ai/schemastery';
export interface FileReviewConfig {
    reviewSettings?: {
        layout: 'unified' | 'split';
        wrap: boolean;
        dock: boolean;
        adaptive: boolean;
        foldMessages: boolean;
    };
}
/** Review preferences belong here; project declarations belong to the manager. */
export declare const Config: schema;
//# sourceMappingURL=repository-config.d.ts.map