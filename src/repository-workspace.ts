/** Read repository manifests without executing project scripts or changing Git state. */
import { lstat, readFile, realpath, stat } from 'node:fs/promises'
import { basename, isAbsolute, resolve } from 'node:path'
import type { ReviewProject, ReviewRepository, ReviewWorkspace } from './repository-types.ts'
import { findProjectFile, PROJECT_FILE_NAME } from './repository-project-file.ts'
import {
  canonicalRepositoryPath,
  inside,
  projectRepositoryPath as projectPath,
} from './repository-path-policy.ts'
import { parseRepositoryManifest } from './repository-manifest.ts'
export { inside } from './repository-path-policy.ts'
export { parseRepositoryManifest } from './repository-manifest.ts'

const MAX_MANIFEST_BYTES = 1024 * 1024
const MAX_MANIFEST_REPOSITORIES = 512

type RepositoryCandidate = Pick<ReviewRepository, 'name' | 'path' | 'source'>

export function pathKey(path: string): string {
  return process.platform === 'win32' ? path.toLowerCase() : path
}

function failure(error: unknown): string {
  const code = (error as NodeJS.ErrnoException).code
  return code === 'ENOENT'
    ? 'Path does not exist'
    : error instanceof Error
      ? error.message
      : String(error)
}

async function normalizeProject(project: ReviewProject): Promise<ReviewProject> {
  if (!isAbsolute(project.root)) throw new Error('Project root must be an absolute path')
  const root = await realpath(project.root)
  if (!(await stat(root)).isDirectory()) throw new Error('Project root is not a directory')
  return {
    ...project,
    root,
    configFiles: project.configFiles.map(file => projectPath(root, file)),
    repositories: project.repositories.map(path => projectPath(root, path)),
    namedRepositories:
      project.namedRepositories === undefined
        ? undefined
        : await Promise.all(
            project.namedRepositories.map(async entry => ({
              ...entry,
              path: await canonicalRepositoryPath(root, entry.path),
            })),
          ),
  }
}

async function collectRepositoryCandidates(project: ReviewProject): Promise<{
  candidates: RepositoryCandidate[]
  warnings: string[]
}> {
  const root = project.root
  const warnings: string[] = []
  const candidates: RepositoryCandidate[] = project.repositories.map(path => ({
    name: basename(path),
    path,
    source: 'manual',
  }))
  candidates.push(
    ...(project.namedRepositories ?? []).map(entry => ({ ...entry, source: PROJECT_FILE_NAME })),
  )
  for (const file of project.configFiles) {
    const filename = resolve(root, file)
    try {
      if ((await stat(filename)).size > MAX_MANIFEST_BYTES)
        throw new Error('Configuration file exceeds 1 MiB')
      const entries = parseRepositoryManifest(await readFile(filename, 'utf8'), filename)
      if (entries.length > MAX_MANIFEST_REPOSITORIES)
        throw new Error('Configuration file exceeds 512 repositories')
      candidates.push(...entries.map(entry => ({ ...entry, source: projectPath(root, filename) })))
    } catch (error) {
      warnings.push(`${projectPath(root, filename)}: ${failure(error)}`)
    }
  }
  if (project.includeProjectRoot) {
    candidates.unshift({ name: project.name || basename(root), path: root, source: 'project' })
  }
  return { candidates, warnings }
}

async function inspectRepository(
  root: string,
  candidate: RepositoryCandidate,
): Promise<ReviewRepository> {
  let path = resolve(root, candidate.path)
  const repo: ReviewRepository = {
    ...candidate,
    path,
    relativePath: projectPath(root, path),
    state: 'ready',
  }
  try {
    path = await realpath(path)
    repo.path = path
    repo.relativePath = projectPath(root, path)
    if (!(await stat(path)).isDirectory()) throw new Error('Repository path is not a directory')
    const marker = await lstat(resolve(path, '.git')).catch((error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return undefined
      throw error
    })
    if (marker === undefined || (!marker.isDirectory() && !marker.isFile())) repo.state = 'notGit'
  } catch (error) {
    repo.state = (error as NodeJS.ErrnoException).code === 'ENOENT' ? 'missing' : 'error'
    repo.reason = failure(error)
  }
  return repo
}

export async function previewProject(project: ReviewProject): Promise<ReviewWorkspace> {
  const normalized = await normalizeProject(project)
  const { candidates, warnings } = await collectRepositoryCandidates(normalized)
  const result: ReviewWorkspace = {
    project: normalized,
    repositories: [],
    warnings,
    // A project root can own files even when the aggregate directory is not a Git repository.
    roots: project.includeProjectRoot ? [normalized.root] : [],
  }
  const seen = new Set<string>()
  for (const candidate of candidates) {
    const repo = await inspectRepository(normalized.root, candidate)
    if (repo.state === 'ready') result.roots.push(repo.path)
    const key = pathKey(repo.path)
    if (seen.has(key)) continue
    seen.add(key)
    result.repositories.push(repo)
  }
  result.roots = [...new Map(result.roots.map(path => [pathKey(path), path])).values()]
  return result
}

/** Most-specific project wins; a repo-root session also belongs to its aggregate. */
export async function resolveReviewWorkspace(
  cwd: string,
  projects: ReviewProject[],
): Promise<ReviewWorkspace> {
  const sessionRoot = await realpath(cwd)
  const local = await findProjectFile(sessionRoot)
  if (local !== null && local.project.enabled !== false) return previewProject(local.project)
  const previews: ReviewWorkspace[] = []
  for (const project of projects) {
    if (project.enabled === false) continue
    try {
      const preview = await previewProject(project)
      previews.push(preview)
    } catch {
      // An unavailable project must not disable unrelated sessions.
    }
  }
  const direct = [...previews]
    .sort((a, b) => (b.project?.root.length ?? 0) - (a.project?.root.length ?? 0))
    .find(preview => preview.project !== null && inside(preview.project.root, sessionRoot))
  if (direct !== undefined) return direct
  for (const preview of previews) {
    if (preview.roots.some(root => inside(root, sessionRoot))) return preview
  }
  return { project: null, repositories: [], warnings: [], roots: [sessionRoot] }
}
