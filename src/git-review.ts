/** Read-only Git review. Every repository is derived from the receiving session. */
import { execFile } from 'node:child_process'
import { lstat, readFile, realpath } from 'node:fs/promises'
import { basename, isAbsolute, resolve } from 'node:path'
import { parsePatch } from 'diff'
import type { ReviewWorkspace } from './repository-types.ts'
import type { GitReviewDiff, GitReviewFile, GitReviewFileRequest, GitReviewRepository, GitReviewRequest, GitReviewResult } from './git-review-types.ts'
import { inside, pathKey } from './repository-workspace.ts'

const MAX_BYTES = 2 * 1024 * 1024
const MAX_FILES = 1000
function git(root: string, args: string[]): Promise<string> {
  return new Promise((accept, reject) => {
    const child = execFile('git', ['--no-pager', '-C', root, '-c', 'core.quotePath=false', ...args], {
      windowsHide: true, timeout: 15000, maxBuffer: MAX_BYTES, encoding: 'utf8',
      env: { ...process.env, GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0', GIT_EXTERNAL_DIFF: '' },
    }, (error, stdout, stderr) => {
      if (error) reject(new Error(stderr.trim() || error.message))
      else accept(stdout)
    })
    child.stdin?.end()
  })
}

async function approved(workspace: ReviewWorkspace, cwd: string): Promise<GitReviewRepository[]> {
  const candidates = workspace.project === null ? [{ name: basename(cwd), path: cwd, state: 'ready' }]
    : workspace.repositories.filter(repo => repo.state === 'ready')
  const repositories: GitReviewRepository[] = []
  const seen = new Set<string>()
  for (const candidate of candidates) {
    try {
      const root = await realpath((await git(candidate.path, ['rev-parse', '--show-toplevel'])).trim())
      // Configured roots must be real repository roots; don't silently select a parent.
      if (workspace.project !== null && pathKey(root) !== pathKey(candidate.path)) continue
      if (seen.has(pathKey(root))) continue
      seen.add(pathKey(root))
      repositories.push({ name: candidate.name || basename(root), path: root, branch: '', branches: [], commits: [] })
    } catch { /* A plain directory or an unavailable Git root has no Git review. */ }
  }
  return repositories
}

async function diffArgs(root: string, request: GitReviewRequest): Promise<{ args: string[]; comparison: string }> {
  const hasHead = await git(root, ['rev-parse', '--verify', 'HEAD']).then(() => true, () => false)
  if (request.mode === 'unstaged') return { args: [], comparison: 'index → working tree' }
  if (request.mode === 'staged') return { args: ['--cached'], comparison: 'HEAD → index' }
  if (request.mode === 'uncommitted') return { args: hasHead ? ['HEAD'] : ['--cached'], comparison: 'HEAD → working tree' }
  if (!hasHead) throw new Error('This repository has no commits')
  const requested = request.ref || (request.mode === 'commit' ? 'HEAD' : '')
  if (!requested) throw new Error('Select a comparison branch')
  const oid = (await git(root, ['rev-parse', '--verify', '--end-of-options', `${requested}^{commit}`])).trim()
  if (!/^[0-9a-f]{40,64}$/i.test(oid)) throw new Error('Invalid commit')
  if (request.mode === 'branch') {
    const base = (await git(root, ['merge-base', 'HEAD', oid])).trim()
    return { args: [base, 'HEAD'], comparison: `${requested} merge-base → HEAD` }
  }
  const parent = await git(root, ['rev-parse', '--verify', `${oid}^`]).then(value => value.trim(), async () =>
    (await git(root, ['hash-object', '-t', 'tree', '--stdin'])).trim())
  return { args: [parent, oid], comparison: `${oid.slice(0, 8)} (${request.ref || 'HEAD'})` }
}

const diffFlags = ['--no-ext-diff', '--no-textconv', '--no-color', '--ignore-submodules=all', '--find-renames']
function safePath(root: string, path: string): string {
  if (!path || path.includes('\0') || isAbsolute(path) || !inside(root, resolve(root, path))) throw new Error('Invalid repository file path')
  return resolve(root, path)
}

export function parseGitNames(output: string, repository: string): GitReviewFile[] {
  const fields = output.split('\0')
  const files: GitReviewFile[] = []
  for (let index = 0; index < fields.length - 1;) {
    const status = fields[index++]!
    if (!status) continue
    const first = fields[index++]!
    const path = /^[RC]/.test(status) ? fields[index++]! : first
    if (!path) throw new Error('Incomplete Git name-status output')
    const existing = files.find(file => file.path === path)
    if (existing) { if (status[0] === 'U') existing.status = 'U'; continue }
    files.push({ repository, path, ...(/^[RC]/.test(status) ? { oldPath: first } : {}), status: status[0]!, added: 0, removed: 0, binary: false, untracked: false })
  }
  return files
}

function applyNumstat(output: string, files: GitReviewFile[]): void {
  const fields = output.split('\0')
  for (let index = 0; index < fields.length - 1;) {
    const record = fields[index++]!
    const match = /^([^\t]+)\t([^\t]+)\t(.*)$/s.exec(record)
    if (!match) continue
    let path = match[3]!
    if (path === '') { index++; path = fields[index++]! }
    const file = files.find(item => item.path === path)
    if (file) { file.binary = match[1] === '-'; file.added = Number(match[1]) || 0; file.removed = Number(match[2]) || 0 }
  }
}

async function untrackedText(root: string, path: string): Promise<{ text: string; binary: boolean }> {
  const candidate = safePath(root, path)
  const stat = await lstat(candidate)
  if (stat.isSymbolicLink() || !stat.isFile() || stat.size > MAX_BYTES) return { text: '', binary: true }
  if (!inside(root, await realpath(candidate))) throw new Error('File resolves outside the repository')
  const bytes = await readFile(candidate)
  const text = bytes.toString('utf8')
  return bytes.includes(0) || !Buffer.from(text).equals(bytes) ? { text: '', binary: true } : { text, binary: false }
}

async function changed(root: string, request: GitReviewRequest): Promise<{ files: GitReviewFile[]; comparison: string; args: string[] }> {
  if (request.mode === 'branch' && !request.ref) {
    const current = (await git(root, ['symbolic-ref', '--quiet', '--short', 'HEAD']).catch(() => '')).trim()
    const branches = (await git(root, ['for-each-ref', '--format=%(refname:short)', 'refs/heads', 'refs/remotes'])).split('\n').filter(Boolean)
    const preferred = (await git(root, ['symbolic-ref', '--quiet', '--short', 'refs/remotes/origin/HEAD']).catch(() => '')).trim()
    request = { ...request, ref: preferred || branches.find(branch => /^(origin\/)?(main|master)$/.test(branch) && branch !== current) || branches.find(branch => branch !== current && !branch.endsWith('/HEAD')) }
  }
  const comparison = await diffArgs(root, request)
  const names = await git(root, ['diff', ...diffFlags, ...comparison.args, '--name-status', '-z', '--'])
  const files = parseGitNames(names, root)
  applyNumstat(await git(root, ['diff', ...diffFlags, ...comparison.args, '--numstat', '-z', '--']), files)
  // An unborn HEAD requires index + worktree changes to obtain the combined view.
  if (request.mode === 'uncommitted' && comparison.args.includes('--cached')) {
    const unstaged = parseGitNames(await git(root, ['diff', ...diffFlags, '--name-status', '-z', '--']), root)
    for (const file of unstaged) if (!files.some(item => item.path === file.path)) files.push(file)
    for (let index = files.length - 1; index >= 0; index--) {
      const file = files[index]!
      let content
      try { content = await untrackedText(root, file.path) }
      catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
        files.splice(index, 1); continue
      }
      file.added = content.text === '' ? 0 : content.text.replace(/\n$/, '').split('\n').length
      file.removed = 0; file.binary = content.binary; file.untracked = true; file.status = 'A'
    }
  }
  if (request.mode === 'unstaged' || request.mode === 'uncommitted') {
    const paths = (await git(root, ['ls-files', '--others', '--exclude-standard', '-z'])).split('\0').filter(Boolean)
    if (paths.length + files.length > MAX_FILES) throw new Error(`Review exceeds ${MAX_FILES} files; select a smaller scope`)
    for (const path of paths) {
      // Git reports an embedded repository as a directory, not a changed file.
      if (path.endsWith('/')) continue
      if (files.some(item => item.path === path)) continue
      const content = await untrackedText(root, path)
      files.push({ repository: root, path, status: '?', added: content.text === '' ? 0 : content.text.replace(/\n$/, '').split('\n').length, removed: 0, binary: content.binary, untracked: true })
    }
  }
  if (files.length > MAX_FILES) throw new Error(`Review exceeds ${MAX_FILES} files; select a smaller scope`)
  return { files, comparison: comparison.comparison, args: comparison.args }
}

