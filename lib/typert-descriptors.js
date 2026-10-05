import { z } from "zod";
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
//#region src/repository-schemas.ts
const path = z.string().trim().min(1).max(4096);
const namedReviewRepositorySchema = z.object({
	name: z.string().trim().min(1).max(120),
	path
});
const reviewProjectSchema = z.object({
	name: z.string().trim().max(120),
	root: path,
	includeProjectRoot: z.boolean(),
	configFiles: z.array(path).max(32),
	repositories: z.array(path).max(512),
	namedRepositories: z.array(namedReviewRepositorySchema).max(512).optional(),
	enabled: z.boolean().optional()
});
const reviewSettingsSchema = z.object({
	projects: z.array(reviewProjectSchema).max(64),
	revision: z.number().int().nonnegative()
});
const reviewWorkspaceSchema = z.object({
	project: reviewProjectSchema.nullable(),
	repositories: z.array(z.object({
		name: z.string(),
		path: z.string(),
		relativePath: z.string(),
		source: z.string(),
		state: z.enum([
			"ready",
			"missing",
			"notGit",
			"error"
		]),
		reason: z.string().optional()
	})),
	warnings: z.array(z.string()),
	roots: z.array(z.string())
});
const reviewProjectPageSchema = z.object({
	project: reviewProjectSchema,
	revision: z.number().int().nonnegative(),
	configured: z.boolean(),
	workspace: reviewWorkspaceSchema,
	fileRevision: z.string(),
	temporaryRepositories: z.array(namedReviewRepositorySchema).max(512)
});
const saveReviewProjectSchema = z.object({
	project: reviewProjectSchema,
	revision: z.number().int().nonnegative(),
	fileRevision: z.string()
});
//#endregion
//#region src/git-review-schemas.ts
const gitReviewRequestSchema = z.object({
	mode: z.enum(GIT_REVIEW_MODES),
	repository: z.string().max(4096).optional(),
	ref: z.string().min(1).max(1024).optional()
});
const gitReviewFileRequestSchema = gitReviewRequestSchema.extend({
	repository: z.string().max(4096),
	path: z.string().min(1).max(4096)
});
const gitReviewResultSchema = z.object({
	repositories: z.array(z.object({
		name: z.string(),
		path: z.string(),
		branch: z.string(),
		branches: z.array(z.string()),
		commits: z.array(z.object({
			oid: z.string(),
			subject: z.string(),
			date: z.string()
		}))
	})),
	files: z.array(z.object({
		repository: z.string(),
		path: z.string(),
		oldPath: z.string().optional(),
		status: z.string(),
		added: z.number(),
		removed: z.number(),
		binary: z.boolean(),
		untracked: z.boolean()
	})),
	warnings: z.array(z.string()),
	comparisons: z.array(z.string())
});
const gitReviewDiffSchema = z.object({
	diffs: z.array(z.object({
		path: z.string(),
		oldText: z.string().nullable(),
		newText: z.string(),
		oldStart: z.number().optional(),
		newStart: z.number().optional()
	})),
	binary: z.boolean(),
	note: z.string()
});
//#endregion
//#region src/typert-descriptors.ts
/** Strict Typert codecs shared by the Host and browser contribution artifacts. */
const PACKAGE_NAME = "dsh-file-review-tab-multi-git-repository";
const userGuideDocumentSchema = z.object({
	path: z.string().min(1).max(4096),
	markdown: z.string().max(524288),
	images: z.partialRecord(z.enum(USER_GUIDE_IMAGES.map((name) => `image/${name}`)), z.string().regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/).max(2097152))
});
const locationRequestSchema = z.object({
	repository: z.string().min(1).max(4096),
	path: z.string().min(1).max(4096),
	source: z.string().max(4096),
	side: z.enum(["old", "new"]),
	line: z.number().int().min(1).max(1e7),
	endLine: z.number().int().min(1).max(1e7),
	quote: z.string().max(65536),
	before: z.string().max(65536),
	after: z.string().max(65536),
	fullText: z.string().max(8388608).optional(),
	allowRelocate: z.boolean().optional(),
	editorPath: z.string().max(4096).optional()
});
const locationResultSchema = z.object({
	state: z.enum([
		"exact",
		"moved",
		"ambiguous",
		"changed",
		"missing",
		"unsupported",
		"started",
		"editor-missing",
		"error"
	]),
	line: z.number().int().min(1).optional(),
	endLine: z.number().int().min(1).optional(),
	reason: z.string().optional()
});
const diffSchema = z.object({
	path: z.string().min(1).max(4096),
	oldText: z.string().max(1048576).nullable(),
	newText: z.string().max(1048576),
	oldStart: z.number().int().min(1).optional(),
	newStart: z.number().int().min(1).optional(),
	recordId: z.string().uuid().optional(),
	sourceCallId: z.string().max(256).optional()
});
const requestSchema = z.object({
	action: z.enum(["undo", "redo"]),
	files: z.array(z.object({
		path: z.string().min(1).max(4096),
		diffs: z.array(diffSchema).max(4e3)
	})).max(256)
}).refine((value) => new TextEncoder().encode(JSON.stringify(value)).length <= 16777216, "Review request exceeds the 16 MiB budget");
const resultSchema = z.object({ files: z.array(z.object({
	path: z.string(),
	state: z.enum([
		"applied",
		"undone",
		"conflict",
		"unsupported",
		"error"
	]),
	changed: z.boolean(),
	reason: z.string().optional()
})) });
const agentCodec = {
	mode: "strict",
	typeSymbol: "@deepseek-ai/dsh-session/types#SessionId",
	create: () => z.intersection(z.string(), z.unknown())
};
const requestCodec = {
	mode: "strict",
	typeSymbol: `${PACKAGE_NAME}#FileReviewRequest`,
	create: () => requestSchema
};
const resultCodec = {
	mode: "strict",
	typeSymbol: `${PACKAGE_NAME}#FileReviewResult`,
	create: () => resultSchema
};
const recordedMutationSchema = z.object({
	rootCallId: z.string(),
	subCallId: z.string().optional(),
	name: z.string(),
	path: z.string(),
	before: z.string().nullable(),
	after: z.string(),
	recordId: z.string().uuid().optional(),
	complete: z.boolean().optional(),
	reason: z.string().optional()
});
const recordedRequestSchema = z.object({ rootCallIds: z.array(z.string().max(256)).max(4e3) });
const recordedResultSchema = z.object({
	mutations: z.array(recordedMutationSchema),
	warnings: z.array(z.string().max(1024)).max(8).optional()
});
const recordedRequestCodec = {
	mode: "strict",
	typeSymbol: `${PACKAGE_NAME}#RecordedRequest`,
	create: () => recordedRequestSchema
};
const recordedResultCodec = {
	mode: "strict",
	typeSymbol: `${PACKAGE_NAME}#RecordedResult`,
	create: () => recordedResultSchema
};
function descriptor(method) {
	return {
		id: `${PACKAGE_NAME}#fileReview/${method}`,
		service: "fileReview",
		namespace: "fileReview",
		method,
		invocation: { kind: "direct" },
		scope: {
			context: "agent",
			wire: "agentId"
		},
		parameters: [{
			name: "agent",
			wire: "agentId",
			source: "lookup",
			lookup: "agent",
			codec: agentCodec
		}, {
			name: "request",
			wire: "request",
			source: "json",
			codec: requestCodec
		}],
		result: resultCodec
	};
}
function recordedDescriptor() {
	return {
		id: `${PACKAGE_NAME}#fileReview/recorded`,
		service: "fileReview",
		namespace: "fileReview",
		method: "recorded",
		invocation: { kind: "direct" },
		scope: {
			context: "agent",
			wire: "agentId"
		},
		parameters: [{
			name: "agent",
			wire: "agentId",
			source: "lookup",
			lookup: "agent",
			codec: agentCodec
		}, {
			name: "request",
			wire: "request",
			source: "json",
			codec: recordedRequestCodec
		}],
		result: recordedResultCodec
	};
}
const FILE_REVIEW_INVOCATIONS = [
	...["locateReference", "openEditor"].map((method) => ({
		id: `${PACKAGE_NAME}#fileReview/${method}`,
		service: "fileReview",
		namespace: "fileReview",
		method,
		invocation: { kind: "direct" },
		scope: {
			context: "agent",
			wire: "agentId"
		},
		parameters: [{
			name: "agent",
			wire: "agentId",
			source: "lookup",
			lookup: "agent",
			codec: agentCodec
		}, {
			name: "request",
			wire: "request",
			source: "json",
			codec: {
				mode: "strict",
				typeSymbol: `${PACKAGE_NAME}#ReviewLocationRequest`,
				create: () => locationRequestSchema
			}
		}],
		result: {
			mode: "strict",
			typeSymbol: `${PACKAGE_NAME}#ReviewLocationResult`,
			create: () => locationResultSchema
		}
	})),
	...["gitReview", "gitReviewDiff"].map((method) => ({
		id: `${PACKAGE_NAME}#fileReview/${method}`,
		service: "fileReview",
		namespace: "fileReview",
		method,
		invocation: { kind: "direct" },
		scope: {
			context: "agent",
			wire: "agentId"
		},
		parameters: [{
			name: "agent",
			wire: "agentId",
			source: "lookup",
			lookup: "agent",
			codec: agentCodec
		}, {
			name: "request",
			wire: "request",
			source: "json",
			codec: {
				mode: "strict",
				typeSymbol: `${PACKAGE_NAME}#${method === "gitReview" ? "GitReviewRequest" : "GitReviewFileRequest"}`,
				create: () => method === "gitReview" ? gitReviewRequestSchema : gitReviewFileRequestSchema
			}
		}],
		result: {
			mode: "strict",
			typeSymbol: `${PACKAGE_NAME}#${method === "gitReview" ? "GitReviewResult" : "GitReviewDiff"}`,
			create: () => method === "gitReview" ? gitReviewResultSchema : gitReviewDiffSchema
		}
	})),
	{
		id: `${PACKAGE_NAME}#fileReview/directoryStart`,
		service: "fileReview",
		namespace: "fileReview",
		method: "directoryStart",
		invocation: { kind: "direct" },
		scope: {
			context: "agent",
			wire: "agentId"
		},
		parameters: [{
			name: "agent",
			wire: "agentId",
			source: "lookup",
			lookup: "agent",
			codec: agentCodec
		}, {
			name: "path",
			wire: "path",
			source: "json",
			codec: {
				mode: "strict",
				typeSymbol: "string",
				create: () => z.string().max(4096)
			}
		}],
		result: {
			mode: "strict",
			typeSymbol: "string",
			create: () => z.string()
		}
	},
	{
		id: `${PACKAGE_NAME}#fileReview/userGuide`,
		service: "fileReview",
		namespace: "fileReview",
		method: "userGuide",
		invocation: { kind: "direct" },
		scope: {
			context: "agent",
			wire: "agentId"
		},
		parameters: [{
			name: "agent",
			wire: "agentId",
			source: "lookup",
			lookup: "agent",
			codec: agentCodec
		}, {
			name: "language",
			wire: "language",
			source: "json",
			codec: {
				mode: "strict",
				typeSymbol: "'zh' | 'en'",
				create: () => z.enum(["zh", "en"])
			}
		}],
		result: {
			mode: "strict",
			typeSymbol: "string",
			create: () => z.string().min(1)
		}
	},
	descriptor("status"),
	{
		id: `${PACKAGE_NAME}#fileReview/userGuideDocument`,
		service: "fileReview",
		namespace: "fileReview",
		method: "userGuideDocument",
		invocation: { kind: "direct" },
		scope: {
			context: "agent",
			wire: "agentId"
		},
		parameters: [{
			name: "agent",
			wire: "agentId",
			source: "lookup",
			lookup: "agent",
			codec: agentCodec
		}, {
			name: "language",
			wire: "language",
			source: "json",
			codec: {
				mode: "strict",
				typeSymbol: "'zh' | 'en'",
				create: () => z.enum(["zh", "en"])
			}
		}],
		result: {
			mode: "strict",
			typeSymbol: `${PACKAGE_NAME}#UserGuideDocument`,
			create: () => userGuideDocumentSchema
		}
	},
	descriptor("apply"),
	recordedDescriptor(),
	{
		id: `${PACKAGE_NAME}#fileReview/workspace`,
		service: "fileReview",
		namespace: "fileReview",
		method: "workspace",
		invocation: { kind: "direct" },
		scope: {
			context: "agent",
			wire: "agentId"
		},
		parameters: [{
			name: "agent",
			wire: "agentId",
			source: "lookup",
			lookup: "agent",
			codec: agentCodec
		}],
		result: {
			mode: "strict",
			typeSymbol: `${PACKAGE_NAME}#ReviewWorkspace`,
			create: () => reviewWorkspaceSchema
		}
	},
	{
		id: `${PACKAGE_NAME}#fileReview/project`,
		service: "fileReview",
		namespace: "fileReview",
		method: "project",
		invocation: { kind: "direct" },
		scope: {
			context: "agent",
			wire: "agentId"
		},
		parameters: [{
			name: "agent",
			wire: "agentId",
			source: "lookup",
			lookup: "agent",
			codec: agentCodec
		}],
		result: {
			mode: "strict",
			typeSymbol: `${PACKAGE_NAME}#ReviewProjectPage`,
			create: () => reviewProjectPageSchema
		}
	},
	{
		id: `${PACKAGE_NAME}#fileReview/saveProject`,
		service: "fileReview",
		namespace: "fileReview",
		method: "saveProject",
		invocation: { kind: "direct" },
		scope: {
			context: "agent",
			wire: "agentId"
		},
		parameters: [{
			name: "agent",
			wire: "agentId",
			source: "lookup",
			lookup: "agent",
			codec: agentCodec
		}, {
			name: "request",
			wire: "request",
			source: "json",
			codec: {
				mode: "strict",
				typeSymbol: `${PACKAGE_NAME}#SaveReviewProject`,
				create: () => saveReviewProjectSchema
			}
		}],
		result: {
			mode: "strict",
			typeSymbol: `${PACKAGE_NAME}#ReviewProjectPage`,
			create: () => reviewProjectPageSchema
		}
	},
	{
		id: `${PACKAGE_NAME}#fileReview/setTemporaryRepositories`,
		service: "fileReview",
		namespace: "fileReview",
		method: "setTemporaryRepositories",
		invocation: { kind: "direct" },
		scope: {
			context: "agent",
			wire: "agentId"
		},
		parameters: [{
			name: "agent",
			wire: "agentId",
			source: "lookup",
			lookup: "agent",
			codec: agentCodec
		}, {
			name: "entries",
			wire: "entries",
			source: "json",
			codec: {
				mode: "strict",
				typeSymbol: `${PACKAGE_NAME}#NamedReviewRepositories`,
				create: () => z.array(namedReviewRepositorySchema).max(512)
			}
		}],
		result: {
			mode: "strict",
			typeSymbol: `${PACKAGE_NAME}#ReviewWorkspace`,
			create: () => reviewWorkspaceSchema
		}
	}
];
//#endregion
export { USER_GUIDE_IMAGES as a, reviewSettingsSchema as i, PACKAGE_NAME as n, REVIEW_SCOPES as o, reviewProjectSchema as r, usesWorkingTree as s, FILE_REVIEW_INVOCATIONS as t };
