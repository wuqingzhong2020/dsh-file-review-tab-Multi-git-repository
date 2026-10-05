//#region src/service-names.ts
/** Package-owned identities allow this plugin to coexist with the original file review. */
const FILE_REVIEW_SERVICE_NAME = "multiGitFileReviewByWqz";
const FILE_REVIEW_REMOTE_NAMESPACE = `remote.${FILE_REVIEW_SERVICE_NAME}`;
const FILE_REVIEW_CHAT_LOCALE_NAMESPACE = `${FILE_REVIEW_SERVICE_NAME}.chat`;
//#endregion
//#region src/review-scopes.ts
/** Property order is the review menu order; persisted IDs must not be renamed. */
const REVIEW_SCOPES = {
	"last-turn": {
		source: "session",
		label: "reviewLastTurn"
	},
	session: {
		source: "session",
		label: "reviewSession"
	},
	pending: {
		source: "session",
		label: "reviewPending"
	},
	uncommitted: {
		source: "git",
		label: "reviewUncommitted",
		reference: "none",
		workingTree: true
	},
	unstaged: {
		source: "git",
		label: "reviewUnstaged",
		reference: "none",
		workingTree: true
	},
	staged: {
		source: "git",
		label: "reviewStaged",
		reference: "none",
		workingTree: false
	},
	commit: {
		source: "git",
		label: "reviewCommit",
		reference: "commit",
		workingTree: false
	},
	branch: {
		source: "git",
		label: "reviewBranch",
		reference: "branch",
		workingTree: false
	}
};
const REVIEW_MODES = Object.keys(REVIEW_SCOPES);
function isReviewMode(value) {
	return typeof value === "string" && Object.hasOwn(REVIEW_SCOPES, value);
}
function isGitReviewMode(value) {
	return isReviewMode(value) && REVIEW_SCOPES[value].source === "git";
}
function usesWorkingTree(mode) {
	const scope = REVIEW_SCOPES[mode];
	return scope.source === "git" && scope.workingTree;
}
const GIT_REVIEW_MODES = REVIEW_MODES.filter(isGitReviewMode);
//#endregion
//#region src/user-guide.ts
const USER_GUIDE_IMAGES = [
	"01-file-review-overview.jpg",
	"02-git-review-scope.jpg",
	"03-multi-repository-settings.jpg",
	"04-unified-diff-context-controls.jpg",
	"05-expanded-context-collapse.jpg",
	"06-split-diff-search.jpg",
	"07-line-selection-context-menu.jpg",
	"08-diff-appearance-settings.jpg",
	"09-external-editor-settings.jpg",
	"10-range-comment-editor.jpg",
	"11-pending-review-comments.jpg",
	"12-review-discussion-history.jpg",
	"13-review-enhancements-zh.jpg",
	"14-review-enhancements-en.jpg",
	"15-profile-settings-zh.jpg",
	"16-profile-settings-en.jpg",
	"17-review-packet-zh.jpg",
	"18-review-packet-en.jpg"
];
//#endregion
export { FILE_REVIEW_CHAT_LOCALE_NAMESPACE as a, usesWorkingTree as i, GIT_REVIEW_MODES as n, FILE_REVIEW_REMOTE_NAMESPACE as o, REVIEW_SCOPES as r, FILE_REVIEW_SERVICE_NAME as s, USER_GUIDE_IMAGES as t };
