/** Read-only Git review. Every repository is derived from the receiving session. */
import { lstat, readFile, realpath } from 'node:fs/promises'
import { basename, isAbsolute, resolve } from 'node:path'
import type { ReviewWorkspace } from './repository-types.ts'
import type {
  GitReviewDiff,
  GitReviewFile,
  GitReviewFileRequest,
  GitReviewRepository,
  GitReviewRequest,
  GitReviewResult,
} from './git-review-types.ts'
import { inside, pathKey } from './repository-workspace.ts'
import { REVIEW_SCOPES, usesWorkingTree } from './review-scopes.ts'
import {
  GIT_DIFF_FLAGS,
  MAX_GIT_REVIEW_BYTES,
  resolveDefaultBranchRequest,
  resolveGitComparison,
  runReviewGit,
} from './git-review-command.ts'
import {
  applyGitNumstat,
  parseGitCommits,
  parseGitNames,
  parseGitTextDiffs,
} from './git-review-parser.ts'

// Keep the existing public parser import available to callers and tests.
export { parseGitNames } from './git-review-parser.ts'

const MAX_FILES = 1000
const REPOSITORY_BATCH_SIZE = 4

async function resolveApprovedRepositories(
  workspace: ReviewWorkspace,
  cwd: string,
): Promise<GitReviewRepository[]> {
  const candidates =
    workspace.project === null
      ? [{ name: basename(cwd), path: cwd, state: 'ready' }]
      : workspace.repositories.filter(repo => repo.state === 'ready')
  const repositories: GitReviewRepository[] = []
  const seen = new Set<string>()
  for (const candidate of candidates) {
    try {
      const root = await realpath(
        (await runReviewGit(candidate.path, ['rev-parse', '--show-toplevel'])).trim(),
      )
      // Configured roots must be real repository roots; don't silently select a parent.
      if (workspace.project !== null && pathKey(root) !== pathKey(candidate.path)) continue
      if (seen.has(pathKey(root))) continue
      seen.add(pathKey(root))
      repositories.push({
        name: candidate.name || basename(root),
        path: root,
        branch: '',
        branches: [],
        commits: [],
      })
    } catch {
      // A plain directory or an unavailable Git root has no Git review.
    }
  }
  return repositories
}

function resolveRepositoryFile(root: string, path: string): string {
  if (!path || path.includes('\0') || isAbsolute(path) || !inside(root, resolve(root, path))) {
    throw new Error('Invalid repository file path')
  }
  return resolve(root, path)
}

async function readUntrackedFile(
  root: string,
  path: string,
): Promise<{ text: string; binary: boolean }> {
  const candidate = resolveRepositoryFile(root, path)
  const stat = await lstat(candidate)
  if (stat.isSymbolicLink() || !stat.isFile() || stat.size > MAX_GIT_REVIEW_BYTES) {
    return { text: '', binary: true }
  }
  if (!inside(root, await realpath(candidate))) {
    throw new Error('File resolves outside the repository')
  }
  const bytes = await readFile(candidate)
  const text = bytes.toString('utf8')
  return bytes.includes(0) || !Buffer.from(text).equals(bytes)
    ? { text: '', binary: true }
    : { text, binary: false }
}

function textLineCount(text: string): number {
  return text === '' ? 0 : text.replace(/\n$/, '').split('\n').length
}

/** Without HEAD, the combined view treats each remaining disk file as added. */
async function includeUnbornWorkingTreeChanges(
  root: string,
  files: GitReviewFile[],
): Promise<void> {
  const names = await runReviewGit(root, ['diff', ...GIT_DIFF_FLAGS, '--name-status', '-z', '--'])
  const unstaged = parseGitNames(names, root)
  for (const file of unstaged) {
    if (!files.some(item => item.path === file.path)) files.push(file)
  }
  for (let index = files.length - 1; index >= 0; index--) {
    const file = files[index]!
    let content
    try {
      content = await readUntrackedFile(root, file.path)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      files.splice(index, 1)
      continue
    }
    file.added = textLineCount(content.text)
    file.removed = 0
    file.binary = content.binary
    file.untracked = true
    file.status = 'A'
  }
}

async function appendUntrackedFiles(root: string, files: GitReviewFile[]): Promise<void> {
  const paths = (await runReviewGit(root, ['ls-files', '--others', '--exclude-standard', '-z']))
    .split('\0')
    .filter(Boolean)
  if (paths.length + files.length > MAX_FILES) {
    throw new Error(`Review exceeds ${MAX_FILES} files; select a smaller scope`)
  }
  for (const path of paths) {
    // Git reports an embedded repository as a directory, not a changed file.
    if (path.endsWith('/')) continue
    if (files.some(item => item.path === path)) continue
    const content = await readUntrackedFile(root, path)
    files.push({
      repository: root,
      path,
      status: '?',
      added: textLineCount(content.text),
      removed: 0,
      binary: content.binary,
      untracked: true,
    })
  }
}

