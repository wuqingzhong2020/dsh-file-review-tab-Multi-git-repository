import type { ReviewProject, ReviewWorkspace } from './repository-types.ts';
export declare function inside(root: string, candidate: string): boolean;
export declare function pathKey(path: string): string;
/** ConfigParser-style INI, Git's .gitmodules, or JSON repository lists. */
export declare function parseRepositoryManifest(text: string, filename: string): {
    name: string;
    path: string;
}[];
export declare function previewProject(project: ReviewProject): Promise<ReviewWorkspace>;
/** Most-specific project wins; a repo-root session also belongs to its aggregate. */
export declare function resolveReviewWorkspace(cwd: string, projects: ReviewProject[]): Promise<ReviewWorkspace>;
//# sourceMappingURL=repository-workspace.d.ts.map