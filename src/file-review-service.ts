import { FILE_REVIEW_SERVICE_NAME } from './service-names.ts'
/** Host-side, workspace-contained undo / redo service for produced text diffs. */

import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { resolveTargetPaths, sessionCwd, type MultiGitRepoManager, type TargetPathResolution } from 'dsh-multi-git-repo-manager'
import type { FileReviewFileResult, FileReviewRequest, FileReviewResult, RecordedMutation, RecordedRequest, RecordedResult } from './change-types.ts'
import type { ReviewWorkspace } from './repository-types.ts'
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

/** Per-agent cap on recorded Code Mode mutations (oldest evicted first). */
const RECORDED_PER_AGENT_CAP = 4000

function agentKey(agent: Agent): string {
  return String(agent.id)
}

/** Host service published as the `multiGitFileReviewByWqz` Remote namespace. */
export class FileReviewService extends TypertRemoteService {
  /** Per-agent record of Code Mode (`run_code`) file mutations, dispatch order. */
  private readonly recordLog = new Map<string, RecordedMutation[]>()
  private readonly lifecycleLog = new Map<string, LifecycleRecordCache>()
  private readonly lifecycleIdentities = new Map<string, LifecycleImage>()

  constructor(
    ctx: Context,
    private readonly repositoryManager: Pick<MultiGitRepoManager, 'workspace'> & Partial<Pick<MultiGitRepoManager, 'resolveTargetPaths'>>,
  ) {
    super(ctx, FILE_REVIEW_SERVICE_NAME)
  }

  /** Every review operation uses the manager's authoritative session scope. */
  async workspace(agent: Agent): Promise<ReviewWorkspace> {
    return this.repositoryManager.workspace(agent)
  }

  async resolvePaths(agent: Agent, paths: string[]): Promise<TargetPathResolution[]> {
    return this.repositoryManager?.resolveTargetPaths
      ? this.repositoryManager.resolveTargetPaths(agent, paths)
      : resolveTargetPaths(await this.workspace(agent), sessionCwd(agent), paths)
  }

  /** Every read/capture/write gets the concrete owner's root, never a parent fallback. */
  async approvedRoots(agent: Agent, path: string): Promise<string[]> {
    const [owner] = await this.resolvePaths(agent, [path])
    return owner?.state === 'managed' && owner.target ? [owner.target.path] : []
  }

  /** Read Git differences only in repositories belonging to this session. */
  async gitReview(agent: Agent, request: GitReviewRequest): Promise<GitReviewResult> {
    return gitReview(await this.workspace(agent), sessionCwd(agent), request)
  }

  async gitReviewDiff(agent: Agent, request: GitReviewFileRequest): Promise<GitReviewDiff> {
    return gitReviewDiff(await this.workspace(agent), sessionCwd(agent), request)
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
      approvedRoots: () => this.approvedRoots(agent, request.path),
    })
  }

  async openEditor(agent: Agent, request: ReviewLocationRequest): Promise<ReviewLocationResult> {
    return openReferenceInEditor(request, {
      workspace: () => this.workspace(agent),
      cwd: () => sessionCwd(agent),
      approvedRoots: () => this.approvedRoots(agent, request.path),
      // Revalidation goes through the service method on every check.
      locateReference: () => this.locateReference(agent, request),
    })
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
    const owners = await this.resolvePaths(agent, request.files.map(file => file.path))
    const history = request.files.some(file => file.diffs.some(diff => diff.recordId))
      ? this.lifecycleHistory(agent)
      : undefined
    const files = await Promise.all(request.files.map(async (file, index) => {
      const owner = owners[index]
      const roots = owner?.state === 'managed' && owner.target ? [owner.target.path] : []
      if (!roots.length) return { path: file.path, state: 'unsupported' as const, changed: false, reason: 'File is outside the managed target scope' }
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
      const history = request.files.some(file => file.diffs.some(diff => diff.recordId))
        ? this.lifecycleHistory(agent)
        : undefined
      const files: FileReviewFileResult[] = []
      for (const file of request.files) {
        const roots = await this.approvedRoots(agent, file.path)
        if (!roots.length) { files.push({ path: file.path, state: 'unsupported', changed: false, reason: 'File is outside the managed target scope' }); continue }
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
