/** Host-side, workspace-contained undo / redo service for produced text diffs. */

import { realpath } from 'node:fs/promises'
import { basename, isAbsolute } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import type {
  FileReviewFileResult,
  FileReviewRequest,
  FileReviewResult,
  RecordedMutation,
  RecordedRequest,
  RecordedResult,
} from './change-types.ts'
import type { RepositorySettings } from './repository-settings.ts'
import type {
  NamedReviewRepository,
  ReviewProject,
  ReviewProjectPage,
  ReviewWorkspace,
  SaveReviewProject,
} from './repository-types.ts'
import { pathKey, previewProject, resolveReviewWorkspace } from './repository-workspace.ts'
import {
  findProjectFile,
  PROJECT_FILE_NAME,
  readProjectFile,
  writeProjectFile,
} from './repository-project-file.ts'
import { canonicalRepositoryPath } from './repository-path-policy.ts'
import { resolveDirectoryStart } from './repository-directory.ts'
import { gitReview, gitReviewDiff } from './git-review.ts'
import type {
  GitReviewDiff,
  GitReviewFileRequest,
  GitReviewRequest,
  GitReviewResult,
} from './git-review-types.ts'
import type { ReviewLocationRequest, ReviewLocationResult } from './review-location.ts'
import type { UserGuideDocument } from './user-guide.ts'
import { inspectReviewFile, applyReviewFile } from './file-review-files.ts'
import { locateReferenceOnDisk, openReferenceInEditor } from './file-review-locations.ts'
import { userGuidePath, readUserGuideDocument } from './file-review-user-guide.ts'
import { MARKER_MAX_BYTES, type LifecycleImage, type LifecycleRecord } from './lifecycle-record.ts'
import { LifecycleRecordCache, replayLifecycleHistory, lifecycleMutation } from './lifecycle-history.ts'
import { applyLifecycle } from './file-lifecycle.ts'

// Preserve the existing Host entry point for callers of the pure transform.
export { transformFile } from './file-review-files.ts'

