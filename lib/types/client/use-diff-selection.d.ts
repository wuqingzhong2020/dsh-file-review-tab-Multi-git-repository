import { type RefObject } from 'react';
import type { ProducedFileDiff } from '../change-types.ts';
import type { ReviewLocationResult } from '../review-location.ts';
import type { useReviewInteractions } from './ReviewComments.tsx';
import type { DiffIndex, DiffLocation } from './diff-navigation.ts';
import type { ReviewCommentTarget } from './review-comments.ts';
import type { UnifiedLine } from './unified-diff-model.ts';
type ReferenceSide = 'old' | 'new';
interface DiffSelectionOptions {
    readonly diffs: readonly ProducedFileDiff[];
    readonly identity: string;
    readonly revision: string;
    readonly index: DiffIndex;
    readonly reviewTarget: ReviewCommentTarget | undefined;
    readonly isSplit: boolean;
    readonly editorPath: string;
    readonly interactions: ReturnType<typeof useReviewInteractions>;
    readonly container: RefObject<HTMLDivElement>;
    readonly lineElements: RefObject<Map<string, HTMLDivElement>>;
}
/** Own one file's reference, menu focus and asynchronous editor feedback. */
export declare function useDiffSelection({ diffs, identity, revision, index, reviewTarget, isSplit, editorPath, interactions, container, lineElements, }: DiffSelectionOptions): {
    reference: import("./review-reference.ts").ReviewReference | null;
    referenceNotice: "undo" | "redo" | "reviewLastTurn" | "reviewSession" | "reviewPending" | "reviewUncommitted" | "reviewUnstaged" | "reviewStaged" | "reviewCommit" | "reviewBranch" | "repository" | "unavailable" | "files" | "editorPath" | "userGuide" | "appearance" | "diffFontSize" | "diffFontFamily" | "diffSystemMono" | "diffFontHint" | "diffLineHeight" | "diffTabSize" | "diffColors" | "diffThemeColors" | "diffAccessibleColors" | "diffColorStrength" | "externalEditor" | "editorAutoDetect" | "editorPathHint" | "diffShortcuts" | "diffScopedShortcuts" | "diffVirtualize" | "diffReset" | "diffPreferencesStorageError" | "referenceSelect" | "referenceHint" | "referenceRange" | "referenceCopy" | "referenceCopyPath" | "referenceComment" | "referenceClear" | "referenceInvalid" | "referenceCopied" | "referenceCopyFailed" | "editorOpenLine" | "editorOpenSelection" | "editorOpenFile" | "editorOpening" | "editorStarted" | "editorMoved" | "editorConfirmMoved" | "editorMissing" | "editorUnavailable" | "editorChanged" | "editorAmbiguous" | "editorOld" | "editorUnsupported" | "editorFailed" | "discussionEnabled" | "discussionList" | "discussionEmpty" | "discussionHint" | "discussionStorageError" | "discussionSubmitting" | "discussionQueued" | "discussionRunning" | "discussionAnswered" | "discussionCompleted" | "discussionCancelled" | "discussionFailed" | "discussionUnknown" | "discussionResolved" | "discussionUnresolved" | "discussionResolve" | "discussionReopen" | "discussionUnread" | "discussionRead" | "discussionReply" | "discussionRetry" | "discussionResponse" | "discussionInterrupted" | "discussionReadOriginal" | "discussionNoCorrelation" | "referenceRelocate" | "referenceRelocateApply" | "referenceExact" | "referenceHistorical" | "tabTitle" | "userGuideOpening" | "userGuideHint" | "userGuideFailed" | "userGuideServiceUnavailable" | "userGuideClose" | "userGuideCloseLegacy" | "userGuideChapter" | "userGuideLegacyHint" | "sidebarGuideDescription" | "sidebarUnavailable" | "sidebarSessionNotVisible" | "sidebarWorkspaceUnavailable" | "sidebarOpenFailed" | "sidebarTargetMissing" | "userGuideImageOpen" | "userGuideImageDialog" | "userGuideImageClose" | "userGuideImageLoading" | "userGuideImageFailed" | "userGuideCodeCopy" | "userGuideFootnotes" | "commentAddLine" | "commentAddFile" | "commentWholeFile" | "commentOldLine" | "commentNewLine" | "commentYou" | "commentPlaceholder" | "commentAdd" | "commentSave" | "commentEdit" | "commentDraft" | "commentPending" | "commentSubmit" | "commentSending" | "commentList" | "commentEmpty" | "commentDraftHint" | "commentSendHint" | "commentFinishEditing" | "commentSent" | "commentSendFailed" | "commentStorageError" | "commentChanged" | "commentFile" | "commentSource" | "commentReference" | "commentOpinion" | "commentPrompt" | "reviewScope" | "reviewPendingHint" | "pendingEmpty" | "pendingRepoEmpty" | "confirmTurn" | "unconfirmTurn" | "turnConfirmed" | "confirmTurnHint" | "unconfirmTurnHint" | "confirmTurnLive" | "confirmationStorageError" | "reviewHead" | "reviewAutoBranch" | "reviewSelectRepository" | "reviewGitHint" | "reviewRepoCount" | "reviewLoading" | "reviewGitEmpty" | "reviewNoGit" | "reviewFiles" | "reviewBinary" | "reviewBinaryHint" | "reviewMetadataOnly" | "empty" | "lastTurnEmpty" | "lastTurnRepoEmpty" | "sessionUnavailable" | "remoteUnavailable" | "turn" | "turnLive" | "filesOne" | "undoing" | "redoing" | "undoTurn" | "redoTurn" | "toggleUnavailable" | "stateUndone" | "stateConflict" | "stateUnsupported" | "stateError" | "deleted" | "deletedHint" | "archived" | "archivedExpand" | "archivedCollapse" | "loadMore" | "undoSuccess" | "redoSuccess" | "undoPartial" | "redoPartial" | "toggleError" | "openInEditor" | "open" | "copy" | "copied" | "showUnchanged" | "hideUnchanged" | "expandContext" | "expandAllContextUp" | "expandAllContextDown" | "collapseContextGap" | "diffSettings" | "diffSettingsSave" | "diffContextExpansionLines" | "diffContextExpansionHint" | "collapseContext" | "unavailableContext" | "diffLayout" | "diffSplit" | "diffUnified" | "diffWrap" | "diffOld" | "diffNew" | "diffSearch" | "diffSearchShortcut" | "diffSearchQuery" | "diffSearchSide" | "diffSearchBoth" | "diffSearchCase" | "diffSearchWord" | "diffSearchCount" | "diffSearchLimited" | "diffSearchRecorded" | "diffSearchPrevious" | "diffSearchNext" | "diffSearchClose" | "diffPreviousChange" | "diffNextChange" | "diffPreviousChangeShortcut" | "diffNextChangeShortcut" | "diffChangeNavigation" | "diffChangeCount" | "diffChangePosition" | "diffSyntaxLanguage" | "diffPlainText" | "collapseRepositoryFiles" | "expandRepositoryFiles" | "collapseTurnRepositories" | "expandTurnRepositories" | "collapseAllRepositories" | "expandAllRepositories" | "stats" | "refresh" | "projectTab" | "projectCurrentRoot" | "projectIntro" | "projectSave" | "projectGenerate" | "projectReload" | "projectSaved" | "projectWorking" | "projectName" | "projectConfigFile" | "projectInactive" | "projectEnable" | "projectDisabledHint" | "projectIncludeRoot" | "projectFiles" | "projectFilesHint" | "projectRepos" | "projectReposHint" | "projectImportHint" | "projectAddRepo" | "projectOpenRepo" | "projectRemoveRepo" | "projectTemporary" | "projectTemporaryShort" | "projectTemporaryHint" | "projectPickerUnavailable" | "projectPickerInvalid" | "projectDeleteTitle" | "projectDeleteDescription" | "projectCancel" | "projectResolved" | "projectPath" | "projectState" | "projectRootSource" | "projectManual" | "repoReady" | "repoMissing" | "repoNotGit" | "repoAll" | "repoProject" | "unmanagedOperation" | "repoDirectories" | "directoryKind" | "directorySessionOnly" | "projectDirectoryHint" | "confirmSelectedFiles" | "repoOther" | "repoScope" | "repoFilterEmpty" | "repoSettingsHint" | "reviewPacketCount" | "reviewAttach" | "reviewClear" | "reviewAttachUnavailable" | "reviewRawCopy" | "reviewProfileHint" | "reviewAdaptive" | "reviewCreated" | "reviewModified" | "reviewDock" | "reviewFoldMessages" | "reviewCopyGroup" | "reviewCopyFailed" | "reviewCancelCopy" | null;
    editorResult: ReviewLocationResult | null;
    editorBusy: boolean;
    menuPoint: {
        x: number;
        y: number;
    } | null;
    menuOwner: RefObject<HTMLDivElement>;
    closeMenu: () => void;
    contextRow: (target: EventTarget | null) => {
        row: HTMLElement;
        location: DiffLocation;
        side: ReferenceSide;
    } | null;
    showMenu: (location: DiffLocation, side: ReferenceSide, row: HTMLElement, x: number, y: number) => boolean;
    showKeyboardMenu: (target: EventTarget | null) => boolean;
    selectLine: (row: UnifiedLine, side: ReferenceSide, extend: boolean) => void;
    selectedByDrag: () => void;
    openSelection: (allowRelocate?: boolean) => Promise<void>;
    copyReference: (pathOnly: boolean) => Promise<void>;
    clearSelection: () => void;
    commentSelection: () => void;
    openInternalFile: () => void;
    rowSelected: (row: UnifiedLine, targetSide: ReferenceSide | "unified") => boolean;
};
export type DiffSelectionController = ReturnType<typeof useDiffSelection>;
export {};
//# sourceMappingURL=use-diff-selection.d.ts.map