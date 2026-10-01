/** Read repository manifests without executing project scripts or changing Git state. */
import { lstat, readFile, realpath, stat } from 'node:fs/promises'
import { basename, isAbsolute, relative, resolve, sep } from 'node:path'
import type { ReviewProject, ReviewRepository, ReviewWorkspace } from './repository-types.ts'
import { findProjectFile, PROJECT_FILE_NAME } from './repository-project-file.ts'

export function inside(root: string, candidate: string): boolean {
  const child = relative(root, candidate)
  return child === '' || (child !== '..' && !child.startsWith(`..${sep}`) && !isAbsolute(child))
}

export function pathKey(path: string): string {
  return process.platform === 'win32' ? path.toLowerCase() : path
}

/** Keep saved source paths portable when the project and target share a volume. */
function projectPath(root: string, path: string): string {
  const result = relative(root, resolve(root, path)) || '.'
  return result.split(sep).join('/')
}

function unquote(value: string): string {
  return /^(["']).*\1$/.test(value) ? value.slice(1, -1) : value
}

/** ConfigParser-style INI, Git's .gitmodules, or JSON repository lists. */
export function parseRepositoryManifest(text: string, filename: string): { name: string; path: string }[] {
  text = text.replace(/^\uFEFF/, '')
  if (filename.toLowerCase().endsWith('.json')) {
    const value: unknown = JSON.parse(text)
    const entries = Array.isArray(value) ? value
      : value !== null && typeof value === 'object'
        ? (value as { repositories?: unknown }).repositories : undefined
    if (!Array.isArray(entries)) throw new Error('JSON must contain an array or a repositories array')
    return entries.map((entry: unknown, index) => {
      if (typeof entry === 'string' && entry.trim() !== '') return { name: basename(entry), path: entry.trim() }
      if (entry !== null && typeof entry === 'object') {
        const item = entry as { name?: unknown; path?: unknown }
        if (typeof item.path === 'string' && item.path.trim() !== '') {
          return { name: typeof item.name === 'string' ? item.name : basename(item.path), path: item.path.trim() }
        }
      }
      throw new Error(`repository ${index + 1} has no path`)
    })
  }
  if (!filename.toLowerCase().endsWith('.ini') && basename(filename).toLowerCase() !== '.gitmodules') {
    throw new Error('Supported formats: .ini, .gitmodules, .json')
  }
  const entries: { name: string; path: string }[] = []
  let section = ''
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#') || line.startsWith(';')) continue
    if (line.startsWith('[') && line.endsWith(']')) {
      section = line.slice(1, -1).replace(/^submodule\s+/, '')
      section = unquote(section)
      continue
    }
    const match = /^path\s*[=:]\s*(.+)$/i.exec(line)
    if (section && match?.[1]) entries.push({ name: section, path: unquote(match[1].trim()) })
  }
  if (entries.length === 0) throw new Error('No section with a path field was found')
  return entries
}

function failure(error: unknown): string {
  const code = (error as NodeJS.ErrnoException).code
  return code === 'ENOENT' ? 'Path does not exist' : error instanceof Error ? error.message : String(error)
}

export async function previewProject(project: ReviewProject): Promise<ReviewWorkspace> {
  if (!isAbsolute(project.root)) throw new Error('Project root must be an absolute path')
  const root = await realpath(project.root)
  if (!(await stat(root)).isDirectory()) throw new Error('Project root is not a directory')
  const normalized: ReviewProject = {
    ...project, root,
    configFiles: project.configFiles.map(file => projectPath(root, file)),
    repositories: project.repositories.map(path => projectPath(root, path)),
    namedRepositories: project.namedRepositories?.map(entry => ({ ...entry, path: projectPath(root, entry.path) })),
  }
  const result: ReviewWorkspace = { project: normalized, repositories: [], warnings: [], roots: [] }
  const candidates = normalized.repositories.map(path => ({ name: basename(path), path, source: 'manual' }))
  candidates.push(...(normalized.namedRepositories ?? []).map(entry => ({ ...entry, source: PROJECT_FILE_NAME })))
  for (const file of normalized.configFiles) {
    const filename = resolve(root, file)
    try {
      if ((await stat(filename)).size > 1024 * 1024) throw new Error('Configuration file exceeds 1 MiB')
      const entries = parseRepositoryManifest(await readFile(filename, 'utf8'), filename)
      if (entries.length > 512) throw new Error('Configuration file exceeds 512 repositories')
      candidates.push(...entries.map(entry => ({ ...entry, source: projectPath(root, filename) })))
    } catch (error) {
      result.warnings.push(`${projectPath(root, filename)}: ${failure(error)}`)
    }
  }
  if (project.includeProjectRoot) {
    candidates.unshift({ name: project.name || basename(root), path: root, source: 'project' })
    // The aggregate project may be a plain directory rather than a Git repo.
    result.roots.push(root)
  }
  const seen = new Set<string>()
  for (const candidate of candidates) {
    let path = resolve(root, candidate.path)
    const repo: ReviewRepository = { ...candidate, path, relativePath: projectPath(root, path), state: 'ready' }
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
      else result.roots.push(path)
    } catch (error) {
      repo.state = (error as NodeJS.ErrnoException).code === 'ENOENT' ? 'missing' : 'error'
      repo.reason = failure(error)
    }
    if (seen.has(pathKey(path))) continue
    seen.add(pathKey(path))
    result.repositories.push(repo)
  }
  result.roots = [...new Map(result.roots.map(path => [pathKey(path), path])).values()]
  return result
}

/** Most-specific project wins; a repo-root session also belongs to its aggregate. */
export async function resolveReviewWorkspace(cwd: string, projects: ReviewProject[]): Promise<ReviewWorkspace> {
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
  const direct = [...previews].sort((a, b) => (b.project?.root.length ?? 0) - (a.project?.root.length ?? 0))
    .find(preview => preview.project !== null && inside(preview.project.root, sessionRoot))
  if (direct !== undefined) return direct
  for (const preview of previews) {
    if (preview.roots.some(root => inside(root, sessionRoot))) return preview
  }
  return { project: null, repositories: [], warnings: [], roots: [sessionRoot] }
}
