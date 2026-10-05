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
export { usesWorkingTree as i, GIT_REVIEW_MODES as n, REVIEW_SCOPES as r, USER_GUIDE_IMAGES as t };
