/** Host-side, workspace-contained undo / redo service for produced text diffs. */

import { readFile, lstat, realpath } from 'node:fs/promises'
import { basename, isAbsolute, resolve } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { writeFileAtomic } from '@deepseek-ai/dsh-atomic-write'
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import type {
  FileReviewAction, FileReviewChange, FileReviewFileResult, FileReviewRequest, FileReviewResult,
  ProducedFileDiff, RecordedMutation, RecordedRequest, RecordedResult,
} from './change-types.ts'
import type { RepositorySettings } from './repository-settings.ts'
import type { NamedReviewRepository, ReviewProject, ReviewProjectPage, ReviewWorkspace, SaveReviewProject } from './repository-types.ts'
import { inside, pathKey, previewProject, resolveReviewWorkspace } from './repository-workspace.ts'
import { findProjectFile, PROJECT_FILE_NAME, readProjectFile, writeProjectFile } from './repository-project-file.ts'
import { canonicalRepositoryPath } from './repository-path-policy.ts'
import { resolveDirectoryStart } from './repository-directory.ts'
import { gitReview, gitReviewDiff } from './git-review.ts'
import type { GitReviewDiff, GitReviewFileRequest, GitReviewRequest, GitReviewResult } from './git-review-types.ts'

type InspectState = Exclude<FileReviewFileResult['state'], 'error'>

interface InspectedFile {
  readonly state: InspectState
  readonly text?: string | undefined
  readonly nextText?: string | undefined
  readonly reason?: string | undefined
}

interface ResolvedFile {
  readonly filename: string
  readonly mode: number
  readonly bytes: Uint8Array
  /** Raw disk text (line endings as stored). */
  readonly text: string
  /** Whether the file uses CRLF line endings on disk. */
  readonly crlf: boolean
  /** Disk text normalized to the backend diff basis (LF), used for hunk math. */
  readonly lfText: string
}

/**
 * The mutation tools' recorded hunks (both diff cards and Code Mode
 * before/after values) ride the filesystem backend's LF-normalized basis,
 * while files on disk may use CRLF. All hunk matching therefore runs on the
 * normalized text; the write path restores the file's own line-ending style.
 */
function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

function restoreNewlines(text: string, crlf: boolean): string {
  return crlf ? text.replace(/\n/g, '\r\n') : text
}

async function resolveFile(cwd: string, requestedPath: string, roots: readonly string[]): Promise<ResolvedFile> {
  const candidate = resolve(await realpath(cwd), requestedPath)
  const linkStat = await lstat(candidate)
  if (linkStat.isSymbolicLink()) throw new Error('symbolic links are not supported')
  if (!linkStat.isFile()) throw new Error('path is not a regular file')
  const filename = await realpath(candidate)
  if (!roots.some(root => inside(root, filename))) throw new Error('resolved path is outside the configured project repositories')
  const bytes = await readFile(filename)
  const text = bytes.toString('utf8')
  if (!Buffer.from(text, 'utf8').equals(bytes)) throw new Error('file is not valid UTF-8 text')
  const crlf = text.includes('\r')
  return { filename, mode: linkStat.mode & 0o777, bytes, text, crlf, lfText: normalizeNewlines(text) }
}

function offsetAtLine(text: string, line: number): number | null {
  if (!Number.isInteger(line) || line < 1) return null
  if (line === 1) return 0
  let offset = 0
  for (let current = 1; current < line; current += 1) {
    const next = text.indexOf('\n', offset)
    if (next === -1) return null
    offset = next + 1
  }
  return offset
}

function replaceHunk(
  text: string,
  source: string,
  replacement: string,
  line: number | undefined,
): string | null {
  let offset: number
  if (line !== undefined) {
    const located = offsetAtLine(text, line)
    if (located === null || text.slice(located, located + source.length) !== source) return null
    offset = located
  } else {
    if (source === '') return null
    offset = text.indexOf(source)
    if (offset === -1 || text.indexOf(source, offset + 1) !== -1) return null
  }
  return text.slice(0, offset) + replacement + text.slice(offset + source.length)
}

function hunkSupported(diff: ProducedFileDiff, path: string): boolean {
  if (diff.path !== path || diff.oldText === null || diff.oldText === diff.newText) return false
  if (diff.oldText === '' && diff.oldStart === undefined) return false
  if (diff.newText === '' && diff.newStart === undefined) return false
  return true
}

