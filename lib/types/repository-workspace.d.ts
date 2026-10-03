import type { ReviewProject, ReviewWorkspace } from './repository-types.ts';
export { inside } from './repository-path-policy.ts';
export { parseRepositoryManifest } from './repository-manifest.ts';
export declare function pathKey(path: string): string;
export declare function previewProject(project: ReviewProject): Promise<ReviewWorkspace>;
/** Most-specific project wins; a repo-root session also belongs to its aggregate. */
export declare function resolveReviewWorkspace(cwd: string, projects: ReviewProject[]): Promise<ReviewWorkspace>;
//# sourceMappingURL=repository-workspace.d.ts.map