export async function gitReview(workspace: ReviewWorkspace, cwd: string, request: GitReviewRequest): Promise<GitReviewResult> {
  const repositories = await approved(workspace, cwd)
  if (request.repository && !repositories.some(repo => pathKey(repo.path) === pathKey(request.repository!))) throw new Error('Repository is outside this session')
  const result: GitReviewResult = { repositories, files: [], warnings: [...workspace.warnings], comparisons: [] }
  // Bound concurrency to four repositories to keep large projects responsive.
  for (let start = 0; start < repositories.length; start += 4) {
    await Promise.all(repositories.slice(start, start + 4).map(async repo => {
      if (request.repository && pathKey(repo.path) !== pathKey(request.repository)) return
      try {
        repo.branch = (await git(repo.path, ['symbolic-ref', '--quiet', '--short', 'HEAD']).catch(() => 'HEAD')).trim()
        if (request.mode === 'commit' || request.mode === 'branch') {
          repo.branches = (await git(repo.path, ['for-each-ref', '--format=%(refname:short)', 'refs/heads', 'refs/remotes'])).split('\n').filter(value => value && !value.endsWith('/HEAD'))
          const log = await git(repo.path, ['log', '-50', '--format=%H%x00%s%x00%cs%x00']).catch(() => '')
          const fields = log.split('\0')
          for (let index = 0; index + 2 < fields.length; index += 3) repo.commits.push({ oid: fields[index]!.trim(), subject: fields[index + 1]!, date: fields[index + 2]! })
        }
        const changes = await changed(repo.path, request)
        result.files.push(...changes.files)
        result.comparisons.push(`${repo.name}: ${changes.comparison}`)
      } catch (error) { result.warnings.push(`${repo.name}: ${error instanceof Error ? error.message : String(error)}`) }
    }))
  }
  result.files.sort((a, b) => a.repository.localeCompare(b.repository) || a.path.localeCompare(b.path))
  return result
}

