import { a as USER_GUIDE_IMAGES, i as reviewSettingsSchema, o as REVIEW_SCOPES, r as reviewProjectSchema, s as usesWorkingTree } from "./typert-descriptors.js";
import { lstat, open, readFile, realpath, stat, unlink } from "node:fs/promises";
import { basename, delimiter, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { createHash, randomUUID } from "node:crypto";
import { writeFileAtomic } from "@deepseek-ai/dsh-atomic-write";
import { z } from "zod";
import { execFile, spawn } from "node:child_process";
import { parsePatch } from "diff";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import schema from "@deepseek-ai/schemastery";
//#region src/repository-path-policy.ts
function inside(root, candidate) {
	const child = relative(root, candidate);
	return child === "" || child !== ".." && !child.startsWith(`..${sep}`) && !isAbsolute(child);
}
/** Only directories contained by the project are portable configuration paths. */
function projectRepositoryPath(root, input) {
	const target = resolve(root, input);
	return (inside(root, target) ? relative(root, target) || "." : target).split(sep).join("/");
}
/** A junction to an external directory is temporary too. Missing paths remain editable. */
async function canonicalRepositoryPath(root, input) {
	const target = resolve(root, input);
	return projectRepositoryPath(root, await realpath(target).catch(() => target));
}
//#endregion
//#region src/repository-project-file.ts
/** Portable repository configuration owned by each project directory. */
const PROJECT_FILE_NAME = "dsh-file-review-repositories.json";
const fileSchema = z.object({
	version: z.literal(1),
	enabled: z.boolean().optional(),
	includeProjectRoot: z.boolean(),
	repositories: z.array(z.object({
		name: z.string().trim().min(1).max(120),
		path: z.string().trim().min(1).max(4096)
	})).max(512)
});
function revision(bytes) {
	return createHash("sha256").update(bytes).digest("hex");
}
async function readProjectFile(root) {
	const filename = join(root, PROJECT_FILE_NAME);
	const marker = await lstat(filename).catch((error) => {
		if (error.code === "ENOENT") return null;
		throw error;
	});
	if (marker === null) return null;
	if (!marker.isFile() || marker.isSymbolicLink()) throw new Error(`${PROJECT_FILE_NAME} must be a regular file`);
	if (marker.size > 1048576) throw new Error(`${PROJECT_FILE_NAME} exceeds 1 MiB`);
	const bytes = await readFile(filename);
	const data = fileSchema.parse(JSON.parse(bytes.toString("utf8")));
	const canonicalRoot = await realpath(root);
	const entries = await Promise.all(data.repositories.map(async (entry) => ({
		...entry,
		path: await canonicalRepositoryPath(canonicalRoot, entry.path)
	})));
	return {
		project: {
			name: basename(canonicalRoot),
			root: canonicalRoot,
			enabled: data.enabled ?? true,
			includeProjectRoot: data.includeProjectRoot,
			configFiles: [],
			repositories: [],
			namedRepositories: entries.filter((entry) => !isAbsolute(entry.path))
		},
		revision: revision(bytes),
		temporaryRepositories: entries.filter((entry) => isAbsolute(entry.path))
	};
}
async function findProjectFile(cwd) {
	let directory = await realpath(cwd);
	while (true) {
		const found = await readProjectFile(directory);
		if (found !== null) return found;
		const parent = dirname(directory);
		if (parent === directory) return null;
		directory = parent;
	}
}
async function writeProjectFile(project, expectedRevision) {
	if (((await readProjectFile(project.root))?.revision ?? "") !== expectedRevision) throw new Error("Project configuration file changed; reload before saving");
	const root = await realpath(project.root);
	const entries = await Promise.all((project.namedRepositories ?? []).map(async (entry) => ({
		...entry,
		path: await canonicalRepositoryPath(root, entry.path)
	})));
	const data = fileSchema.parse({
		version: 1,
		enabled: project.enabled ?? true,
		includeProjectRoot: project.includeProjectRoot,
		repositories: entries.filter((entry) => !isAbsolute(entry.path))
	});
	const filename = join(project.root, PROJECT_FILE_NAME);
	const bytes = Buffer.from(`${JSON.stringify(data, null, 2)}\n`, "utf8");
	await writeFileAtomic(filename, bytes.toString("utf8"), { mode: 420 });
	return revision(bytes);
}
//#endregion
//#region src/repository-manifest.ts
function unquote(value) {
	return /^(["']).*\1$/.test(value) ? value.slice(1, -1) : value;
}
function parseJsonManifest(text) {
	const value = JSON.parse(text);
	let entries = value;
	if (!Array.isArray(value) && value !== null && typeof value === "object") entries = value.repositories;
	if (!Array.isArray(entries)) throw new Error("JSON must contain an array or a repositories array");
	return entries.map((entry, index) => {
		if (typeof entry === "string" && entry.trim() !== "") return {
			name: basename(entry),
			path: entry.trim()
		};
		if (entry !== null && typeof entry === "object") {
			const item = entry;
			if (typeof item.path === "string" && item.path.trim() !== "") return {
				name: typeof item.name === "string" ? item.name : basename(item.path),
				path: item.path.trim()
			};
		}
		throw new Error(`repository ${index + 1} has no path`);
	});
}
function parseIniManifest(text) {
	const entries = [];
	let section = "";
	for (const raw of text.split(/\r?\n/)) {
		const line = raw.trim();
		if (!line || line.startsWith("#") || line.startsWith(";")) continue;
		if (line.startsWith("[") && line.endsWith("]")) {
			section = unquote(line.slice(1, -1).replace(/^submodule\s+/, ""));
			continue;
		}
		const match = /^path\s*[=:]\s*(.+)$/i.exec(line);
		if (section && match?.[1]) entries.push({
			name: section,
			path: unquote(match[1].trim())
		});
	}
	if (entries.length === 0) throw new Error("No section with a path field was found");
	return entries;
}
/** Read names and paths from supported manifests without touching the filesystem. */
function parseRepositoryManifest(text, filename) {
	const content = text.replace(/^\uFEFF/, "");
	const lowerFilename = filename.toLowerCase();
	if (lowerFilename.endsWith(".json")) return parseJsonManifest(content);
	if (lowerFilename.endsWith(".ini") || basename(filename).toLowerCase() === ".gitmodules") return parseIniManifest(content);
	throw new Error("Supported formats: .ini, .gitmodules, .json");
}
//#endregion
//#region src/repository-workspace.ts
/** Read repository manifests without executing project scripts or changing Git state. */
const MAX_MANIFEST_BYTES = 1048576;
const MAX_MANIFEST_REPOSITORIES = 512;
function pathKey(path) {
	return process.platform === "win32" ? path.toLowerCase() : path;
}
function failure(error) {
	return error.code === "ENOENT" ? "Path does not exist" : error instanceof Error ? error.message : String(error);
}
async function normalizeProject(project) {
	if (!isAbsolute(project.root)) throw new Error("Project root must be an absolute path");
	const root = await realpath(project.root);
	if (!(await stat(root)).isDirectory()) throw new Error("Project root is not a directory");
	return {
		...project,
		root,
		configFiles: project.configFiles.map((file) => projectRepositoryPath(root, file)),
		repositories: project.repositories.map((path) => projectRepositoryPath(root, path)),
		namedRepositories: project.namedRepositories === void 0 ? void 0 : await Promise.all(project.namedRepositories.map(async (entry) => ({
			...entry,
			path: await canonicalRepositoryPath(root, entry.path)
		})))
	};
}
async function collectRepositoryCandidates(project) {
	const root = project.root;
	const warnings = [];
	const candidates = project.repositories.map((path) => ({
		name: basename(path),
		path,
		source: "manual"
	}));
	candidates.push(...(project.namedRepositories ?? []).map((entry) => ({
		...entry,
		source: PROJECT_FILE_NAME
	})));
	for (const file of project.configFiles) {
		const filename = resolve(root, file);
		try {
			if ((await stat(filename)).size > MAX_MANIFEST_BYTES) throw new Error("Configuration file exceeds 1 MiB");
			const entries = parseRepositoryManifest(await readFile(filename, "utf8"), filename);
			if (entries.length > MAX_MANIFEST_REPOSITORIES) throw new Error("Configuration file exceeds 512 repositories");
			candidates.push(...entries.map((entry) => ({
				...entry,
				source: projectRepositoryPath(root, filename)
			})));
		} catch (error) {
			warnings.push(`${projectRepositoryPath(root, filename)}: ${failure(error)}`);
		}
	}
	if (project.includeProjectRoot) candidates.unshift({
		name: project.name || basename(root),
		path: root,
		source: "project"
	});
	return {
		candidates,
		warnings
	};
}
async function inspectRepository(root, candidate) {
	let path = resolve(root, candidate.path);
	const repo = {
		...candidate,
		path,
		relativePath: projectRepositoryPath(root, path),
		state: "ready"
	};
	try {
		path = await realpath(path);
		repo.path = path;
		repo.relativePath = projectRepositoryPath(root, path);
		if (!(await stat(path)).isDirectory()) throw new Error("Repository path is not a directory");
		const marker = await lstat(resolve(path, ".git")).catch((error) => {
			if (error.code === "ENOENT") return void 0;
			throw error;
		});
		if (marker === void 0 || !marker.isDirectory() && !marker.isFile()) repo.state = "notGit";
	} catch (error) {
		repo.state = error.code === "ENOENT" ? "missing" : "error";
		repo.reason = failure(error);
	}
	return repo;
}
async function previewProject(project) {
	const normalized = await normalizeProject(project);
	const { candidates, warnings } = await collectRepositoryCandidates(normalized);
	const result = {
		project: normalized,
		repositories: [],
		warnings,
		roots: project.includeProjectRoot ? [normalized.root] : []
	};
	const seen = /* @__PURE__ */ new Set();
	for (const candidate of candidates) {
		const repo = await inspectRepository(normalized.root, candidate);
		if (repo.state === "ready") result.roots.push(repo.path);
		const key = pathKey(repo.path);
		if (seen.has(key)) continue;
		seen.add(key);
		result.repositories.push(repo);
	}
	result.roots = [...new Map(result.roots.map((path) => [pathKey(path), path])).values()];
	return result;
}
/** Most-specific project wins; a repo-root session also belongs to its aggregate. */
async function resolveReviewWorkspace(cwd, projects) {
	const sessionRoot = await realpath(cwd);
	const local = await findProjectFile(sessionRoot);
	if (local !== null && local.project.enabled !== false) return previewProject(local.project);
	const previews = [];
	for (const project of projects) {
		if (project.enabled === false) continue;
		try {
			const preview = await previewProject(project);
			previews.push(preview);
		} catch {}
	}
	const direct = [...previews].sort((a, b) => (b.project?.root.length ?? 0) - (a.project?.root.length ?? 0)).find((preview) => preview.project !== null && inside(preview.project.root, sessionRoot));
	if (direct !== void 0) return direct;
	for (const preview of previews) if (preview.roots.some((root) => inside(root, sessionRoot))) return preview;
	return {
		project: null,
		repositories: [],
		warnings: [],
		roots: [sessionRoot]
	};
}
//#endregion
//#region src/repository-directory.ts
/** An empty, malformed, inaccessible or non-directory entry opens at the project. */
async function resolveDirectoryStart(projectRoot, requestedPath) {
	const root = resolve(projectRoot);
	const input = requestedPath.trim();
	if (input === "" || input.includes("\0")) return root;
	try {
		const candidate = resolve(root, input);
		if ((await stat(candidate)).isDirectory()) return candidate;
	} catch {}
	return root;
}
//#endregion
//#region src/git-review-command.ts
/** Read-only Git execution and revision selection for review requests. */
const MAX_GIT_REVIEW_BYTES = 2097152;
const GIT_TIMEOUT_MS = 15e3;
const GIT_DIFF_FLAGS = [
	"--no-ext-diff",
	"--no-textconv",
	"--no-color",
	"--ignore-submodules=all",
	"--find-renames"
];
function runReviewGit(root, args) {
	return new Promise((accept, reject) => {
		execFile("git", [
			"--no-pager",
			"-C",
			root,
			"-c",
			"core.quotePath=false",
			...args
		], {
			windowsHide: true,
			timeout: GIT_TIMEOUT_MS,
			maxBuffer: MAX_GIT_REVIEW_BYTES,
			encoding: "utf8",
			env: {
				...process.env,
				GIT_OPTIONAL_LOCKS: "0",
				GIT_TERMINAL_PROMPT: "0",
				GIT_EXTERNAL_DIFF: ""
			}
		}, (error, stdout, stderr) => {
			if (error) reject(new Error(stderr.trim() || error.message));
			else accept(stdout);
		}).stdin?.end();
	});
}
/** An omitted branch uses the remote default, main/master, then another branch. */
async function resolveDefaultBranchRequest(root, request, run = runReviewGit) {
	if (REVIEW_SCOPES[request.mode].reference !== "branch" || request.ref) return request;
	const current = (await run(root, [
		"symbolic-ref",
		"--quiet",
		"--short",
		"HEAD"
	]).catch(() => "")).trim();
	const branches = (await run(root, [
		"for-each-ref",
		"--format=%(refname:short)",
		"refs/heads",
		"refs/remotes"
	])).split("\n").filter(Boolean);
	const preferred = (await run(root, [
		"symbolic-ref",
		"--quiet",
		"--short",
		"refs/remotes/origin/HEAD"
	]).catch(() => "")).trim();
	const mainBranch = branches.find((branch) => /^(origin\/)?(main|master)$/.test(branch) && branch !== current);
	const otherBranch = branches.find((branch) => branch !== current && !branch.endsWith("/HEAD"));
	return {
		...request,
		ref: preferred || mainBranch || otherBranch
	};
}
/** Resolve a supplied reference to a commit before using it in later Git arguments. */
async function resolveCommit({ root, hasHead, run }, requested) {
	if (!hasHead) throw new Error("This repository has no commits");
	if (!requested) throw new Error("Select a comparison branch");
	const oid = (await run(root, [
		"rev-parse",
		"--verify",
		"--end-of-options",
		`${requested}^{commit}`
	])).trim();
	if (!/^[0-9a-f]{40,64}$/i.test(oid)) throw new Error("Invalid commit");
	return oid;
}
async function compareBranch(context) {
	const { root, request, run } = context;
	const requested = request.ref || "";
	return {
		args: [(await run(root, [
			"merge-base",
			"HEAD",
			await resolveCommit(context, requested)
		])).trim(), "HEAD"],
		comparison: `${requested} merge-base → HEAD`
	};
}
async function compareCommit(context) {
	const { root, request, run } = context;
	const oid = await resolveCommit(context, request.ref || "HEAD");
	return {
		args: [await run(root, [
			"rev-parse",
			"--verify",
			`${oid}^`
		]).then((value) => value.trim(), async () => (await run(root, [
			"hash-object",
			"-t",
			"tree",
			"--stdin"
		])).trim()), oid],
		comparison: `${oid.slice(0, 8)} (${request.ref || "HEAD"})`
	};
}
/** Adding a Git scope requires an explicit comparison; there is no historical-mode fallback. */
const COMPARISON_RESOLVERS = {
	unstaged: () => ({
		args: [],
		comparison: "index → working tree"
	}),
	staged: () => ({
		args: ["--cached"],
		comparison: "HEAD → index"
	}),
	uncommitted: ({ hasHead }) => ({
		args: hasHead ? ["HEAD"] : ["--cached"],
		comparison: "HEAD → working tree"
	}),
	commit: compareCommit,
	branch: compareBranch
};
async function resolveGitComparison(root, request, run = runReviewGit) {
	const hasHead = await run(root, [
		"rev-parse",
		"--verify",
		"HEAD"
	]).then(() => true, () => false);
	return COMPARISON_RESOLVERS[request.mode]({
		root,
		request,
		hasHead,
		run
	});
}
//#endregion
//#region src/git-review-parser.ts
/** Pure decoders for the zero-delimited Git records and full-context patches. */
function parseGitNames(output, repository) {
	const fields = output.split("\0");
	const files = [];
	for (let index = 0; index < fields.length - 1;) {
		const status = fields[index++];
		if (!status) continue;
		const firstPath = fields[index++];
		const renamedOrCopied = /^[RC]/.test(status);
		const path = renamedOrCopied ? fields[index++] : firstPath;
		if (!path) throw new Error("Incomplete Git name-status output");
		const existing = files.find((file) => file.path === path);
		if (existing) {
			if (status[0] === "U") existing.status = "U";
			continue;
		}
		files.push({
			repository,
			path,
			...renamedOrCopied ? { oldPath: firstPath } : {},
			status: status[0],
			added: 0,
			removed: 0,
			binary: false,
			untracked: false
		});
	}
	return files;
}
function applyGitNumstat(output, files) {
	const fields = output.split("\0");
	for (let index = 0; index < fields.length - 1;) {
		const record = fields[index++];
		const match = /^([^\t]+)\t([^\t]+)\t(.*)$/s.exec(record);
		if (!match) continue;
		let path = match[3];
		if (path === "") {
			index++;
			path = fields[index++];
		}
		const file = files.find((item) => item.path === path);
		if (file) {
			file.binary = match[1] === "-";
			file.added = Number(match[1]) || 0;
			file.removed = Number(match[2]) || 0;
		}
	}
}
function parseGitCommits(output) {
	const fields = output.split("\0");
	const commits = [];
	for (let index = 0; index + 2 < fields.length; index += 3) commits.push({
		oid: fields[index].trim(),
		subject: fields[index + 1],
		date: fields[index + 2]
	});
	return commits;
}
function parseGitTextDiffs(patch, filename) {
	return parsePatch(patch).flatMap((part) => part.hunks.map((hunk) => {
		const oldLines = [];
		const newLines = [];
		let oldFinalNewline = true;
		let newFinalNewline = true;
		let previousPrefix = "";
		for (const line of hunk.lines) {
			if (line.startsWith("\\")) {
				if (previousPrefix !== "+") oldFinalNewline = false;
				if (previousPrefix !== "-") newFinalNewline = false;
				continue;
			}
			if (line[0] !== "+") oldLines.push(line.slice(1));
			if (line[0] !== "-") newLines.push(line.slice(1));
			previousPrefix = line[0] || "";
		}
		return {
			path: filename,
			oldText: oldLines.join("\n") + (oldLines.length && oldFinalNewline ? "\n" : ""),
			newText: newLines.join("\n") + (newLines.length && newFinalNewline ? "\n" : ""),
			oldStart: Math.max(1, hunk.oldStart),
			newStart: Math.max(1, hunk.newStart)
		};
	}));
}
//#endregion
//#region src/git-review.ts
/** Read-only Git review. Every repository is derived from the receiving session. */
const MAX_FILES = 1e3;
const REPOSITORY_BATCH_SIZE = 4;
async function resolveApprovedRepositories(workspace, cwd) {
	const candidates = workspace.project === null ? [{
		name: basename(cwd),
		path: cwd,
		state: "ready"
	}] : workspace.repositories.filter((repo) => repo.state === "ready");
	const repositories = [];
	const seen = /* @__PURE__ */ new Set();
	for (const candidate of candidates) try {
		const root = await realpath((await runReviewGit(candidate.path, ["rev-parse", "--show-toplevel"])).trim());
		if (workspace.project !== null && pathKey(root) !== pathKey(candidate.path)) continue;
		if (seen.has(pathKey(root))) continue;
		seen.add(pathKey(root));
		repositories.push({
			name: candidate.name || basename(root),
			path: root,
			branch: "",
			branches: [],
			commits: []
		});
	} catch {}
	return repositories;
}
function resolveRepositoryFile(root, path) {
	if (!path || path.includes("\0") || isAbsolute(path) || !inside(root, resolve(root, path))) throw new Error("Invalid repository file path");
	return resolve(root, path);
}
async function readUntrackedFile(root, path) {
	const candidate = resolveRepositoryFile(root, path);
	const stat = await lstat(candidate);
	if (stat.isSymbolicLink() || !stat.isFile() || stat.size > 2097152) return {
		text: "",
		binary: true
	};
	if (!inside(root, await realpath(candidate))) throw new Error("File resolves outside the repository");
	const bytes = await readFile(candidate);
	const text = bytes.toString("utf8");
	return bytes.includes(0) || !Buffer.from(text).equals(bytes) ? {
		text: "",
		binary: true
	} : {
		text,
		binary: false
	};
}
function textLineCount(text) {
	return text === "" ? 0 : text.replace(/\n$/, "").split("\n").length;
}
/** Without HEAD, the combined view treats each remaining disk file as added. */
async function includeUnbornWorkingTreeChanges(root, files) {
	const unstaged = parseGitNames(await runReviewGit(root, [
		"diff",
		...GIT_DIFF_FLAGS,
		"--name-status",
		"-z",
		"--"
	]), root);
	for (const file of unstaged) if (!files.some((item) => item.path === file.path)) files.push(file);
	for (let index = files.length - 1; index >= 0; index--) {
		const file = files[index];
		let content;
		try {
			content = await readUntrackedFile(root, file.path);
		} catch (error) {
			if (error.code !== "ENOENT") throw error;
			files.splice(index, 1);
			continue;
		}
		file.added = textLineCount(content.text);
		file.removed = 0;
		file.binary = content.binary;
		file.untracked = true;
		file.status = "A";
	}
}
async function appendUntrackedFiles(root, files) {
	const paths = (await runReviewGit(root, [
		"ls-files",
		"--others",
		"--exclude-standard",
		"-z"
	])).split("\0").filter(Boolean);
	if (paths.length + files.length > MAX_FILES) throw new Error(`Review exceeds ${MAX_FILES} files; select a smaller scope`);
	for (const path of paths) {
		if (path.endsWith("/")) continue;
		if (files.some((item) => item.path === path)) continue;
		const content = await readUntrackedFile(root, path);
		files.push({
			repository: root,
			path,
			status: "?",
			added: textLineCount(content.text),
			removed: 0,
			binary: content.binary,
			untracked: true
		});
	}
}
async function listChangedFiles(root, request) {
	request = await resolveDefaultBranchRequest(root, request);
	const comparison = await resolveGitComparison(root, request);
	const files = parseGitNames(await runReviewGit(root, [
		"diff",
		...GIT_DIFF_FLAGS,
		...comparison.args,
		"--name-status",
		"-z",
		"--"
	]), root);
	applyGitNumstat(await runReviewGit(root, [
		"diff",
		...GIT_DIFF_FLAGS,
		...comparison.args,
		"--numstat",
		"-z",
		"--"
	]), files);
	if (request.mode === "uncommitted" && comparison.args.includes("--cached")) await includeUnbornWorkingTreeChanges(root, files);
	if (usesWorkingTree(request.mode)) await appendUntrackedFiles(root, files);
	if (files.length > MAX_FILES) throw new Error(`Review exceeds ${MAX_FILES} files; select a smaller scope`);
	return {
		files,
		comparison: comparison.comparison,
		args: comparison.args
	};
}
async function loadRepositoryMetadata(repository, request) {
	repository.branch = (await runReviewGit(repository.path, [
		"symbolic-ref",
		"--quiet",
		"--short",
		"HEAD"
	]).catch(() => "HEAD")).trim();
	if (REVIEW_SCOPES[request.mode].reference !== "none") {
		repository.branches = (await runReviewGit(repository.path, [
			"for-each-ref",
			"--format=%(refname:short)",
			"refs/heads",
			"refs/remotes"
		])).split("\n").filter((value) => value && !value.endsWith("/HEAD"));
		const log = await runReviewGit(repository.path, [
			"log",
			"-50",
			"--format=%H%x00%s%x00%cs%x00"
		]).catch(() => "");
		repository.commits.push(...parseGitCommits(log));
	}
}
async function gitReview(workspace, cwd, request) {
	const repositories = await resolveApprovedRepositories(workspace, cwd);
	if (request.repository && !repositories.some((repo) => pathKey(repo.path) === pathKey(request.repository))) throw new Error("Repository is outside this session");
	const result = {
		repositories,
		files: [],
		warnings: [...workspace.warnings],
		comparisons: []
	};
	for (let start = 0; start < repositories.length; start += REPOSITORY_BATCH_SIZE) await Promise.all(repositories.slice(start, start + REPOSITORY_BATCH_SIZE).map(async (repo) => {
		if (request.repository && pathKey(repo.path) !== pathKey(request.repository)) return;
		try {
			await loadRepositoryMetadata(repo, request);
			const changes = await listChangedFiles(repo.path, request);
			result.files.push(...changes.files);
			result.comparisons.push(`${repo.name}: ${changes.comparison}`);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			result.warnings.push(`${repo.name}: ${message}`);
		}
	}));
	result.files.sort((a, b) => a.repository.localeCompare(b.repository) || a.path.localeCompare(b.path));
	return result;
}
async function gitReviewDiff(workspace, cwd, request) {
	const repo = (await resolveApprovedRepositories(workspace, cwd)).find((repo) => pathKey(repo.path) === pathKey(request.repository));
	if (!repo) throw new Error("Repository is outside this session");
	resolveRepositoryFile(repo.path, request.path);
	const changes = await listChangedFiles(repo.path, request);
	const file = changes.files.find((item) => item.path === request.path);
	if (!file) throw new Error("This file changed; refresh the review");
	if (file.binary) return {
		diffs: [],
		binary: true,
		note: "Binary, symbolic link, or file exceeds 2 MiB"
	};
	if (file.untracked) {
		const content = await readUntrackedFile(repo.path, file.path);
		return {
			diffs: content.binary ? [] : [{
				path: resolve(repo.path, file.path),
				oldText: null,
				newText: content.text,
				oldStart: 1,
				newStart: 1
			}],
			binary: content.binary,
			note: ""
		};
	}
	const patch = await runReviewGit(repo.path, [
		"diff",
		...GIT_DIFF_FLAGS,
		...changes.args,
		"--unified=2147483647",
		"--",
		...file.oldPath ? [file.oldPath] : [],
		file.path
	]);
	const diffs = parseGitTextDiffs(patch, resolve(repo.path, file.path));
	return {
		diffs,
		binary: /Binary files|GIT binary patch/.test(patch),
		note: diffs.length ? "" : "Rename or file mode change; no text difference"
	};
}
//#endregion
//#region src/file-review-files.ts
/** Filesystem validation and strictly reversible text changes for Host review. */
/**
* The mutation tools' recorded hunks (both diff cards and Code Mode
* before/after values) ride the filesystem backend's LF-normalized basis,
* while files on disk may use CRLF. All hunk matching therefore runs on the
* normalized text; the write path restores the file's own line-ending style.
*/
function normalizeNewlines(text) {
	return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}
function restoreNewlines(text, crlf) {
	return crlf ? text.replace(/\n/g, "\r\n") : text;
}
async function resolveReviewFile(cwd, requestedPath, roots) {
	const candidate = resolve(await realpath(cwd), requestedPath);
	const linkStat = await lstat(candidate);
	if (linkStat.isSymbolicLink()) throw new Error("symbolic links are not supported");
	if (!linkStat.isFile()) throw new Error("path is not a regular file");
	if (linkStat.size > 16777216) throw new Error("file exceeds the review operation budget");
	const filename = await realpath(candidate);
	if (!roots.some((root) => inside(root, filename))) throw new Error("resolved path is outside the configured project repositories");
	const bytes = await readFile(filename);
	const text = bytes.toString("utf8");
	if (!Buffer.from(text, "utf8").equals(bytes)) throw new Error("file is not valid UTF-8 text");
	const crlf = text.includes("\r");
	return {
		filename,
		mode: linkStat.mode & 511,
		bytes,
		text,
		crlf,
		lfText: normalizeNewlines(text)
	};
}
function offsetAtLine(text, line) {
	if (!Number.isInteger(line) || line < 1) return null;
	if (line === 1) return 0;
	let offset = 0;
	for (let current = 1; current < line; current += 1) {
		const next = text.indexOf("\n", offset);
		if (next === -1) return null;
		offset = next + 1;
	}
	return offset;
}
function replaceHunk(text, source, replacement, line) {
	let offset;
	if (line !== void 0) {
		const located = offsetAtLine(text, line);
		if (located === null || text.slice(located, located + source.length) !== source) return null;
		offset = located;
	} else {
		if (source === "") return null;
		offset = text.indexOf(source);
		if (offset === -1 || text.indexOf(source, offset + 1) !== -1) return null;
	}
	return text.slice(0, offset) + replacement + text.slice(offset + source.length);
}
function hunkSupported(diff, path) {
	if (diff.path !== path || diff.oldText === null || diff.oldText === diff.newText) return false;
	if (diff.oldText === "" && diff.oldStart === void 0) return false;
	if (diff.newText === "" && diff.newStart === void 0) return false;
	return true;
}
/** Apply a complete file's hunk sequence in memory, or report a strict mismatch. */
function transformFile(text, file, action) {
	if (file.diffs.length === 0 || !file.diffs.every((diff) => hunkSupported(diff, file.path))) return null;
	const diffs = action === "undo" ? [...file.diffs].reverse() : file.diffs;
	let next = text;
	for (const diff of diffs) {
		const source = action === "undo" ? diff.newText : diff.oldText;
		const replacement = action === "undo" ? diff.oldText : diff.newText;
		if (source === null || replacement === null) return null;
		const changed = replaceHunk(next, source, replacement, action === "undo" ? diff.newStart : diff.oldStart);
		if (changed === null) return null;
		next = changed;
	}
	return next;
}
function hunkSidePresent(text, file, side) {
	for (const diff of file.diffs) {
		const source = side === "old" ? diff.oldText : diff.newText;
		if (source === null) continue;
		const line = side === "old" ? diff.oldStart : diff.newStart;
		if (line !== void 0) {
			const located = offsetAtLine(text, line);
			if (located === null || text.slice(located, located + source.length) !== source) return false;
		} else if (text.indexOf(source) === -1) return false;
	}
	return true;
}
function inspectText(text, file) {
	if (file.diffs.length === 0 || !file.diffs.every((diff) => hunkSupported(diff, file.path))) return {
		state: "unsupported",
		reason: "change has no complete reversible diff"
	};
	const undone = transformFile(text, file, "undo");
	const redone = transformFile(text, file, "redo");
	if (undone !== null && redone !== null) return hunkSidePresent(text, file, "new") ? {
		state: "applied",
		text,
		nextText: undone
	} : {
		state: "undone",
		text,
		nextText: redone
	};
	if (undone !== null) return {
		state: "applied",
		text,
		nextText: undone
	};
	if (redone !== null) return {
		state: "undone",
		text,
		nextText: redone
	};
	return {
		state: "conflict",
		reason: "current content does not match the recorded change"
	};
}
async function inspectReviewFile(cwd, file, roots) {
	if (file.diffs.length === 0 || !file.diffs.every((diff) => hunkSupported(diff, file.path))) return {
		path: file.path,
		state: "unsupported",
		changed: false,
		reason: "change has no complete reversible diff"
	};
	try {
		const inspected = inspectText((await resolveReviewFile(cwd, file.path, roots)).lfText, file);
		return {
			path: file.path,
			state: inspected.state,
			changed: false,
			reason: inspected.reason
		};
	} catch (error) {
		return {
			path: file.path,
			state: "error",
			changed: false,
			reason: error instanceof Error ? error.message : String(error)
		};
	}
}
async function applyReviewFile(cwd, file, action, roots) {
	if (file.diffs.length === 0 || !file.diffs.every((diff) => hunkSupported(diff, file.path))) return {
		path: file.path,
		state: "unsupported",
		changed: false,
		reason: "change has no complete reversible diff"
	};
	try {
		const resolved = await resolveReviewFile(cwd, file.path, roots);
		const inspected = inspectText(resolved.lfText, file);
		const sourceState = action === "undo" ? "applied" : "undone";
		const targetState = action === "undo" ? "undone" : "applied";
		if (inspected.state === targetState) return {
			path: file.path,
			state: targetState,
			changed: false
		};
		if (inspected.state !== sourceState || inspected.nextText === void 0) return {
			path: file.path,
			state: inspected.state,
			changed: false,
			reason: inspected.reason
		};
		const current = await readFile(resolved.filename);
		if (!Buffer.from(resolved.bytes).equals(current)) return {
			path: file.path,
			state: "conflict",
			changed: false,
			reason: "file changed while the operation was being prepared"
		};
		await writeFileAtomic(resolved.filename, restoreNewlines(inspected.nextText, resolved.crlf), { mode: resolved.mode });
		return {
			path: file.path,
			state: targetState,
			changed: true
		};
	} catch (error) {
		return {
			path: file.path,
			state: "error",
			changed: false,
			reason: error instanceof Error ? error.message : String(error)
		};
	}
}
//#endregion
//#region src/editor-launch.ts
const execute = promisify(execFile);
function allowedConfiguredExecutable(file) {
	if (process.platform === "win32") return ["code.exe", "antigravity ide.exe"].includes(basename(file).toLowerCase());
	return ["code", "Visual Studio Code"].includes(basename(file));
}
async function appendWindowsInstallCandidates(candidates) {
	try {
		const { stdout } = await execute("reg.exe", [
			"query",
			"HKCU\\Software\\Classes\\vscode\\shell\\open\\command",
			"/ve"
		], {
			windowsHide: true,
			timeout: 3e3
		});
		const match = stdout.match(/REG_SZ\s+"([^"]+Code\.exe)"/i);
		if (match?.[1]) candidates.push(match[1]);
	} catch {}
	const installRoots = [
		process.env.LOCALAPPDATA,
		process.env.ProgramFiles,
		process.env["ProgramFiles(x86)"]
	];
	for (const root of installRoots) {
		if (!root) continue;
		const localPrograms = root === process.env.LOCALAPPDATA ? ["Programs"] : [];
		candidates.push(join(root, ...localPrograms, "Microsoft VS Code", "Code.exe"));
	}
}
function appendPathCandidates(candidates) {
	for (const directory of (process.env.PATH ?? "").split(delimiter).filter(Boolean)) {
		candidates.push(join(directory, process.platform === "win32" ? "Code.exe" : "code"));
		if (process.platform === "win32") candidates.push(join(dirname(directory), "Code.exe"));
	}
}
/** Explicit paths stay within known executables; discovery keeps its original priority. */
async function editorCandidates(configured) {
	const candidates = [];
	if (configured?.trim()) {
		const file = configured.trim();
		if (!isAbsolute(file) || !allowedConfiguredExecutable(file)) return candidates;
		candidates.push(file);
	} else {
		if (process.platform === "win32") await appendWindowsInstallCandidates(candidates);
		else if (process.platform === "darwin") candidates.push("/Applications/Visual Studio Code.app/Contents/MacOS/Electron");
		appendPathCandidates(candidates);
	}
	return candidates;
}
/** Known VS Code-compatible executables only; no command templates or shell launchers. */
async function findVSCode(configured) {
	const candidates = await editorCandidates(configured);
	for (const file of candidates) try {
		if ((await stat(file)).isFile()) return file;
	} catch {}
	return null;
}
function vscodeArguments(path, line) {
	if (!isAbsolute(path) || !Number.isSafeInteger(line) || line < 1) throw new Error("Invalid editor location");
	return [
		"--reuse-window",
		"--goto",
		`${path}:${line}:1`
	];
}
/** Resolves only after OS process admission; GUI focus is not an observable acknowledgement. */
async function launchVSCode(executable, args) {
	const env = { ...process.env };
	delete env.ELECTRON_RUN_AS_NODE;
	await new Promise((resolve, reject) => {
		const child = spawn(executable, [...args], {
			env,
			detached: true,
			stdio: "ignore",
			windowsHide: true,
			shell: false
		});
		child.once("error", reject);
		child.once("spawn", () => {
			child.unref();
			resolve();
		});
	});
}
const referenceTextFits = (text) => {
	return text.length <= 65536 && new TextEncoder().encode(text).length <= 65536;
};
const normalizeReferenceText = (text) => text.replace(/\r\n?/g, "\n");
function validReferenceRange(request, quote) {
	return Number.isSafeInteger(request.line) && request.line >= 1 && Number.isSafeInteger(request.endLine) && request.endLine >= request.line && [
		quote,
		request.before,
		request.after
	].every(referenceTextFits) && request.endLine - request.line + 1 === quote.split("\n").length;
}
function linesMatchAt(lines, selected, offset) {
	return selected.every((value, index) => lines[offset + index] === value);
}
/** Exact full-version validation, otherwise require a unique complete quote + adjacent context. */
function locateReviewReference(text, request) {
	const disk = normalizeReferenceText(text);
	const quote = normalizeReferenceText(request.quote);
	if (!validReferenceRange(request, quote)) return { state: "unsupported" };
	const lines = disk.split("\n");
	const expected = request.line - 1;
	const selected = quote.split("\n");
	if (request.fullText !== void 0 && normalizeReferenceText(request.fullText) === disk && linesMatchAt(lines, selected, expected)) return {
		state: "exact",
		line: request.line,
		endLine: request.endLine
	};
	const before = request.before ? normalizeReferenceText(request.before).split("\n") : [];
	const after = request.after ? normalizeReferenceText(request.after).split("\n") : [];
	if (!quote.trim() && !before.length && !after.length) return { state: "ambiguous" };
	const candidates = [];
	for (let offset = 0; offset <= lines.length - selected.length; offset++) {
		if (!linesMatchAt(lines, selected, offset) || !linesMatchAt(lines, before, offset - before.length) || !linesMatchAt(lines, after, offset + selected.length)) continue;
		candidates.push(offset + 1);
		if (candidates.length > 1) return { state: "ambiguous" };
	}
	const line = candidates[0];
	if (line === void 0) return { state: "changed" };
	return {
		state: line === request.line ? "exact" : "moved",
		line,
		endLine: line + selected.length - 1
	};
}
//#endregion
//#region src/file-review-locations.ts
/** Host disk checks and editor admission for references to reviewed text. */
const MAX_REFERENCE_FILE_BYTES = 16777216;
async function locateReferenceOnDisk(request, access) {
	try {
		const { roots } = await access.workspace();
		const repository = await realpath(request.repository);
		if (!roots.some((root) => pathKey(root) === pathKey(repository))) return {
			state: "unsupported",
			reason: "scope"
		};
		const candidate = resolve(access.cwd(), request.path);
		if (!inside(repository, candidate)) return {
			state: "unsupported",
			reason: "scope"
		};
		if ((await lstat(candidate)).size > MAX_REFERENCE_FILE_BYTES) return {
			state: "unsupported",
			reason: "size"
		};
		const file = await resolveReviewFile(access.cwd(), request.path, roots);
		if (!inside(repository, file.filename)) return {
			state: "unsupported",
			reason: "scope"
		};
		if (file.lfText.includes("\0")) return {
			state: "unsupported",
			reason: "binary"
		};
		return locateReviewReference(file.lfText, request);
	} catch (cause) {
		return { state: typeof cause === "object" && cause !== null && "code" in cause && cause.code === "ENOENT" ? "missing" : "unsupported" };
	}
}
async function openReferenceInEditor(request, access) {
	if (request.side !== "new") return {
		state: "unsupported",
		reason: "old"
	};
	const located = await access.locateReference();
	if (!(located.state === "exact" || located.state === "moved" && request.allowRelocate)) return located;
	const executable = await findVSCode(request.editorPath);
	if (executable === null) return { state: "editor-missing" };
	const current = await access.locateReference();
	if (current.line !== located.line || current.endLine !== located.endLine || current.state !== located.state) return { state: "changed" };
	try {
		const { roots } = await access.workspace();
		const file = await resolveReviewFile(access.cwd(), request.path, roots);
		if (!inside(await realpath(request.repository), file.filename)) return {
			state: "unsupported",
			reason: "scope"
		};
		if (file.lfText.includes("\0")) return {
			state: "unsupported",
			reason: "binary"
		};
		const final = locateReviewReference(file.lfText, request);
		if (final.line !== located.line || final.state !== located.state) return { state: "changed" };
		await launchVSCode(executable, vscodeArguments(file.filename, located.line));
		return {
			...located,
			state: "started"
		};
	} catch {
		return {
			state: "error",
			reason: "launch"
		};
	}
}
//#endregion
//#region src/file-review-user-guide.ts
/** Fixed, packaged manual assets; callers cannot select arbitrary file paths. */
const MAX_SCREENSHOT_BYTES = 1048576;
async function userGuidePath(language) {
	if (language !== "zh" && language !== "en") throw new Error("Unsupported user guide language");
	const document = new URL(`../docs/USER_GUIDE${language === "en" ? ".en" : ""}.md`, import.meta.url);
	if (!(await lstat(document)).isFile()) throw new Error("User guide is not a regular file");
	return fileURLToPath(document);
}
async function readScreenshot(name) {
	const image = new URL(`../docs/image/${name}`, import.meta.url);
	const info = await lstat(image);
	if (!info.isFile() || info.isSymbolicLink() || info.size > MAX_SCREENSHOT_BYTES) throw new Error("Invalid user guide screenshot");
	const bytes = await readFile(image);
	return [`image/${name}`, `data:image/jpeg;base64,${bytes.toString("base64")}`];
}
async function readUserGuideDocument(path) {
	const markdown = await readFile(path, "utf8");
	const images = await Promise.all(USER_GUIDE_IMAGES.map(readScreenshot));
	return {
		path,
		markdown,
		images: Object.fromEntries(images)
	};
}
//#endregion
//#region src/lifecycle-record.ts
/** Versioned, bounded facts carried by the official durable tool log. */
const LIFECYCLE_KEY = "dshFileReviewMultiRepository";
const CAPTURE_MAX_BYTES = 1048576;
const SESSION_MAX_RECORDS = 4e3;
const SESSION_MAX_BYTES = 16777216;
const lifecycleImageSchema = z.object({
	text: z.string().max(CAPTURE_MAX_BYTES),
	mode: z.number().int().min(0).max(511),
	dev: z.number(),
	ino: z.number()
}).strict();
const lifecycleRecordSchema = z.object({
	schemaVersion: z.literal(1),
	sessionId: z.string().min(1).max(256),
	recordId: z.string().uuid(),
	rootCallId: z.string().min(1).max(256),
	subCallId: z.string().min(1).max(256),
	name: z.string().min(1).max(256),
	path: z.string().min(1).max(4096),
	filename: z.string().min(1).max(4096),
	before: lifecycleImageSchema.nullable(),
	after: lifecycleImageSchema.nullable(),
	complete: z.boolean(),
	reason: z.string().max(1024).optional()
}).strict();
function lifecycleRecordBytes(record) {
	return new TextEncoder().encode(JSON.stringify(record)).length;
}
function incompleteLifecycle(record, reason) {
	return {
		...record,
		before: null,
		after: null,
		complete: false,
		reason
	};
}
function boundedLifecycle(record) {
	return lifecycleRecordBytes(record) <= 262144 ? record : incompleteLifecycle(record, "lifecycle record exceeds the persistence budget");
}
function lifecycleFromContent(content) {
	const records = [];
	for (const block of content) {
		if (!block || typeof block !== "object" || !("type" in block) || block.type !== "text" || !("text" in block) || block.text !== "" || !("dshFileReviewMultiRepository" in block)) continue;
		const parsed = lifecycleRecordSchema.safeParse(block[LIFECYCLE_KEY]);
		if (parsed.success && lifecycleRecordBytes(parsed.data) <= 262144) records.push(parsed.data);
	}
	return records;
}
function lifecycleBlock(record) {
	return {
		type: "text",
		text: "",
		[LIFECYCLE_KEY]: record
	};
}
//#endregion
//#region src/lifecycle-history.ts
function objectValue(value) {
	return value !== null && typeof value === "object" ? value : void 0;
}
/** Standard tools and nested dispatches carry different official event shapes. */
function acceptedSettlement(event) {
	const data = objectValue(event.data);
	if (!data) return void 0;
	if (event.type === "tool/ptc-dispatch") {
		if (data.isError) return void 0;
		return {
			rootCallId: data.rootCallId,
			subCallId: data.subCallId,
			content: Array.isArray(data.content) ? data.content : []
		};
	}
	if (event.type !== "tool/result") return void 0;
	const message = objectValue(data.message);
	if (!message || message.isError) return void 0;
	const callId = objectValue(message.source)?.callId;
	return {
		rootCallId: callId,
		subCallId: callId,
		content: (Array.isArray(message.content) ? message.content : []).flatMap((block) => {
			const result = objectValue(block);
			if (result?.isError) return [];
			return Array.isArray(result?.content) ? result.content : [block];
		})
	};
}
/** Bounded observation cache; durable session events remain the replay authority. */
var LifecycleRecordCache = class {
	entries = /* @__PURE__ */ new Map();
	bytes = 0;
	add(record) {
		const bytes = lifecycleRecordBytes(record);
		this.bytes -= this.entries.get(record.recordId)?.bytes ?? 0;
		this.entries.set(record.recordId, {
			record,
			bytes
		});
		this.bytes += bytes;
		while (this.entries.size > 4e3 || this.bytes > 16777216 && this.entries.size > 1) {
			const oldest = this.entries.keys().next().value;
			this.bytes -= this.entries.get(oldest).bytes;
			this.entries.delete(oldest);
		}
	}
	*records() {
		for (const { record } of this.entries.values()) yield record;
	}
};
/** One immutable lookup snapshot shared by every file in a status/apply request. */
var LifecycleHistory = class {
	records;
	truncated;
	index;
	constructor(records, truncated) {
		this.records = records;
		this.truncated = truncated;
		this.index = new Map(records.map((record, position) => [record.recordId, {
			record,
			position
		}]));
	}
	/** null selects the legacy path; an empty sequence rejects untrusted/mixed records. */
	sequence(file) {
		if (!file.diffs.some((diff) => diff.recordId)) return null;
		const records = [];
		let previousPosition = -1;
		for (const diff of file.diffs) {
			const entry = diff.recordId ? this.index.get(diff.recordId) : void 0;
			if (!entry || entry.position <= previousPosition) return [];
			const { record } = entry;
			if (record.path !== file.path || diff.path !== file.path || diff.oldText !== (record.before?.text ?? null) || diff.newText !== (record.after?.text ?? "")) return [];
			previousPosition = entry.position;
			records.push(record);
		}
		return records;
	}
};
function replayLifecycleHistory(sessionId, events, cached = []) {
	const records = /* @__PURE__ */ new Map();
	for (const event of events) {
		const settlement = acceptedSettlement(event);
		if (!settlement) continue;
		for (const record of lifecycleFromContent(settlement.content)) if (record.sessionId === sessionId && record.rootCallId === settlement.rootCallId && record.subCallId === settlement.subCallId) records.set(record.recordId, record);
	}
	for (const record of cached) records.set(record.recordId, record);
	let budget = SESSION_MAX_BYTES;
	const bounded = [];
	for (const record of [...records.values()].reverse()) {
		if (bounded.length >= 4e3) break;
		budget -= lifecycleRecordBytes(record);
		bounded.push(budget >= 0 ? record : incompleteLifecycle(record, "session lifecycle replay exceeds the 16 MiB budget"));
	}
	return new LifecycleHistory(bounded.reverse(), records.size > SESSION_MAX_RECORDS);
}
function lifecycleMutation(record) {
	return {
		rootCallId: record.rootCallId,
		subCallId: record.subCallId,
		name: record.name,
		path: record.path,
		before: record.before?.text ?? null,
		after: record.after?.text ?? "",
		recordId: record.recordId,
		complete: record.complete,
		...record.reason ? { reason: record.reason } : {}
	};
}
//#endregion
//#region src/file-lifecycle.ts
/** Exact images and filesystem transitions, restricted to the current session roots. */
async function lifecyclePath(cwd, path, roots) {
	const candidate = resolve(await realpath(cwd), path);
	const parent = await realpath(dirname(candidate));
	const filename = join(parent, basename(candidate));
	if (!roots.some((root) => inside(root, filename))) throw new Error("resolved path is outside the configured project repositories");
	return filename;
}
async function captureImage(filename) {
	let stat;
	try {
		stat = await lstat(filename);
	} catch (error) {
		if (error.code === "ENOENT") return null;
		throw error;
	}
	if (!stat.isFile() || stat.isSymbolicLink()) throw new Error("lifecycle requires a regular file without symbolic links");
	if (stat.size > 1048576) throw new Error("file exceeds the lifecycle capture budget");
	const bytes = await readFile(filename);
	const text = bytes.toString("utf8");
	if (bytes.length > 1048576 || text.includes("\0") || !Buffer.from(text).equals(bytes)) throw new Error("file is not ordinary UTF-8 text");
	const checked = await lstat(filename);
	if (!sameIdentity(checked, stat) || checked.mtimeMs !== stat.mtimeMs || checked.size !== stat.size) throw new Error("file changed during lifecycle capture");
	return {
		text,
		mode: stat.mode & 511,
		dev: stat.dev,
		ino: stat.ino
	};
}
/** Content equality deliberately ignores inode changes made by our own atomic writes. */
function sameLifecycleImage(a, b) {
	return a === null || b === null ? a === b : a.text === b.text && a.mode === b.mode;
}
function sameIdentity(a, b) {
	return a.dev === b.dev && a.ino === b.ino;
}
async function writeImage(filename, current, target) {
	if (target === null) await unlink(filename);
	else if (current === null) {
		const handle = await open(filename, "wx", target.mode);
		try {
			await handle.writeFile(target.text);
			await handle.sync();
		} finally {
			await handle.close();
		}
	} else await writeFileAtomic(filename, target.text, { mode: target.mode });
}
/** Host verified records are the sole authority for whole-file writes/deletions. */
async function applyLifecycle(cwd, path, roots, records, action, identities) {
	const result = (state, reason, changed = false) => ({
		path,
		state,
		changed,
		...reason ? { reason } : {}
	});
	if (!records.length || records.some((record) => !record.complete)) return result("unsupported", "change has no complete trusted lifecycle record");
	try {
		const filename = await lifecyclePath(cwd, path, roots);
		if (records.some((record) => record.filename !== filename)) return result("unsupported", "lifecycle path does not match the current repository authorization");
		for (let index = 1; index < records.length; index++) if (!sameLifecycleImage(records[index - 1].after, records[index].before)) return result("unsupported", "lifecycle sequence is incomplete");
		const before = records[0].before;
		const after = records.at(-1).after;
		const current = await captureImage(filename);
		if (sameLifecycleImage(before, after)) return result("unsupported", "lifecycle has no net file change");
		const state = sameLifecycleImage(current, after) ? "applied" : sameLifecycleImage(current, before) ? "undone" : "conflict";
		if (state === "conflict") return result(state, "current content or permissions do not match the recorded change");
		if (!action || state === (action === "undo" ? "undone" : "applied")) return result(state);
		const target = action === "undo" ? before : after;
		const expected = action === "undo" ? after : before;
		const identityKey = records.map((record) => record.recordId).join(":");
		const identity = identities?.get(identityKey) ?? expected;
		if (current && identity && !sameIdentity(current, identity)) return result("conflict", "file was replaced at the recorded path");
		const rechecked = await captureImage(filename);
		if (!sameLifecycleImage(current, rechecked) || current && rechecked && !sameIdentity(current, rechecked)) return result("conflict", "file changed while the operation was being prepared");
		await writeImage(filename, current, target);
		const written = await captureImage(filename);
		if (written) identities?.set(identityKey, written);
		else identities?.delete(identityKey);
		return result(action === "undo" ? "undone" : "applied", void 0, true);
	} catch (error) {
		return result("error", error instanceof Error ? error.message : String(error));
	}
}
//#endregion
//#region src/file-review-service.ts
/** Host-side, workspace-contained undo / redo service for produced text diffs. */
function sessionCwd(agent) {
	const cwd = agent.session.header.cwd;
	if (cwd === void 0 || cwd.trim() === "") throw new Error("session has no workspace directory");
	return cwd;
}
/** Per-agent cap on recorded Code Mode mutations (oldest evicted first). */
const RECORDED_PER_AGENT_CAP = 4e3;
function agentKey(agent) {
	return String(agent.id);
}
/** Host service published as the `fileReview` Remote namespace. */
var FileReviewService = class extends TypertRemoteService {
	projectSettings;
	/** Per-agent record of Code Mode (`run_code`) file mutations, dispatch order. */
	recordLog = /* @__PURE__ */ new Map();
	temporaryRepositories = /* @__PURE__ */ new Map();
	lifecycleLog = /* @__PURE__ */ new Map();
	lifecycleIdentities = /* @__PURE__ */ new Map();
	constructor(ctx, projectSettings) {
		super(ctx, "fileReview");
		this.projectSettings = projectSettings;
	}
	/** Read only the project selected by this Agent's authoritative directory. */
	async project(agent) {
		const settings = this.projectSettings?.get() ?? {
			projects: [],
			revision: 0
		};
		const cwd = sessionCwd(agent);
		const root = await realpath(cwd);
		const localFile = await findProjectFile(root);
		const matched = await resolveReviewWorkspace(cwd, settings.projects);
		let project;
		if (localFile !== null) project = localFile.project;
		else if (matched.project !== null) project = {
			...matched.project,
			name: basename(matched.project.root)
		};
		else project = {
			name: basename(root),
			root,
			includeProjectRoot: true,
			configFiles: [],
			repositories: [],
			enabled: true
		};
		const workspace = localFile !== null && project.enabled !== false ? await this.workspace(agent) : await previewProject(project);
		return {
			project,
			revision: settings.revision,
			configured: localFile !== null,
			workspace,
			fileRevision: localFile?.revision ?? "",
			temporaryRepositories: localFile !== null ? this.temporaryRepositories.get(agentKey(agent)) ?? localFile.temporaryRepositories : []
		};
	}
	/** Read Git differences only in repositories belonging to this session. */
	async gitReview(agent, request) {
		return gitReview(await this.workspace(agent), sessionCwd(agent), request);
	}
	async gitReviewDiff(agent, request) {
		return gitReviewDiff(await this.workspace(agent), sessionCwd(agent), request);
	}
	async directoryStart(agent, path) {
		return resolveDirectoryStart((await this.project(agent)).project.root, path);
	}
	/** Open the shipped manual, independently of the session's project directory. */
	async userGuide(_agent, language) {
		return userGuidePath(language);
	}
	/** The Desktop Markdown preview cannot load sidebar media URLs from its app protocol. */
	async userGuideDocument(agent, language) {
		return readUserGuideDocument(await this.userGuide(agent, language));
	}
	/** Verify references against disk without writing project files. */
	async locateReference(agent, request) {
		return locateReferenceOnDisk(request, {
			workspace: () => this.workspace(agent),
			cwd: () => sessionCwd(agent)
		});
	}
	async openEditor(agent, request) {
		return openReferenceInEditor(request, {
			workspace: () => this.workspace(agent),
			cwd: () => sessionCwd(agent),
			locateReference: () => this.locateReference(agent, request)
		});
	}
	/** Preview and save cannot choose another project's root through the wire. */
	async preview(agent, project) {
		const current = await this.project(agent);
		if (pathKey(await realpath(project.root)) !== pathKey(current.project.root)) throw new Error("Project root does not belong to this session");
		return previewProject({
			...project,
			name: current.project.name,
			root: current.project.root
		});
	}
	async saveProject(agent, request) {
		const project = (await this.preview(agent, {
			...request.project,
			configFiles: [],
			repositories: []
		})).project;
		await writeProjectFile({
			...project,
			enabled: request.project.enabled ?? project.enabled ?? true,
			namedRepositories: project.namedRepositories?.filter((entry) => !isAbsolute(entry.path))
		}, request.fileRevision);
		if (this.projectSettings !== void 0) {
			const settings = this.projectSettings.get();
			const index = settings.projects.findIndex((item) => pathKey(item.root) === pathKey(project.root));
			const projects = [...settings.projects];
			const indexEntry = {
				name: project.name,
				root: project.root,
				includeProjectRoot: project.includeProjectRoot,
				configFiles: [PROJECT_FILE_NAME],
				repositories: [],
				enabled: request.project.enabled ?? project.enabled ?? true
			};
			if (index === -1) projects.push(indexEntry);
			else projects[index] = indexEntry;
			try {
				await this.projectSettings.save({
					projects,
					revision: settings.revision
				});
			} catch {}
		}
		return this.project(agent);
	}
	async workspace(agent) {
		const indexed = this.projectSettings?.get().projects ?? [];
		const active = [];
		for (const project of indexed) {
			if (!project.configFiles.includes("dsh-file-review-repositories.json") || project.enabled === false) continue;
			try {
				const local = await readProjectFile(project.root);
				if (local !== null && local.project.enabled !== false) active.push(local.project);
			} catch {}
		}
		const base = await resolveReviewWorkspace(sessionCwd(agent), active);
		const temporary = this.temporaryRepositories.get(agentKey(agent)) ?? [];
		if (base.project === null || temporary.length === 0) return base;
		const extra = await previewProject({
			name: base.project.name,
			root: base.project.root,
			includeProjectRoot: false,
			configFiles: [],
			repositories: [],
			namedRepositories: temporary
		});
		const repositories = [...base.repositories];
		const seen = new Set(repositories.map((repo) => pathKey(repo.path)));
		for (const repo of extra.repositories) {
			if (seen.has(pathKey(repo.path))) continue;
			seen.add(pathKey(repo.path));
			repositories.push({
				...repo,
				source: "temporary"
			});
		}
		return {
			...base,
			repositories,
			warnings: [...base.warnings, ...extra.warnings],
			roots: [...new Map([...base.roots, ...extra.roots].map((root) => [pathKey(root), root])).values()]
		};
	}
	/** All repositories outside the project live only in this agent's session. */
	async setTemporaryRepositories(agent, entries) {
		const current = await this.project(agent);
		if (!current.configured) throw new Error("Enable this project before adding temporary repositories");
		const root = current.project.root;
		const normalized = [];
		for (const entry of entries) {
			const path = await canonicalRepositoryPath(root, entry.path);
			if (!isAbsolute(entry.path) || !isAbsolute(path)) throw new Error("Temporary repositories must use absolute paths outside the project");
			normalized.push({
				...entry,
				path
			});
		}
		this.temporaryRepositories.set(agentKey(agent), normalized);
		return this.workspace(agent);
	}
	/** Append one nested (Code Mode) file mutation for the receiving agent. */
	recordMutation(agent, mutation) {
		if (Buffer.byteLength(JSON.stringify(mutation)) > 262144) mutation = {
			...mutation,
			before: null,
			after: "",
			complete: false,
			reason: "legacy mutation exceeds the 256 KiB capture budget"
		};
		const key = agentKey(agent);
		const list = this.recordLog.get(key);
		if (list === void 0) {
			this.recordLog.set(key, [mutation]);
			return;
		}
		list.push(mutation);
		if (list.length > RECORDED_PER_AGENT_CAP) list.splice(0, list.length - RECORDED_PER_AGENT_CAP);
	}
	recordLifecycle(agent, record) {
		const key = agentKey(agent);
		let cache = this.lifecycleLog.get(key);
		if (!cache) {
			cache = new LifecycleRecordCache();
			this.lifecycleLog.set(key, cache);
		}
		cache.add(record);
	}
	lifecycleHistory(agent) {
		return replayLifecycleHistory(String(agent.session.header.id), agent.session.snapshotEvents?.() ?? [], this.lifecycleLog?.get(agentKey(agent))?.records());
	}
	/** Replay only accepted official tool settlements, never client-supplied markers. */
	lifecycleRecords(agent) {
		return [...this.lifecycleHistory(agent).records];
	}
	/** Return the recorded mutations for the requested `run_code` roots. */
	async recorded(agent, request) {
		const history = this.lifecycleHistory(agent);
		const lifecycle = history.records;
		const covered = new Set(lifecycle.map((record) => `${record.rootCallId}\0${record.path}`));
		const list = [...lifecycle.map(lifecycleMutation), ...(this.recordLog.get(agentKey(agent)) ?? []).filter((record) => !covered.has(`${record.rootCallId}\0${record.path}`))];
		const wanted = new Set(request.rootCallIds);
		return {
			mutations: list.filter((mutation) => wanted.has(mutation.rootCallId)),
			...history.truncated ? { warnings: ["Only the most recent 4000 lifecycle records are available; older nested changes may lack review images."] } : {}
		};
	}
	/** Inspect current disk state without changing files. */
	async status(agent, request) {
		const cwd = sessionCwd(agent);
		const { roots } = await this.workspace(agent);
		const history = request.files.some((file) => file.diffs.some((diff) => diff.recordId)) ? this.lifecycleHistory(agent) : void 0;
		return { files: await Promise.all(request.files.map((file) => {
			const records = history?.sequence(file) ?? null;
			return records === null ? inspectReviewFile(cwd, file, roots) : applyLifecycle(cwd, file.path, roots, records);
		})) };
	}
	/** Toggle every independently safe file while the receiving Agent is idle. */
	async apply(agent, request) {
		return agent.runMaintenance(async () => {
			const cwd = sessionCwd(agent);
			const { roots } = await this.workspace(agent);
			const history = request.files.some((file) => file.diffs.some((diff) => diff.recordId)) ? this.lifecycleHistory(agent) : void 0;
			const files = [];
			for (const file of request.files) {
				const records = history?.sequence(file) ?? null;
				const result = records === null ? await applyReviewFile(cwd, file, request.action, roots) : await applyLifecycle(cwd, file.path, roots, records, request.action, this.lifecycleIdentities);
				files.push(result);
			}
			return { files };
		});
	}
};
//#endregion
//#region src/repository-settings.ts
/** All writes go through the Desktop profile's native revision-fenced settings. */
var RepositorySettings = class {
	ctx;
	initial;
	settings;
	constructor(ctx, initial = []) {
		this.ctx = ctx;
		this.initial = initial;
		ctx.inject(["settings"], (sctx) => {
			this.settings = sctx.settings;
			ctx.effect(() => sctx.settings.configure({ auto: false }, ctx.fiber), "file-review: custom settings");
			return () => {
				this.settings = void 0;
			};
		});
	}
	get() {
		const entry = this.entry();
		const descriptor = this.settings?.describe({ redactSecrets: true }).find((item) => item.ns === entry?.options.id);
		const value = descriptor?.value;
		return {
			projects: reviewProjectSchema.array().parse(value?.projects ?? this.initial),
			revision: descriptor?.revision ?? 0
		};
	}
	async save(request) {
		const validated = reviewSettingsSchema.parse(request);
		const entry = this.entry();
		if (this.settings === void 0 || typeof entry?.options.id !== "string") throw new Error("Native project settings are unavailable");
		await this.settings.update(entry.options.id, { projects: validated.projects }, validated.revision);
		return this.get();
	}
	entry() {
		return [...this.ctx.get("loader")?.entries() ?? []].find((entry) => entry.fiber === this.ctx.fiber && entry.options.name === "dsh-file-review-tab-multi-git-repository");
	}
};
//#endregion
//#region src/lifecycle-capture.ts
/** Observe official execution/acceptance/log seams without changing tool outcomes. */
const CAPTURE_PATH_LIMIT = 32;
/** Tool-authored metadata can never become an authority for whole-file writes. */
function cleanContent(content) {
	return content.map((block) => {
		if (!block || typeof block !== "object" || !("dshFileReviewMultiRepository" in block)) return block;
		const copy = { ...block };
		delete copy[LIFECYCLE_KEY];
		return copy;
	});
}
function capturePaths(ctx, exec) {
	try {
		const view = ctx.tools.get(exec.name, exec.agent)?.presentCall?.(exec.arguments);
		if (view?.card === "diff") return [.../* @__PURE__ */ new Set([...view.diffs.map((diff) => diff.path), ...(view.locations ?? []).map((location) => location.path)])];
		if (view?.card === "generic" && view.kind === "edit") return [...new Set((view.locations ?? []).map((location) => location.path))];
	} catch {}
	return [];
}
async function captureBefore(cwd, path, roots) {
	let filename;
	try {
		filename = await lifecyclePath(cwd, path, roots);
	} catch {
		return null;
	}
	try {
		return {
			path,
			filename,
			before: await captureImage(filename),
			complete: true
		};
	} catch (error) {
		return {
			path,
			filename,
			before: null,
			complete: false,
			reason: String(error)
		};
	}
}
async function finishCapture(exec, sessionId, capture) {
	let after = null;
	let { complete, reason } = capture;
	try {
		after = await captureImage(capture.filename);
	} catch (error) {
		complete = false;
		reason = String(error);
	}
	if (complete && sameLifecycleImage(capture.before, after)) return null;
	return boundedLifecycle({
		schemaVersion: 1,
		sessionId,
		recordId: randomUUID(),
		rootCallId: String(exec.rootCallId),
		subCallId: String(exec.callId),
		name: exec.name,
		path: capture.path,
		filename: capture.filename,
		before: complete ? capture.before : null,
		after: complete ? after : null,
		complete,
		...reason ? { reason } : {}
	});
}
function registerLifecycleCapture(ctx, service) {
	const pending = /* @__PURE__ */ new Map();
	ctx.on("tools/execute", async (exec, next) => {
		const agent = exec.agent;
		const cwd = agent?.session.header.cwd;
		if (!agent || !cwd) return next();
		const paths = capturePaths(ctx, exec);
		if (!paths.length || paths.length > CAPTURE_PATH_LIMIT) return next();
		let roots;
		try {
			roots = (await service.workspace(agent)).roots;
		} catch {
			return next();
		}
		const captures = await Promise.all(paths.map((path) => captureBefore(cwd, path, roots)));
		const result = await next();
		if (result.isError) return result;
		const records = [];
		for (const capture of captures) {
			if (!capture) continue;
			try {
				const record = await finishCapture(exec, String(agent.session.header.id), capture);
				if (record) records.push(record);
			} catch {}
		}
		if (records.length) pending.set(exec.token, records);
		return result;
	});
	ctx.on("tools/post-execute", async (exec, result, next) => {
		const decision = await next();
		const records = pending.get(exec.token);
		if (result.isError || decision.kind !== "accept" || "value" in decision) return decision;
		const content = decision.content ?? result.content;
		const hasMarker = content.some((block) => block && typeof block === "object" && "dshFileReviewMultiRepository" in block);
		if (!records && !hasMarker) return decision;
		return {
			...decision,
			content: [...cleanContent(content), ...(records ?? []).map(lifecycleBlock)]
		};
	});
	ctx.on("tools/result", (exec, result) => {
		const captured = pending.get(exec.token);
		pending.delete(exec.token);
		if (result.isError || !exec.agent || !captured) return;
		const ids = new Set(captured.map((record) => record.recordId));
		try {
			for (const record of lifecycleFromContent(result.content)) if (ids.has(record.recordId)) service.recordLifecycle(exec.agent, record);
		} catch {}
	});
	ctx.on("tools/ptc-dispatch-log", async (dispatch, next) => {
		const content = cleanContent(await next());
		if (dispatch.isError || !dispatch.agent) return content;
		const records = service.lifecycleRecords(dispatch.agent).filter((record) => record.rootCallId === String(dispatch.exec.rootCallId) && record.subCallId === String(dispatch.subCallId));
		return [...content, ...records.map(lifecycleBlock)];
	});
	ctx.effect(() => () => pending.clear());
}
//#endregion
//#region src/repository-config.ts
/** DSH's volatile schema preserves the service and recordings during live saves. */
const Config = schema.object({
	reviewSettingsOwner: schema.const("dsh-file-review-tab-multi-git-repository"),
	reviewSettings: schema.object({
		layout: schema.union([schema.const("unified"), schema.const("split")]).default("unified"),
		wrap: schema.boolean().default(true),
		dock: schema.boolean().default(true),
		adaptive: schema.boolean().default(true),
		foldMessages: schema.boolean().default(true)
	}).default({}).volatile(),
	enabled: schema.boolean().default(true).i18n({
		zh: "是否启用多代码仓管理",
		en: "Enable multi-repository management"
	}),
	projects: schema.array(schema.object({
		name: schema.string().default(""),
		root: schema.string().required(),
		enabled: schema.boolean().default(true).i18n({
			zh: "是否启用该项目的多代码仓管理",
			en: "Enable multi-repository management for this project"
		}),
		includeProjectRoot: schema.boolean().default(true),
		configFiles: schema.array(schema.string()).default([]),
		repositories: schema.array(schema.string()).default([])
	})).default([]).volatile()
});
//#endregion
//#region src/index.ts
/** Services required for the model guidance paired with the browser renderer. */
const inject = ["systemPrompt", "tools"];
/** Stable final-response guidance owned by the matching renderer. */
const FILE_REFERENCE_PROMPT = "When you successfully create or modify files, mention the primary outputs in your final response. To make those and any other changed-file references clickable in Web, format them as Markdown inline code using the exact file-tool path, or a basename when unique among the files changed in that turn.";
/**
* Register model guidance for the file-reference renderer shipped by this package,
* and the Code Mode (`run_code`) mutation recorder that backs the browser-side
* review tab.
*
* Nested dispatch results carry no wire views — the diff cards only ride
* model-direct tool/call frames — so reviewing programmatic file edits needs a
* second source: this listener snapshots the full `before`/`after` content of
* every nested file mutation (`edit`/`write` — recognized by result shape, not
* tool name) into the `fileReview` service, which the browser half later turns
* into line-level hunks and merges into the owning `run_code` turn.
* @param ctx - host context carrying the system-prompt registry and tool runtime.
*/
function apply(ctx, config) {
	const service = new FileReviewService(ctx, new RepositorySettings(ctx, config?.projects ?? []));
	registerLifecycleCapture(ctx, service);
	ctx.systemPrompt.section({
		name: "ui:file-review-tab-multi-git-repository:references",
		order: 190,
		text: FILE_REFERENCE_PROMPT
	});
	ctx.effect(() => ctx.on("tools/result", (exec, result) => {
		if (exec.parent === void 0 || exec.agent === void 0 || result.isError) return;
		const value = result.value;
		if (typeof value !== "object" || value === null || Array.isArray(value)) return;
		const candidate = value;
		if (typeof candidate.path !== "string" || typeof candidate.after !== "string") return;
		if (candidate.before !== null && typeof candidate.before !== "string") return;
		service.recordMutation(exec.agent, {
			rootCallId: String(exec.rootCallId),
			name: exec.name,
			path: candidate.path,
			before: candidate.before ?? null,
			after: candidate.after
		});
	}), "file-review-tab: ptc recorder");
}
//#endregion
export { Config, FileReviewService, apply, inject, transformFile };