/** Apply a complete file's hunk sequence in memory, or report a strict mismatch. */
export function transformFile(
  text: string,
  file: FileReviewChange,
  action: FileReviewAction,
): string | null {
  if (file.diffs.length === 0 || !file.diffs.every(diff => hunkSupported(diff, file.path))) {
    return null
  }
  const diffs = action === 'undo' ? [...file.diffs].reverse() : file.diffs
  let next = text
  for (const diff of diffs) {
    const source = action === 'undo' ? diff.newText : diff.oldText
    const replacement = action === 'undo' ? diff.oldText : diff.newText
    if (source === null || replacement === null) return null
    const changed = replaceHunk(
      next,
      source,
      replacement,
      action === 'undo' ? diff.newStart : diff.oldStart,
    )
    if (changed === null) return null
    next = changed
  }
  return next
}

function hunkSidePresent(text: string, file: FileReviewChange, side: 'old' | 'new'): boolean {
  for (const diff of file.diffs) {
    const source = side === 'old' ? diff.oldText : diff.newText
    if (source === null) continue
    const line = side === 'old' ? diff.oldStart : diff.newStart
    if (line !== undefined) {
      const located = offsetAtLine(text, line)
      if (located === null || text.slice(located, located + source.length) !== source) return false
    } else if (text.indexOf(source) === -1) {
      return false
    }
  }
  return true
}

function inspectText(text: string, file: FileReviewChange): InspectedFile {
  if (file.diffs.length === 0 || !file.diffs.every(diff => hunkSupported(diff, file.path))) {
    return { state: 'unsupported', reason: 'change has no complete reversible diff' }
  }
  const undone = transformFile(text, file, 'undo')
  const redone = transformFile(text, file, 'redo')
  if (undone !== null && redone !== null) {
    // Both directions textually succeed. This is the classic pure-append
    // shape: the before hunks are a lead-in prefix of the after hunks, so
    // they are contained in the after state too. Decide by what the CURRENT
    // text actually contains: the after hunks are present => applied (undo
    // strips them); otherwise the change is undone and only before hunks
    // remain.
    return hunkSidePresent(text, file, 'new')
      ? { state: 'applied', text, nextText: undone }
      : { state: 'undone', text, nextText: redone }
  }
  if (undone !== null) return { state: 'applied', text, nextText: undone }
  if (redone !== null) return { state: 'undone', text, nextText: redone }
  return { state: 'conflict', reason: 'current content does not match the recorded change' }
}

async function inspectOne(cwd: string, file: FileReviewChange, roots: readonly string[]): Promise<FileReviewFileResult> {
  if (file.diffs.length === 0 || !file.diffs.every(diff => hunkSupported(diff, file.path))) {
    return {
      path: file.path,
      state: 'unsupported',
      changed: false,
      reason: 'change has no complete reversible diff',
    }
  }
  try {
    const resolved = await resolveFile(cwd, file.path, roots)
    const inspected = inspectText(resolved.lfText, file)
    return { path: file.path, state: inspected.state, changed: false, reason: inspected.reason }
  } catch (error) {
    return {
      path: file.path,
      state: 'error',
      changed: false,
      reason: error instanceof Error ? error.message : String(error),
    }
  }
}

async function applyOne(
  cwd: string,
  file: FileReviewChange,
  action: FileReviewAction,
  roots: readonly string[],
): Promise<FileReviewFileResult> {
  if (file.diffs.length === 0 || !file.diffs.every(diff => hunkSupported(diff, file.path))) {
    return {
      path: file.path,
      state: 'unsupported',
      changed: false,
      reason: 'change has no complete reversible diff',
    }
  }
  try {
    const resolved = await resolveFile(cwd, file.path, roots)
    const inspected = inspectText(resolved.lfText, file)
    const sourceState = action === 'undo' ? 'applied' : 'undone'
    const targetState = action === 'undo' ? 'undone' : 'applied'
    if (inspected.state === targetState) {
      return { path: file.path, state: targetState, changed: false }
    }
    if (inspected.state !== sourceState || inspected.nextText === undefined) {
      return { path: file.path, state: inspected.state, changed: false, reason: inspected.reason }
    }

    // Re-read immediately before commit. This is the closest available CAS fence for
    // external editors that do not participate in the package's writer lock.
    const current = await readFile(resolved.filename)
    if (!Buffer.from(resolved.bytes).equals(current)) {
      return {
        path: file.path,
        state: 'conflict',
        changed: false,
        reason: 'file changed while the operation was being prepared',
      }
    }
    await writeFileAtomic(
      resolved.filename,
      restoreNewlines(inspected.nextText, resolved.crlf),
      { mode: resolved.mode },
    )
    return { path: file.path, state: targetState, changed: true }
  } catch (error) {
    return {
      path: file.path,
      state: 'error',
      changed: false,
      reason: error instanceof Error ? error.message : String(error),
    }
  }
}

