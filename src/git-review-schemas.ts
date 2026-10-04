import { z } from 'zod'
import { GIT_REVIEW_MODES } from './review-scopes.ts'
export const gitReviewRequestSchema = z.object({
  mode: z.enum(GIT_REVIEW_MODES),
  repository: z.string().max(4096).optional(),
  ref: z.string().min(1).max(1024).optional(),
})
export const gitReviewFileRequestSchema = gitReviewRequestSchema.extend({
  repository: z.string().max(4096),
  path: z.string().min(1).max(4096),
})
export const gitReviewResultSchema = z.object({
  repositories: z.array(
    z.object({
      name: z.string(),
      path: z.string(),
      branch: z.string(),
      branches: z.array(z.string()),
      commits: z.array(z.object({ oid: z.string(), subject: z.string(), date: z.string() })),
    }),
  ),
  files: z.array(
    z.object({
      repository: z.string(),
      path: z.string(),
      oldPath: z.string().optional(),
      status: z.string(),
      added: z.number(),
      removed: z.number(),
      binary: z.boolean(),
      untracked: z.boolean(),
    }),
  ),
  warnings: z.array(z.string()),
  comparisons: z.array(z.string()),
})
export const gitReviewDiffSchema = z.object({
  diffs: z.array(
    z.object({
      path: z.string(),
      oldText: z.string().nullable(),
      newText: z.string(),
      oldStart: z.number().optional(),
      newStart: z.number().optional(),
    }),
  ),
  binary: z.boolean(),
  note: z.string(),
})
