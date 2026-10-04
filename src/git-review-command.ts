/** Read-only Git execution and revision selection for review requests. */
import { execFile } from 'node:child_process'
import type { GitReviewRequest } from './git-review-types.ts'
import { REVIEW_SCOPES, type GitReviewMode } from './review-scopes.ts'

export const MAX_GIT_REVIEW_BYTES = 2 * 1024 * 1024
const GIT_TIMEOUT_MS = 15000

export const GIT_DIFF_FLAGS = [
  '--no-ext-diff',
  '--no-textconv',
  '--no-color',
  '--ignore-submodules=all',
  '--find-renames',
]

export interface GitReviewComparison {
  args: string[]
  comparison: string
}

/** Injection point for comparison planning tests; production always uses the bounded runner. */
export type ReviewGitRunner = (root: string, args: string[]) => Promise<string>

export function runReviewGit(root: string, args: string[]): Promise<string> {
  return new Promise((accept, reject) => {
    const child = execFile(
      'git',
      ['--no-pager', '-C', root, '-c', 'core.quotePath=false', ...args],
      {
        windowsHide: true,
        timeout: GIT_TIMEOUT_MS,
        maxBuffer: MAX_GIT_REVIEW_BYTES,
        encoding: 'utf8',
        env: {
          ...process.env,
          GIT_OPTIONAL_LOCKS: '0',
          GIT_TERMINAL_PROMPT: '0',
          GIT_EXTERNAL_DIFF: '',
        },
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr.trim() || error.message))
        } else {
          accept(stdout)
        }
      },
    )
    child.stdin?.end()
  })
}

/** An omitted branch uses the remote default, main/master, then another branch. */
export async function resolveDefaultBranchRequest(
  root: string,
  request: GitReviewRequest,
  run: ReviewGitRunner = runReviewGit,
): Promise<GitReviewRequest> {
  if (REVIEW_SCOPES[request.mode].reference !== 'branch' || request.ref) return request
  const current = (
    await run(root, ['symbolic-ref', '--quiet', '--short', 'HEAD']).catch(() => '')
  ).trim()
  const branches = (
    await run(root, ['for-each-ref', '--format=%(refname:short)', 'refs/heads', 'refs/remotes'])
  )
    .split('\n')
    .filter(Boolean)
  const preferred = (
    await run(root, ['symbolic-ref', '--quiet', '--short', 'refs/remotes/origin/HEAD']).catch(
      () => '',
    )
  ).trim()
  const mainBranch = branches.find(
    branch => /^(origin\/)?(main|master)$/.test(branch) && branch !== current,
  )
  const otherBranch = branches.find(branch => branch !== current && !branch.endsWith('/HEAD'))
  return { ...request, ref: preferred || mainBranch || otherBranch }
}

interface ComparisonContext {
  root: string
  request: GitReviewRequest
  hasHead: boolean
  run: ReviewGitRunner
}

/** Resolve a supplied reference to a commit before using it in later Git arguments. */
async function resolveCommit(
  { root, hasHead, run }: ComparisonContext,
  requested: string,
): Promise<string> {
  if (!hasHead) throw new Error('This repository has no commits')
  if (!requested) throw new Error('Select a comparison branch')
  const oid = (
    await run(root, ['rev-parse', '--verify', '--end-of-options', `${requested}^{commit}`])
  ).trim()
  if (!/^[0-9a-f]{40,64}$/i.test(oid)) throw new Error('Invalid commit')
  return oid
}

async function compareBranch(context: ComparisonContext): Promise<GitReviewComparison> {
  const { root, request, run } = context
  const requested = request.ref || ''
  const oid = await resolveCommit(context, requested)
  const base = (await run(root, ['merge-base', 'HEAD', oid])).trim()
  return { args: [base, 'HEAD'], comparison: `${requested} merge-base → HEAD` }
}

async function compareCommit(context: ComparisonContext): Promise<GitReviewComparison> {
  const { root, request, run } = context
  const oid = await resolveCommit(context, request.ref || 'HEAD')

  // Root commits compare against Git's empty tree, obtained by closing stdin.
  const parent = await run(root, ['rev-parse', '--verify', `${oid}^`]).then(
    value => value.trim(),
    async () => (await run(root, ['hash-object', '-t', 'tree', '--stdin'])).trim(),
  )
  return { args: [parent, oid], comparison: `${oid.slice(0, 8)} (${request.ref || 'HEAD'})` }
}

type ComparisonResolver = (
  context: ComparisonContext,
) => GitReviewComparison | Promise<GitReviewComparison>

/** Adding a Git scope requires an explicit comparison; there is no historical-mode fallback. */
const COMPARISON_RESOLVERS = {
  unstaged: () => ({ args: [], comparison: 'index → working tree' }),
  staged: () => ({ args: ['--cached'], comparison: 'HEAD → index' }),
  uncommitted: ({ hasHead }) => ({
    args: hasHead ? ['HEAD'] : ['--cached'],
    comparison: 'HEAD → working tree',
  }),
  commit: compareCommit,
  branch: compareBranch,
} satisfies Record<GitReviewMode, ComparisonResolver>

export async function resolveGitComparison(
  root: string,
  request: GitReviewRequest,
  run: ReviewGitRunner = runReviewGit,
): Promise<GitReviewComparison> {
  const hasHead = await run(root, ['rev-parse', '--verify', 'HEAD']).then(
    () => true,
    () => false,
  )
  return COMPARISON_RESOLVERS[request.mode]({ root, request, hasHead, run })
}