export async function gitReviewDiff(workspace: ReviewWorkspace, cwd: string, request: GitReviewFileRequest): Promise<GitReviewDiff> {
  const repo = (await approved(workspace, cwd)).find(repo => pathKey(repo.path) === pathKey(request.repository))
  if (!repo) throw new Error('Repository is outside this session')
  safePath(repo.path, request.path)
  const changes = await changed(repo.path, request)
  const file = changes.files.find(item => item.path === request.path)
  if (!file) throw new Error('This file changed; refresh the review')
  if (file.binary) return { diffs: [], binary: true, note: 'Binary, symbolic link, or file exceeds 2 MiB' }
  if (file.untracked) {
    const content = await untrackedText(repo.path, file.path)
    return { diffs: content.binary ? [] : [{ path: resolve(repo.path, file.path), oldText: null, newText: content.text, oldStart: 1, newStart: 1 }], binary: content.binary, note: '' }
  }
  // Keep the actual comparison's full context. The client displays three lines
  // initially and reveals twenty at a time without reading a different version.
  const patch = await git(repo.path, ['diff', ...diffFlags, ...changes.args, '--unified=2147483647', '--', ...(file.oldPath ? [file.oldPath] : []), file.path])
  const diffs = parsePatch(patch).flatMap(part => part.hunks.map(hunk => {
    const oldLines: string[] = []; const newLines: string[] = []
    let oldFinal = true; let newFinal = true; let previous = ''
    for (const line of hunk.lines) {
      if (line.startsWith('\\')) { if (previous !== '+') oldFinal = false; if (previous !== '-') newFinal = false; continue }
      if (line[0] !== '+') oldLines.push(line.slice(1))
      if (line[0] !== '-') newLines.push(line.slice(1))
      previous = line[0] || ''
    }
    return { path: resolve(repo.path, file.path), oldText: oldLines.join('\n') + (oldLines.length && oldFinal ? '\n' : ''), newText: newLines.join('\n') + (newLines.length && newFinal ? '\n' : ''), oldStart: Math.max(1, hunk.oldStart), newStart: Math.max(1, hunk.newStart) }
  }))
  return { diffs, binary: /Binary files|GIT binary patch/.test(patch), note: diffs.length ? '' : 'Rename or file mode change; no text difference' }
}
