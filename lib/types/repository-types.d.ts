/** Serializable project configuration and repository preview shared by both faces. */
export interface NamedReviewRepository {
    name: string;
    path: string;
}
export interface ReviewProject {
    name: string;
    root: string;
    includeProjectRoot: boolean;
    configFiles: string[];
    repositories: string[];
    /** Repositories managed in the project-local JSON file. */
    namedRepositories?: NamedReviewRepository[] | undefined;
    /** Whether multi-repository management is enabled for this project. */
    enabled?: boolean | undefined;
}
export interface ReviewRepository {
    name: string;
    /** Display path relative to the current project root when the volume permits. */
    relativePath: string;
    /** Canonical absolute path used for file ownership and Host safety checks. */
    path: string;
    source: string;
    state: 'ready' | 'missing' | 'notGit' | 'error';
    reason?: string;
}
export interface ReviewWorkspace {
    project: ReviewProject | null;
    repositories: ReviewRepository[];
    warnings: string[];
    /** Trusted canonical roots used by the Host, never supplied by an undo caller. */
    roots: string[];
}
export interface ReviewProjectSettings {
    projects: ReviewProject[];
    revision: number;
}
export type SaveReviewProjects = ReviewProjectSettings;
export interface ReviewProjectPage {
    project: ReviewProject;
    revision: number;
    configured: boolean;
    workspace: ReviewWorkspace;
    /** Hash of the project-local file, used to reject stale saves. */
    fileRevision: string;
    /** Session-only absolute repositories, excluded from the project file. */
    temporaryRepositories: NamedReviewRepository[];
}
export interface SaveReviewProject {
    project: ReviewProject;
    revision: number;
    fileRevision: string;
}
//# sourceMappingURL=repository-types.d.ts.map