function sessionCwd(agent: Agent): string {
  const cwd = agent.session.header.cwd
  if (cwd === undefined || cwd.trim() === '') throw new Error('session has no workspace directory')
  return cwd
}

/** Per-agent cap on recorded Code Mode mutations (oldest evicted first). */
const RECORDED_PER_AGENT_CAP = 4000

function agentKey(agent: Agent): string {
  return String(agent.id)
}

/** Host service published as the `fileReview` Remote namespace. */
export class FileReviewService extends TypertRemoteService {
  /** Per-agent record of Code Mode (`run_code`) file mutations, dispatch order. */
  private readonly recordLog = new Map<string, RecordedMutation[]>()
  private readonly temporaryRepositories = new Map<string, NamedReviewRepository[]>()

  constructor(ctx: Context, private readonly projectSettings?: RepositorySettings) {
    super(ctx, 'fileReview')
  }

  /** Read only the project selected by this Agent's authoritative directory. */
  async project(agent: Agent): Promise<ReviewProjectPage> {
    const settings = this.projectSettings?.get() ?? { projects: [], revision: 0 }
    const cwd = sessionCwd(agent)
    const root = await realpath(cwd)
    const localFile = await findProjectFile(root)
    const matched = await resolveReviewWorkspace(cwd, settings.projects)
    const project = localFile !== null ? localFile.project
      : matched.project !== null ? { ...matched.project, name: basename(matched.project.root) }
      : { name: basename(root), root, includeProjectRoot: true, configFiles: [], repositories: [], enabled: true }
    const workspace = localFile !== null && project.enabled !== false ? await this.workspace(agent) : await previewProject(project)
    return {
      project, revision: settings.revision, configured: localFile !== null,
      workspace, fileRevision: localFile?.revision ?? '',
      temporaryRepositories: localFile !== null ? this.temporaryRepositories.get(agentKey(agent)) ?? localFile.temporaryRepositories : [],
    }
  }

  /** Read Git differences only in repositories belonging to this session. */
  async gitReview(agent: Agent, request: GitReviewRequest): Promise<GitReviewResult> {
    return gitReview(await this.workspace(agent), sessionCwd(agent), request)
  }

  async gitReviewDiff(agent: Agent, request: GitReviewFileRequest): Promise<GitReviewDiff> {
    return gitReviewDiff(await this.workspace(agent), sessionCwd(agent), request)
  }

  async directoryStart(agent: Agent, path: string): Promise<string> {
    const current = await this.project(agent)
    return resolveDirectoryStart(current.project.root, path)
  }

  /** Preview and save cannot choose another project's root through the wire. */
  async preview(agent: Agent, project: ReviewProject): Promise<ReviewWorkspace> {
    const current = await this.project(agent)
    if (pathKey(await realpath(project.root)) !== pathKey(current.project.root)) throw new Error('Project root does not belong to this session')
    return previewProject({ ...project, name: current.project.name, root: current.project.root })
  }

  async saveProject(agent: Agent, request: SaveReviewProject): Promise<ReviewProjectPage> {
    const preview = await this.preview(agent, {
      ...request.project, configFiles: [], repositories: [],
    })
    const project = preview.project!
    await writeProjectFile({
      ...project,
      enabled: request.project.enabled ?? project.enabled ?? true,
      namedRepositories: project.namedRepositories?.filter(entry => !isAbsolute(entry.path)),
    }, request.fileRevision)
    if (this.projectSettings !== undefined) {
      const settings = this.projectSettings.get()
      const index = settings.projects.findIndex(item => pathKey(item.root) === pathKey(project.root))
      const projects = [...settings.projects]
      const indexEntry = {
        name: project.name, root: project.root, includeProjectRoot: project.includeProjectRoot,
        configFiles: [PROJECT_FILE_NAME], repositories: [], enabled: request.project.enabled ?? project.enabled ?? true,
      }
      if (index === -1) projects.push(indexEntry)
      else projects[index] = indexEntry
      // The project-local file is authoritative; the profile keeps its index.
      try { await this.projectSettings.save({ projects, revision: settings.revision }) } catch { /* local file remains usable */ }
    }
    return this.project(agent)
  }

