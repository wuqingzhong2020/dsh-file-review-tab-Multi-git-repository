/** Browser Typert contribution for the Host file-review service. */
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { RemoteResult, TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol';
import type { FileReviewRequest, FileReviewResult, RecordedRequest, RecordedResult } from './change-types.ts';
import type { GitReviewDiff, GitReviewFileRequest, GitReviewRequest, GitReviewResult } from './git-review-types.ts';
import type { ReviewLocationRequest, ReviewLocationResult } from './review-location.ts';
import type { UserGuideDocument } from './user-guide.ts';
declare module '@deepseek-ai/dsh-typert-protocol' {
    interface TypertRemoteNamespaceMap {
        fileReview: {
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
        'fileReview/userGuide': (agentId: SessionId, language: 'zh' | 'en') => Promise<RemoteResult<string>>;
        'fileReview/userGuideDocument': (agentId: SessionId, language: 'zh' | 'en') => Promise<RemoteResult<UserGuideDocument>>;
        'fileReview/locateReference': (agentId: SessionId, request: ReviewLocationRequest) => Promise<RemoteResult<ReviewLocationResult>>;
        'fileReview/openEditor': (agentId: SessionId, request: ReviewLocationRequest) => Promise<RemoteResult<ReviewLocationResult>>;
        'fileReview/gitReview': (agentId: SessionId, request: GitReviewRequest) => Promise<RemoteResult<GitReviewResult>>;
        'fileReview/gitReviewDiff': (agentId: SessionId, request: GitReviewFileRequest) => Promise<RemoteResult<GitReviewDiff>>;
        'fileReview/status': (agentId: SessionId, request: FileReviewRequest) => Promise<RemoteResult<FileReviewResult>>;
        'fileReview/apply': (agentId: SessionId, request: FileReviewRequest) => Promise<RemoteResult<FileReviewResult>>;
        'fileReview/recorded': (agentId: SessionId, request: RecordedRequest) => Promise<RemoteResult<RecordedResult>>;
    }
    interface TypertRemoteScopeMap {
        'agent:fileReview/userGuide': (language: 'zh' | 'en') => Promise<RemoteResult<string>>;
        'agent:fileReview/userGuideDocument': (language: 'zh' | 'en') => Promise<RemoteResult<UserGuideDocument>>;
        'agent:fileReview/locateReference': (request: ReviewLocationRequest) => Promise<RemoteResult<ReviewLocationResult>>;
        'agent:fileReview/openEditor': (request: ReviewLocationRequest) => Promise<RemoteResult<ReviewLocationResult>>;
        'agent:fileReview/gitReview': (request: GitReviewRequest) => Promise<RemoteResult<GitReviewResult>>;
        'agent:fileReview/gitReviewDiff': (request: GitReviewFileRequest) => Promise<RemoteResult<GitReviewDiff>>;
        'agent:fileReview/status': (request: FileReviewRequest) => Promise<RemoteResult<FileReviewResult>>;
        'agent:fileReview/apply': (request: FileReviewRequest) => Promise<RemoteResult<FileReviewResult>>;
        'agent:fileReview/recorded': (request: RecordedRequest) => Promise<RemoteResult<RecordedResult>>;
    }
}
export declare const TYPERT_REMOTE: TypertRemoteContribution;
export default TYPERT_REMOTE;
//# sourceMappingURL=remote.d.ts.map