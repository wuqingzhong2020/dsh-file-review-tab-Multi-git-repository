import { z } from 'zod';
export declare const gitReviewRequestSchema: z.ZodObject<{
    mode: z.ZodEnum<{
        commit: "commit";
        branch: "branch";
        uncommitted: "uncommitted";
        unstaged: "unstaged";
        staged: "staged";
    }>;
    repository: z.ZodOptional<z.ZodString>;
    ref: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const gitReviewFileRequestSchema: z.ZodObject<{
    mode: z.ZodEnum<{
        commit: "commit";
        branch: "branch";
        uncommitted: "uncommitted";
        unstaged: "unstaged";
        staged: "staged";
    }>;
    ref: z.ZodOptional<z.ZodString>;
    repository: z.ZodString;
    path: z.ZodString;
}, z.core.$strip>;
export declare const gitReviewResultSchema: z.ZodObject<{
    repositories: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        path: z.ZodString;
        branch: z.ZodString;
        branches: z.ZodArray<z.ZodString>;
        commits: z.ZodArray<z.ZodObject<{
            oid: z.ZodString;
            subject: z.ZodString;
            date: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    files: z.ZodArray<z.ZodObject<{
        repository: z.ZodString;
        path: z.ZodString;
        oldPath: z.ZodOptional<z.ZodString>;
        status: z.ZodString;
        added: z.ZodNumber;
        removed: z.ZodNumber;
        binary: z.ZodBoolean;
        untracked: z.ZodBoolean;
    }, z.core.$strip>>;
    warnings: z.ZodArray<z.ZodString>;
    comparisons: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export declare const gitReviewDiffSchema: z.ZodObject<{
    diffs: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        oldText: z.ZodNullable<z.ZodString>;
        newText: z.ZodString;
        oldStart: z.ZodOptional<z.ZodNumber>;
        newStart: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    binary: z.ZodBoolean;
    note: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=git-review-schemas.d.ts.map