  async workspace(agent: Agent): Promise<ReviewWorkspace> {
    const indexed = this.projectSettings?.get().projects ?? []
    const active: ReviewProject[] = []
    for (const project of indexed) {
      if (!project.configFiles.includes(PROJECT_FILE_NAME) || project.enabled === false) continue
      try {
        const local = await readProjectFile(project.root)
        if (local !== null && local.project.enabled !== false) active.push(local.project)
      } catch {
        // Invalid or unavailable project files never expand another session's scope.
      }
    }
    const base = await resolveReviewWorkspace(sessionCwd(agent), active)
    const temporary = this.temporaryRepositories.get(agentKey(agent)) ?? []
    if (base.project === null || temporary.length === 0) return base
    const extra = await previewProject({
      name: base.project.name, root: base.project.root, includeProjectRoot: false,
      configFiles: [], repositories: [], namedRepositories: temporary,
    })
    const repositories = [...base.repositories]
    const seen = new Set(repositories.map(repo => pathKey(repo.path)))
    for (const repo of extra.repositories) {
      if (seen.has(pathKey(repo.path))) continue
      seen.add(pathKey(repo.path))
      repositories.push({ ...repo, source: 'temporary' })
    }
    return {
      ...base, repositories, warnings: [...base.warnings, ...extra.warnings],
      roots: [...new Map([...base.roots, ...extra.roots].map(root => [pathKey(root), root])).values()],
    }
  }

  /** All repositories outside the project live only in this agent's session. */
  async setTemporaryRepositories(agent: Agent, entries: NamedReviewRepository[]): Promise<ReviewWorkspace> {
    const current = await this.project(agent)
    if (!current.configured) throw new Error('Enable this project before adding temporary repositories')
    const root = current.project.root
    const normalized: NamedReviewRepository[] = []
    for (const entry of entries) {
      const path = await canonicalRepositoryPath(root, entry.path)
      if (!isAbsolute(entry.path) || !isAbsolute(path)) {
        throw new Error('Temporary repositories must use absolute paths outside the project')
      }
      normalized.push({ ...entry, path })
    }
    this.temporaryRepositories.set(agentKey(agent), normalized)
    return this.workspace(agent)
  }

  /** Append one nested (Code Mode) file mutation for the receiving agent. */
  recordMutation(agent: Agent, mutation: RecordedMutation): void {
    const key = agentKey(agent)
    const list = this.recordLog.get(key)
    if (list === undefined) {
      this.recordLog.set(key, [mutation])
      return
    }
    list.push(mutation)
    if (list.length > RECORDED_PER_AGENT_CAP) {
      list.splice(0, list.length - RECORDED_PER_AGENT_CAP)
    }
  }

  /** Return the recorded mutations for the requested `run_code` roots. */
  async recorded(agent: Agent, request: RecordedRequest): Promise<RecordedResult> {
    const list = this.recordLog.get(agentKey(agent))
    if (list === undefined || request.rootCallIds.length === 0) return { mutations: [] }
    const wanted = new Set(request.rootCallIds)
    return { mutations: list.filter(mutation => wanted.has(mutation.rootCallId)) }
  }

  /** Inspect current disk state without changing files. */
  async status(agent: Agent, request: FileReviewRequest): Promise<FileReviewResult> {
    const cwd = sessionCwd(agent)
    const { roots } = await this.workspace(agent)
    const files = await Promise.all(request.files.map(file => inspectOne(cwd, file, roots)))
    return { files }
  }

  /** Toggle every independently safe file while the receiving Agent is idle. */
  async apply(agent: Agent, request: FileReviewRequest): Promise<FileReviewResult> {
    return agent.runMaintenance(async () => {
      const cwd = sessionCwd(agent)
      const { roots } = await this.workspace(agent)
      const files: FileReviewFileResult[] = []
      for (const file of request.files) files.push(await applyOne(cwd, file, request.action, roots))
      return { files }
    })
  }
}