async function listChangedFiles(
  root: string,
  request: GitReviewRequest,
): Promise<{ files: GitReviewFile[]; comparison: string; args: string[] }> {
  request = await resolveDefaultBranchRequest(root, request)
  const comparison = await resolveGitComparison(root, request)
  const names = await runReviewGit(root, [
    'diff',
    ...GIT_DIFF_FLAGS,
    ...comparison.args,
    '--name-status',
    '-z',
    '--',
  ])
  const files = parseGitNames(names, root)
  const numstat = await runReviewGit(root, [
    'diff',
    ...GIT_DIFF_FLAGS,
    ...comparison.args,
    '--numstat',
    '-z',
    '--',
  ])
  applyGitNumstat(numstat, files)
  // An unborn HEAD requires index + worktree changes to obtain the combined view.
  if (request.mode === 'uncommitted' && comparison.args.includes('--cached')) {
    await includeUnbornWorkingTreeChanges(root, files)
  }
  if (usesWorkingTree(request.mode)) {
    await appendUntrackedFiles(root, files)
  }
  if (files.length > MAX_FILES)
    throw new Error(`Review exceeds ${MAX_FILES} files; select a smaller scope`)
  return { files, comparison: comparison.comparison, args: comparison.args }
}

async function loadRepositoryMetadata(
  repository: GitReviewRepository,
  request: GitReviewRequest,
): Promise<void> {
  repository.branch = (
    await runReviewGit(repository.path, ['symbolic-ref', '--quiet', '--short', 'HEAD']).catch(
      () => 'HEAD',
    )
  ).trim()
  if (REVIEW_SCOPES[request.mode].reference !== 'none') {
    repository.branches = (
      await runReviewGit(repository.path, [
        'for-each-ref',
        '--format=%(refname:short)',
        'refs/heads',
        'refs/remotes',
      ])
    )
      .split('\n')
      .filter(value => value && !value.endsWith('/HEAD'))
    const log = await runReviewGit(repository.path, [
      'log',
      '-50',
      '--format=%H%x00%s%x00%cs%x00',
    ]).catch(() => '')
    repository.commits.push(...parseGitCommits(log))
  }
}

export async function gitReview(
  workspace: ReviewWorkspace,
  cwd: string,
  request: GitReviewRequest,
): Promise<GitReviewResult> {
  const repositories = await resolveApprovedRepositories(workspace, cwd)
  if (
    request.repository &&
    !repositories.some(repo => pathKey(repo.path) === pathKey(request.repository!))
  ) {
    throw new Error('Repository is outside this session')
  }
  const result: GitReviewResult = {
    repositories,
    files: [],
    warnings: [...workspace.warnings],
    comparisons: [],
  }
  // Bound concurrency to four repositories to keep large projects responsive.
  for (let start = 0; start < repositories.length; start += REPOSITORY_BATCH_SIZE) {
    await Promise.all(
      repositories.slice(start, start + REPOSITORY_BATCH_SIZE).map(async repo => {
        if (request.repository && pathKey(repo.path) !== pathKey(request.repository)) return
        try {
          await loadRepositoryMetadata(repo, request)
          const changes = await listChangedFiles(repo.path, request)
          result.files.push(...changes.files)
          result.comparisons.push(`${repo.name}: ${changes.comparison}`)
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          result.warnings.push(`${repo.name}: ${message}`)
        }
      }),
    )
  }
  result.files.sort(
    (a, b) => a.repository.localeCompare(b.repository) || a.path.localeCompare(b.path),
  )
  return result
}

export async function gitReviewDiff(
  workspace: ReviewWorkspace,
  cwd: string,
  request: GitReviewFileRequest,
): Promise<GitReviewDiff> {
  const repo = (await resolveApprovedRepositories(workspace, cwd)).find(
    repo => pathKey(repo.path) === pathKey(request.repository),
  )
  if (!repo) throw new Error('Repository is outside this session')
  resolveRepositoryFile(repo.path, request.path)
  const changes = await listChangedFiles(repo.path, request)
  const file = changes.files.find(item => item.path === request.path)
  if (!file) throw new Error('This file changed; refresh the review')
  if (file.binary) {
    return { diffs: [], binary: true, note: 'Binary, symbolic link, or file exceeds 2 MiB' }
  }
  if (file.untracked) {
    const content = await readUntrackedFile(repo.path, file.path)
    return {
      diffs: content.binary
        ? []
        : [
            {
              path: resolve(repo.path, file.path),
              oldText: null,
              newText: content.text,
              oldStart: 1,
              newStart: 1,
            },
          ],
      binary: content.binary,
      note: '',
    }
  }
  // Keep the actual comparison's full context. The client displays three lines
  // initially and reveals twenty at a time without reading a different version.
  const patch = await runReviewGit(repo.path, [
    'diff',
    ...GIT_DIFF_FLAGS,
    ...changes.args,
    '--unified=2147483647',
    '--',
    ...(file.oldPath ? [file.oldPath] : []),
    file.path,
  ])
  const diffs = parseGitTextDiffs(patch, resolve(repo.path, file.path))
  return {
    diffs,
    binary: /Binary files|GIT binary patch/.test(patch),
    note: diffs.length ? '' : 'Rename or file mode change; no text difference',
  }
}
