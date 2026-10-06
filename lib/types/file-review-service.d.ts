/** Host-side, workspace-contained undo / redo service for produced text diffs. */
import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { ManagedWorkspaceReader, TargetPathResolution } from 'dsh-multi-git-repo-manager/types';
import type { FileReviewRequest, FileReviewResult, RecordedMutation, RecordedRequest, RecordedResult } from './change-types.ts';
import type { ManagedWorkspace } from 'dsh-multi-git-repo-manager/types';
import type { GitReviewDiff, GitReviewFileRequest, GitReviewRequest, GitReviewResult } from './git-review-types.ts';
import type { ReviewLocationRequest, ReviewLocationResult } from './review-location.ts';
import type { UserGuideDocument } from './user-guide.ts';
import { type LifecycleRecord } from './lifecycle-record.ts';
export { transformFile } from './file-review-files.ts';
/** Host service published as the `multiGitFileReviewByWqz` Remote namespace. */
export declare class FileReviewService extends TypertRemoteService {
    private readonly repositoryManager;
    /** Per-agent record of Code Mode (`run_code`) file mutations, dispatch order. */
    private readonly recordLog;
    private readonly lifecycleLog;
    private readonly lifecycleIdentities;
    constructor(ctx: Context, repositoryManager: ManagedWorkspaceReader);
    /** Every review operation uses the manager's authoritative session scope. */
    workspace(agent: Agent): Promise<ManagedWorkspace>;
    resolvePaths(agent: Agent, paths: string[]): Promise<TargetPathResolution[]>;
    /** Every read/capture/write gets the concrete owner's root, never a parent fallback. */
    approvedRoots(agent: Agent, path: string): Promise<string[]>;
    /** Read Git differences only in repositories belonging to this session. */
    gitReview(agent: Agent, request: GitReviewRequest): Promise<GitReviewResult>;
    gitReviewDiff(agent: Agent, request: GitReviewFileRequest): Promise<GitReviewDiff>;
    /** Open the shipped manual, independently of the session's project directory. */
    userGuide(_agent: Agent, language: 'zh' | 'en'): Promise<string>;
    /** The Desktop Markdown preview cannot load sidebar media URLs from its app protocol. */
    userGuideDocument(agent: Agent, language: 'zh' | 'en'): Promise<UserGuideDocument>;
    /** Verify references against disk without writing project files. */
    locateReference(agent: Agent, request: ReviewLocationRequest): Promise<ReviewLocationResult>;
    openEditor(agent: Agent, request: ReviewLocationRequest): Promise<ReviewLocationResult>;
    /** Append one nested (Code Mode) file mutation for the receiving agent. */
    recordMutation(agent: Agent, mutation: RecordedMutation): void;
    recordLifecycle(agent: Agent, record: LifecycleRecord): void;
    private lifecycleHistory;
    /** Replay only accepted official tool settlements, never client-supplied markers. */
    lifecycleRecords(agent: Agent): LifecycleRecord[];
    /** Return the recorded mutations for the requested `run_code` roots. */
    recorded(agent: Agent, request: RecordedRequest): Promise<RecordedResult>;
    /** Inspect current disk state without changing files. */
    status(agent: Agent, request: FileReviewRequest): Promise<FileReviewResult>;
    /** Toggle every independently safe file while the receiving Agent is idle. */
    apply(agent: Agent, request: FileReviewRequest): Promise<FileReviewResult>;
}
//# sourceMappingURL=file-review-service.d.ts.map