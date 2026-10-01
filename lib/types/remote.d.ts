/** Browser Typert contribution for the Host file-review service. */
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { RemoteResult, TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol';
import type { FileReviewRequest, FileReviewResult, RecordedRequest, RecordedResult } from './change-types.ts';
import type { NamedReviewRepository, ReviewProjectPage, ReviewWorkspace, SaveReviewProject } from './repository-types.ts';
declare module '@deepseek-ai/dsh-typert-protocol' {
    interface TypertRemoteNamespaceMap {
        fileReview: {
            project: (agentId: SessionId) => Promise<RemoteResult<ReviewProjectPage>>;
            saveProject: (agentId: SessionId, request: SaveReviewProject) => Promise<RemoteResult<ReviewProjectPage>>;
            setTemporaryRepositories: (agentId: SessionId, entries: NamedReviewRepository[]) => Promise<RemoteResult<ReviewWorkspace>>;
            workspace: (agentId: SessionId) => Promise<RemoteResult<ReviewWorkspace>>;
            status: (agentId: SessionId, request: FileReviewRequest) => Promise<RemoteResult<FileReviewResult>>;
            apply: (agentId: SessionId, request: FileReviewRequest) => Promise<RemoteResult<FileReviewResult>>;
            recorded: (agentId: SessionId, request: RecordedRequest) => Promise<RemoteResult<RecordedResult>>;
        };
    }
    interface TypertRemoteMap {
        'fileReview/project': (agentId: SessionId) => Promise<RemoteResult<ReviewProjectPage>>;
        'fileReview/saveProject': (agentId: SessionId, request: SaveReviewProject) => Promise<RemoteResult<ReviewProjectPage>>;
        'fileReview/setTemporaryRepositories': (agentId: SessionId, entries: NamedReviewRepository[]) => Promise<RemoteResult<ReviewWorkspace>>;
        'fileReview/workspace': (agentId: SessionId) => Promise<RemoteResult<ReviewWorkspace>>;
        'fileReview/status': (agentId: SessionId, request: FileReviewRequest) => Promise<RemoteResult<FileReviewResult>>;
        'fileReview/apply': (agentId: SessionId, request: FileReviewRequest) => Promise<RemoteResult<FileReviewResult>>;
        'fileReview/recorded': (agentId: SessionId, request: RecordedRequest) => Promise<RemoteResult<RecordedResult>>;
    }
    interface TypertRemoteScopeMap {
        'agent:fileReview/project': () => Promise<RemoteResult<ReviewProjectPage>>;
        'agent:fileReview/saveProject': (request: SaveReviewProject) => Promise<RemoteResult<ReviewProjectPage>>;
        'agent:fileReview/setTemporaryRepositories': (entries: NamedReviewRepository[]) => Promise<RemoteResult<ReviewWorkspace>>;
        'agent:fileReview/workspace': () => Promise<RemoteResult<ReviewWorkspace>>;
        'agent:fileReview/status': (request: FileReviewRequest) => Promise<RemoteResult<FileReviewResult>>;
        'agent:fileReview/apply': (request: FileReviewRequest) => Promise<RemoteResult<FileReviewResult>>;
        'agent:fileReview/recorded': (request: RecordedRequest) => Promise<RemoteResult<RecordedResult>>;
    }
}
export declare const TYPERT_REMOTE: TypertRemoteContribution;
export default TYPERT_REMOTE;
//# sourceMappingURL=remote.d.ts.map