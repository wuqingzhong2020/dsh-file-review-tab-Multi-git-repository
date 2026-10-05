import { MULTI_GIT_REPO_MANAGER_SERVICE_NAME } from 'dsh-multi-git-repo-manager/service-names'
/**
 * File-review-tab plugin, node half. Registers the response-format guidance
 * that lets the browser half recognize final-response file references. The
 * browser half ships via exports["./client"], discovered through the
 * package.json dsh.client declaration.
 */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-system-prompt'
import type {} from '@deepseek-ai/dsh-tools'
import { FileReviewService } from './file-review-service.ts'
import type { FileReviewConfig } from './repository-config.ts'
import type {} from 'dsh-multi-git-repo-manager'
import { registerLifecycleCapture } from './lifecycle-capture.ts'

export type * from './change-types.ts'
export type * from './repository-types.ts'
export type * from './git-review-types.ts'
export type * from './review-location.ts'
export type * from './user-guide.ts'
export { Config } from './repository-config.ts'
export { FileReviewService, transformFile } from './file-review-service.ts'

/** Services required for the model guidance paired with the browser renderer. */
export const inject = ['systemPrompt', 'tools', MULTI_GIT_REPO_MANAGER_SERVICE_NAME]

/** Stable final-response guidance owned by the matching renderer. */
const FILE_REFERENCE_PROMPT = 'When you successfully create or modify files, mention the primary outputs in your final response. '
  + 'To make those and any other changed-file references clickable in Web, format them as Markdown inline code using the exact file-tool path, or a basename when unique among the files changed in that turn.'

/**
 * Register model guidance for the file-reference renderer shipped by this package,
 * and the Code Mode (`run_code`) mutation recorder that backs the browser-side
 * review tab.
 *
 * Nested dispatch results carry no wire views — the diff cards only ride
 * model-direct tool/call frames — so reviewing programmatic file edits needs a
 * second source: this listener snapshots the full `before`/`after` content of
 * every nested file mutation (`edit`/`write` — recognized by result shape, not
 * tool name) into the `multiGitFileReviewByWqz` service, which the browser half later turns
 * into line-level hunks and merges into the owning `run_code` turn.
 * @param ctx - host context carrying the system-prompt registry and tool runtime.
 */
export function apply(ctx: Context, config: FileReviewConfig): void {
  const projects = Array.isArray(config?.projects) ? config.projects : config?.projects?.get() ?? []
  ctx.multiGitRepoManagerByWqz.adoptLegacyProjects(projects)
  const service = new FileReviewService(ctx, ctx.multiGitRepoManagerByWqz)
  registerLifecycleCapture(ctx, service)
  ctx.systemPrompt.section({
    name: 'ui:file-review-tab-multi-git-repository:references',
    order: 190,
    text: FILE_REFERENCE_PROMPT,
  })

  // Observe the final committed outcome rather than intercepting the
  // post-execute policy waterfall. Failed nested calls never record a change.
  ctx.effect(() => ctx.on('tools/result', (exec, result) => {
    // Model-direct mutations are already reviewable through conversation views;
    // only nested dispatches (run_code sub-calls) need host-side recording.
    if (exec.parent === undefined || exec.agent === undefined || result.isError) return
    const value: unknown = result.value
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return
    const candidate = value as { path?: unknown; before?: unknown; after?: unknown }
    if (typeof candidate.path !== 'string' || typeof candidate.after !== 'string') return
    if (candidate.before !== null && typeof candidate.before !== 'string') return
    service.recordMutation(exec.agent, {
      rootCallId: String(exec.rootCallId),
      name: exec.name,
      path: candidate.path,
      before: candidate.before ?? null,
      after: candidate.after,
    })
  }), 'file-review-tab: ptc recorder')
}

export * from './service-names.ts'
