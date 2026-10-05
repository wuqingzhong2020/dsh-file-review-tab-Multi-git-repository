import { FILE_REVIEW_SERVICE_NAME } from './service-names.ts';
/** Browser Typert contribution for the Host file-review service. */
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { RemoteResult, TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol';
import type { FileReviewRequest, FileReviewResult, RecordedRequest, RecordedResult } from './change-types.ts';
import type { GitReviewDiff, GitReviewFileRequest, GitReviewRequest, GitReviewResult } from './git-review-types.ts';
import type { ReviewLocationRequest, ReviewLocationResult } from './review-location.ts';
import type { UserGuideDocument } from './user-guide.ts';
declare module '@deepseek-ai/dsh-typert-protocol' {
    interface TypertRemoteNamespaceMap {
        [FILE_REVIEW_SERVICE_NAME]: {
            userGuide: (agentId: SessionId, language: 'zh' | 'en') => Promise<RemoteResult<string>>;
            userGuideDocument: (agentId: SessionId, language: 'zh' | 'en') => Promise<RemoteResult<UserGuideDocument>>;
            locateReference: (agentId: SessionId, request: ReviewLocationRequest) => Promise<RemoteResult<ReviewLocationResult>>;
            openEditor: (agentId: SessionId, request: ReviewLocationRequest) => Promise<RemoteResult<ReviewLocationResult>>;
            gitReview: (agentId: SessionId, request: GitReviewRequest) => Promise<RemoteResult<GitReviewResult>>;
            gitReviewDiff: (agentId: SessionId, request: GitReviewFileRequest) => Promise<RemoteResult<GitReviewDiff>>;
            status: (agentId: SessionId, request: FileReviewRequest) => Promise<RemoteResult<FileReviewResult>>;
            apply: (agentId: SessionId, request: FileReviewRequest) => Promise<RemoteResult<FileReviewResult>>;
            recorded: (agentId: SessionId, request: RecordedRequest) => Promise<RemoteResult<RecordedResult>>;
        };
    }
    interface TypertRemoteMap {
        'multiGitFileReviewByWqz/userGuide': (agentId: SessionId, language: 'zh' | 'en') => Promise<RemoteResult<string>>;
        'multiGitFileReviewByWqz/userGuideDocument': (agentId: SessionId, language: 'zh' | 'en') => Promise<RemoteResult<UserGuideDocument>>;
        'multiGitFileReviewByWqz/locateReference': (agentId: SessionId, request: ReviewLocationRequest) => Promise<RemoteResult<ReviewLocationResult>>;
        'multiGitFileReviewByWqz/openEditor': (agentId: SessionId, request: ReviewLocationRequest) => Promise<RemoteResult<ReviewLocationResult>>;
        'multiGitFileReviewByWqz/gitReview': (agentId: SessionId, request: GitReviewRequest) => Promise<RemoteResult<GitReviewResult>>;
        'multiGitFileReviewByWqz/gitReviewDiff': (agentId: SessionId, request: GitReviewFileRequest) => Promise<RemoteResult<GitReviewDiff>>;
        'multiGitFileReviewByWqz/status': (agentId: SessionId, request: FileReviewRequest) => Promise<RemoteResult<FileReviewResult>>;
        'multiGitFileReviewByWqz/apply': (agentId: SessionId, request: FileReviewRequest) => Promise<RemoteResult<FileReviewResult>>;
        'multiGitFileReviewByWqz/recorded': (agentId: SessionId, request: RecordedRequest) => Promise<RemoteResult<RecordedResult>>;
    }
    interface TypertRemoteScopeMap {
        'agent:multiGitFileReviewByWqz/userGuide': (language: 'zh' | 'en') => Promise<RemoteResult<string>>;
        'agent:multiGitFileReviewByWqz/userGuideDocument': (language: 'zh' | 'en') => Promise<RemoteResult<UserGuideDocument>>;
        'agent:multiGitFileReviewByWqz/locateReference': (request: ReviewLocationRequest) => Promise<RemoteResult<ReviewLocationResult>>;
        'agent:multiGitFileReviewByWqz/openEditor': (request: ReviewLocationRequest) => Promise<RemoteResult<ReviewLocationResult>>;
        'agent:multiGitFileReviewByWqz/gitReview': (request: GitReviewRequest) => Promise<RemoteResult<GitReviewResult>>;
        'agent:multiGitFileReviewByWqz/gitReviewDiff': (request: GitReviewFileRequest) => Promise<RemoteResult<GitReviewDiff>>;
        'agent:multiGitFileReviewByWqz/status': (request: FileReviewRequest) => Promise<RemoteResult<FileReviewResult>>;
        'agent:multiGitFileReviewByWqz/apply': (request: FileReviewRequest) => Promise<RemoteResult<FileReviewResult>>;
        'agent:multiGitFileReviewByWqz/recorded': (request: RecordedRequest) => Promise<RemoteResult<RecordedResult>>;
    }
}
export declare const TYPERT_REMOTE: TypertRemoteContribution;
export default TYPERT_REMOTE;
export { FILE_REVIEW_SERVICE_NAME, FILE_REVIEW_REMOTE_NAMESPACE } from './service-names.ts';
//# sourceMappingURL=remote.d.ts.map