function sessionCwd(agent: Agent): string {
  const cwd = agent.session.header.cwd
  if (cwd === undefined || cwd.trim() === '') {
    throw new Error('session has no workspace directory')
  }
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
  private readonly lifecycleLog = new Map<string, LifecycleRecordCache>()
  private readonly lifecycleIdentities = new Map<string, LifecycleImage>()

  constructor(
    ctx: Context,
    private readonly projectSettings?: RepositorySettings,
  ) {
    super(ctx, 'fileReview')
  }

  /** Read only the project selected by this Agent's authoritative directory. */
  async project(agent: Agent): Promise<ReviewProjectPage> {
    const settings = this.projectSettings?.get() ?? { projects: [], revision: 0 }
    const cwd = sessionCwd(agent)
    const root = await realpath(cwd)
    const localFile = await findProjectFile(root)
    const matched = await resolveReviewWorkspace(cwd, settings.projects)
    let project: ReviewProject
    if (localFile !== null) {
      project = localFile.project
    } else if (matched.project !== null) {
      project = { ...matched.project, name: basename(matched.project.root) }
    } else {
      project = {
        name: basename(root),
        root,
        includeProjectRoot: true,
        configFiles: [],
        repositories: [],
        enabled: true,
      }
    }
    const workspace =
      localFile !== null && project.enabled !== false
        ? await this.workspace(agent)
        : await previewProject(project)
    return {
      project,
      revision: settings.revision,
      configured: localFile !== null,
      workspace,
      fileRevision: localFile?.revision ?? '',
      temporaryRepositories:
        localFile !== null
          ? (this.temporaryRepositories.get(agentKey(agent)) ?? localFile.temporaryRepositories)
          : [],
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

  /** Open the shipped manual, independently of the session's project directory. */
  async userGuide(_agent: Agent, language: 'zh' | 'en'): Promise<string> {
    return userGuidePath(language)
  }

  /** The Desktop Markdown preview cannot load sidebar media URLs from its app protocol. */
  async userGuideDocument(agent: Agent, language: 'zh' | 'en'): Promise<UserGuideDocument> {
    const path = await this.userGuide(agent, language)
    return readUserGuideDocument(path)
  }

  /** Verify references against disk without writing project files. */
  async locateReference(
    agent: Agent,
    request: ReviewLocationRequest,
  ): Promise<ReviewLocationResult> {
    return locateReferenceOnDisk(request, {
      workspace: () => this.workspace(agent),
      cwd: () => sessionCwd(agent),
    })
  }

  async openEditor(agent: Agent, request: ReviewLocationRequest): Promise<ReviewLocationResult> {
    return openReferenceInEditor(request, {
      workspace: () => this.workspace(agent),
      cwd: () => sessionCwd(agent),
      // Revalidation goes through the service method on every check.
      locateReference: () => this.locateReference(agent, request),
    })
  }

  /** Preview and save cannot choose another project's root through the wire. */
  async preview(agent: Agent, project: ReviewProject): Promise<ReviewWorkspace> {
    const current = await this.project(agent)
    if (pathKey(await realpath(project.root)) !== pathKey(current.project.root)) {
      throw new Error('Project root does not belong to this session')
    }
    return previewProject({ ...project, name: current.project.name, root: current.project.root })
  }

  async saveProject(agent: Agent, request: SaveReviewProject): Promise<ReviewProjectPage> {
    const preview = await this.preview(agent, {
      ...request.project,
      configFiles: [],
      repositories: [],
    })
    const project = preview.project!
    await writeProjectFile(
      {
        ...project,
        enabled: request.project.enabled ?? project.enabled ?? true,
        namedRepositories: project.namedRepositories?.filter(entry => !isAbsolute(entry.path)),
      },
      request.fileRevision,
    )
    if (this.projectSettings !== undefined) {
      const settings = this.projectSettings.get()
      const index = settings.projects.findIndex(
        item => pathKey(item.root) === pathKey(project.root),
      )
      const projects = [...settings.projects]
      const indexEntry = {
        name: project.name,
        root: project.root,
        includeProjectRoot: project.includeProjectRoot,
        configFiles: [PROJECT_FILE_NAME],
        repositories: [],
        enabled: request.project.enabled ?? project.enabled ?? true,
      }
      if (index === -1) {
        projects.push(indexEntry)
      } else {
        projects[index] = indexEntry
      }
      // The project-local file is authoritative; the profile keeps its index.
      try {
        await this.projectSettings.save({ projects, revision: settings.revision })
      } catch {
        // The local file remains usable if updating the profile index fails.
      }
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
      name: base.project.name,
      root: base.project.root,
      includeProjectRoot: false,
      configFiles: [],
      repositories: [],
      namedRepositories: temporary,
    })
    const repositories = [...base.repositories]
    const seen = new Set(repositories.map(repo => pathKey(repo.path)))
    for (const repo of extra.repositories) {
      if (seen.has(pathKey(repo.path))) continue
      seen.add(pathKey(repo.path))
      repositories.push({ ...repo, source: 'temporary' })
    }
    return {
      ...base,
      repositories,
      warnings: [...base.warnings, ...extra.warnings],
      roots: [
        ...new Map([...base.roots, ...extra.roots].map(root => [pathKey(root), root])).values(),
      ],
    }
  }

  /** All repositories outside the project live only in this agent's session. */
  async setTemporaryRepositories(
    agent: Agent,
    entries: NamedReviewRepository[],
  ): Promise<ReviewWorkspace> {
    const current = await this.project(agent)
    if (!current.configured) {
      throw new Error('Enable this project before adding temporary repositories')
    }
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
    if (Buffer.byteLength(JSON.stringify(mutation)) > MARKER_MAX_BYTES) {
      mutation = {
        ...mutation,
        before: null,
        after: '',
        complete: false,
        reason: 'legacy mutation exceeds the 256 KiB capture budget',
      }
    }
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

  recordLifecycle(agent: Agent, record: LifecycleRecord): void {
    const key = agentKey(agent)
    let cache = this.lifecycleLog.get(key)
    if (!cache) {
      cache = new LifecycleRecordCache()
      this.lifecycleLog.set(key, cache)
    }
    cache.add(record)
  }

  private lifecycleHistory(agent: Agent) {
    return replayLifecycleHistory(
      String(agent.session.header.id),
      agent.session.snapshotEvents?.() ?? [],
      this.lifecycleLog?.get(agentKey(agent))?.records(),
    )
  }

  /** Replay only accepted official tool settlements, never client-supplied markers. */
  lifecycleRecords(agent: Agent): LifecycleRecord[] {
    return [...this.lifecycleHistory(agent).records]
  }

  /** Return the recorded mutations for the requested `run_code` roots. */
  async recorded(agent: Agent, request: RecordedRequest): Promise<RecordedResult> {
    const history = this.lifecycleHistory(agent)
    const lifecycle = history.records
    const covered = new Set(lifecycle.map(record => `${record.rootCallId}\0${record.path}`))
    const list: RecordedMutation[] = [
      ...lifecycle.map(lifecycleMutation),
      ...(this.recordLog.get(agentKey(agent)) ?? []).filter(record => !covered.has(`${record.rootCallId}\0${record.path}`)),
    ]
    const wanted = new Set(request.rootCallIds)
    return {
      mutations: list.filter(mutation => wanted.has(mutation.rootCallId)),
      ...(history.truncated ? {
        warnings: ['Only the most recent 4000 lifecycle records are available; older nested changes may lack review images.'],
      } : {}),
    }
  }

  /** Inspect current disk state without changing files. */
  async status(agent: Agent, request: FileReviewRequest): Promise<FileReviewResult> {
    const cwd = sessionCwd(agent)
    const { roots } = await this.workspace(agent)
    const history = request.files.some(file => file.diffs.some(diff => diff.recordId))
      ? this.lifecycleHistory(agent)
      : undefined
    const files = await Promise.all(request.files.map(file => {
      const records = history?.sequence(file) ?? null
      return records === null
        ? inspectReviewFile(cwd, file, roots)
        : applyLifecycle(cwd, file.path, roots, records)
    }))
    return { files }
  }

  /** Toggle every independently safe file while the receiving Agent is idle. */
  async apply(agent: Agent, request: FileReviewRequest): Promise<FileReviewResult> {
    return agent.runMaintenance(async () => {
      const cwd = sessionCwd(agent)
      const { roots } = await this.workspace(agent)
      const history = request.files.some(file => file.diffs.some(diff => diff.recordId))
        ? this.lifecycleHistory(agent)
        : undefined
      const files: FileReviewFileResult[] = []
      for (const file of request.files) {
        const records = history?.sequence(file) ?? null
        const result = records === null
          ? await applyReviewFile(cwd, file, request.action, roots)
          : await applyLifecycle(cwd, file.path, roots, records, request.action, this.lifecycleIdentities)
        files.push(result)
      }
      return { files }
    })
  }
}
