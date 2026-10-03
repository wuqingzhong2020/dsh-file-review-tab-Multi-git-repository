/** Read-only Git execution and revision selection for review requests. */
import { execFile } from 'node:child_process'
import type { GitReviewRequest } from './git-review-types.ts'

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
): Promise<GitReviewRequest> {
  if (request.mode !== 'branch' || request.ref) return request
  const current = (
    await runReviewGit(root, ['symbolic-ref', '--quiet', '--short', 'HEAD']).catch(() => '')
  ).trim()
  const branches = (
    await runReviewGit(root, [
      'for-each-ref',
      '--format=%(refname:short)',
      'refs/heads',
      'refs/remotes',
    ])
  )
    .split('\n')
    .filter(Boolean)
  const preferred = (
    await runReviewGit(root, [
      'symbolic-ref',
      '--quiet',
      '--short',
      'refs/remotes/origin/HEAD',
    ]).catch(() => '')
  ).trim()
  const mainBranch = branches.find(
    branch => /^(origin\/)?(main|master)$/.test(branch) && branch !== current,
  )
  const otherBranch = branches.find(branch => branch !== current && !branch.endsWith('/HEAD'))
  return { ...request, ref: preferred || mainBranch || otherBranch }
}

export async function resolveGitComparison(
  root: string,
  request: GitReviewRequest,
): Promise<GitReviewComparison> {
  const hasHead = await runReviewGit(root, ['rev-parse', '--verify', 'HEAD']).then(
    () => true,
    () => false,
  )
  if (request.mode === 'unstaged') return { args: [], comparison: 'index → working tree' }
  if (request.mode === 'staged') return { args: ['--cached'], comparison: 'HEAD → index' }
  if (request.mode === 'uncommitted') {
    return { args: hasHead ? ['HEAD'] : ['--cached'], comparison: 'HEAD → working tree' }
  }
  if (!hasHead) throw new Error('This repository has no commits')

  const requested = request.ref || (request.mode === 'commit' ? 'HEAD' : '')
  if (!requested) throw new Error('Select a comparison branch')
  const oid = (
    await runReviewGit(root, ['rev-parse', '--verify', '--end-of-options', `${requested}^{commit}`])
  ).trim()
  if (!/^[0-9a-f]{40,64}$/i.test(oid)) throw new Error('Invalid commit')
  if (request.mode === 'branch') {
    const base = (await runReviewGit(root, ['merge-base', 'HEAD', oid])).trim()
    return { args: [base, 'HEAD'], comparison: `${requested} merge-base → HEAD` }
  }

  // Root commits compare against Git's empty tree, obtained by closing stdin.
  const parent = await runReviewGit(root, ['rev-parse', '--verify', `${oid}^`]).then(
    value => value.trim(),
    async () => (await runReviewGit(root, ['hash-object', '-t', 'tree', '--stdin'])).trim(),
  )
  return { args: [parent, oid], comparison: `${oid.slice(0, 8)} (${request.ref || 'HEAD'})` }
}
