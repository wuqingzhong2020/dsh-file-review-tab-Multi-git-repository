export declare function inside(root: string, candidate: string): boolean;
/** Only directories contained by the project are portable configuration paths. */
export declare function projectRepositoryPath(root: string, input: string): string;
/** A junction to an external directory is temporary too. Missing paths remain editable. */
export declare function canonicalRepositoryPath(root: string, input: string): Promise<string>;
//# sourceMappingURL=repository-path-policy.d.ts.map