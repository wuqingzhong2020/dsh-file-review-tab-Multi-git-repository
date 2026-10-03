import type { NamedReviewRepository, ReviewProject, ReviewWorkspace } from '../repository-types.ts';
/** Trim complete rows and normalize paths before the Host validates and saves them. */
export declare function prepareProjectForSave(project: ReviewProject): ReviewProject;
/** Combine resolved repositories and session-only entries in their displayed order. */
export declare function createRepositoryDraft(project: ReviewProject, workspace: ReviewWorkspace, temporary: NamedReviewRepository[]): ReviewProject;
/** Keep external absolute paths in the session instead of the portable project file. */
export declare function collectTemporaryRepositories(project: ReviewProject): NamedReviewRepository[];
//# sourceMappingURL=repository-settings-model.d.ts.map