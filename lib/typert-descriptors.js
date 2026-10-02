import { z } from "zod";
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
	mode: z.enum([
		"uncommitted",
		"unstaged",
		"staged",
		"commit",
		"branch"
	]),
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
const diffSchema = z.object({
	path: z.string(),
	oldText: z.string().nullable(),
	newText: z.string(),
	oldStart: z.number().int().min(1).optional(),
	newStart: z.number().int().min(1).optional()
});
const requestSchema = z.object({
	action: z.enum(["undo", "redo"]),
	files: z.array(z.object({
		path: z.string(),
		diffs: z.array(diffSchema)
	}))
});
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
	name: z.string(),
	path: z.string(),
	before: z.string().nullable(),
	after: z.string()
});
const recordedRequestSchema = z.object({ rootCallIds: z.array(z.string()) });
const recordedResultSchema = z.object({ mutations: z.array(recordedMutationSchema) });
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
	descriptor("status"),
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
export { reviewSettingsSchema as i, PACKAGE_NAME as n, reviewProjectSchema as r, FILE_REVIEW_INVOCATIONS as t };
