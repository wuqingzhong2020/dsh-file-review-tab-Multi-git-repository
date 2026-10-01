import type { ReviewProject } from './repository-types.ts';
export declare const PROJECT_FILE_NAME = "dsh-file-review-repositories.json";
export declare function readProjectFile(root: string): Promise<{
    project: ReviewProject;
    revision: string;
} | null>;
export declare function findProjectFile(cwd: string): Promise<{
    project: ReviewProject;
    revision: string;
} | null>;
export declare function writeProjectFile(project: ReviewProject, expectedRevision: string): Promise<string>;
//# sourceMappingURL=repository-project-file.d.ts.map