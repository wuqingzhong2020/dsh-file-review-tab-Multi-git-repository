/** Host-side, workspace-contained undo / redo service for produced text diffs. */
import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { FileReviewRequest, FileReviewResult, RecordedMutation, RecordedRequest, RecordedResult } from './change-types.ts';
import type { RepositorySettings } from './repository-settings.ts';
import type { NamedReviewRepository, ReviewProject, ReviewProjectPage, ReviewWorkspace, SaveReviewProject } from './repository-types.ts';
import type { GitReviewDiff, GitReviewFileRequest, GitReviewRequest, GitReviewResult } from './git-review-types.ts';
import type { ReviewLocationRequest, ReviewLocationResult } from './review-location.ts';
import type { UserGuideDocument } from './user-guide.ts';
import { type LifecycleRecord } from './lifecycle-record.ts';
export { transformFile } from './file-review-files.ts';
/** Host service published as the `fileReview` Remote namespace. */
export declare class FileReviewService extends TypertRemoteService {
    private readonly projectSettings?;
    /** Per-agent record of Code Mode (`run_code`) file mutations, dispatch order. */
    private readonly recordLog;
    private readonly temporaryRepositories;
    private readonly lifecycleLog;
    private readonly lifecycleIdentities;
    constructor(ctx: Context, projectSettings?: RepositorySettings | undefined);
    /** Read only the project selected by this Agent's authoritative directory. */
    project(agent: Agent): Promise<ReviewProjectPage>;
    /** Read Git differences only in repositories belonging to this session. */
    gitReview(agent: Agent, request: GitReviewRequest): Promise<GitReviewResult>;
    gitReviewDiff(agent: Agent, request: GitReviewFileRequest): Promise<GitReviewDiff>;
    directoryStart(agent: Agent, path: string): Promise<string>;
    /** Open the shipped manual, independently of the session's project directory. */
    userGuide(_agent: Agent, language: 'zh' | 'en'): Promise<string>;
    /** The Desktop Markdown preview cannot load sidebar media URLs from its app protocol. */
    userGuideDocument(agent: Agent, language: 'zh' | 'en'): Promise<UserGuideDocument>;
    /** Verify references against disk without writing project files. */
    locateReference(agent: Agent, request: ReviewLocationRequest): Promise<ReviewLocationResult>;
    openEditor(agent: Agent, request: ReviewLocationRequest): Promise<ReviewLocationResult>;
    /** Preview and save cannot choose another project's root through the wire. */
    preview(agent: Agent, project: ReviewProject): Promise<ReviewWorkspace>;
    saveProject(agent: Agent, request: SaveReviewProject): Promise<ReviewProjectPage>;
    workspace(agent: Agent): Promise<ReviewWorkspace>;
    /** All repositories outside the project live only in this agent's session. */
    setTemporaryRepositories(agent: Agent, entries: NamedReviewRepository[]): Promise<ReviewWorkspace>;
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