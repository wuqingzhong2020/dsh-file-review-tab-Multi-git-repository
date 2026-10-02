import { i as reviewSettingsSchema, r as reviewProjectSchema } from "./typert-descriptors.js";
import { lstat, readFile, realpath, stat } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { writeFileAtomic } from "@deepseek-ai/dsh-atomic-write";
import { TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { createHash } from "node:crypto";
import { z } from "zod";
import { execFile } from "node:child_process";
import { parsePatch } from "diff";
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
//#region src/repository-workspace.ts
/** Read repository manifests without executing project scripts or changing Git state. */
function pathKey(path) {
	return process.platform === "win32" ? path.toLowerCase() : path;
}
function unquote(value) {
	return /^(["']).*\1$/.test(value) ? value.slice(1, -1) : value;
}
/** ConfigParser-style INI, Git's .gitmodules, or JSON repository lists. */
function parseRepositoryManifest(text, filename) {
	text = text.replace(/^\uFEFF/, "");
	if (filename.toLowerCase().endsWith(".json")) {
		const value = JSON.parse(text);
		const entries = Array.isArray(value) ? value : value !== null && typeof value === "object" ? value.repositories : void 0;
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
	if (!filename.toLowerCase().endsWith(".ini") && basename(filename).toLowerCase() !== ".gitmodules") throw new Error("Supported formats: .ini, .gitmodules, .json");
	const entries = [];
	let section = "";
	for (const raw of text.split(/\r?\n/)) {
		const line = raw.trim();
		if (!line || line.startsWith("#") || line.startsWith(";")) continue;
		if (line.startsWith("[") && line.endsWith("]")) {
			section = line.slice(1, -1).replace(/^submodule\s+/, "");
			section = unquote(section);
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
function failure(error) {
	return error.code === "ENOENT" ? "Path does not exist" : error instanceof Error ? error.message : String(error);
}
async function previewProject(project) {
	if (!isAbsolute(project.root)) throw new Error("Project root must be an absolute path");
	const root = await realpath(project.root);
	if (!(await stat(root)).isDirectory()) throw new Error("Project root is not a directory");
	const normalized = {
		...project,
		root,
		configFiles: project.configFiles.map((file) => projectRepositoryPath(root, file)),
		repositories: project.repositories.map((path) => projectRepositoryPath(root, path)),
		namedRepositories: project.namedRepositories === void 0 ? void 0 : await Promise.all(project.namedRepositories.map(async (entry) => ({
			...entry,
			path: await canonicalRepositoryPath(root, entry.path)
		})))
	};
	const result = {
		project: normalized,
		repositories: [],
		warnings: [],
		roots: []
	};
	const candidates = normalized.repositories.map((path) => ({
		name: basename(path),
		path,
		source: "manual"
	}));
	candidates.push(...(normalized.namedRepositories ?? []).map((entry) => ({
		...entry,
		source: PROJECT_FILE_NAME
	})));
	for (const file of normalized.configFiles) {
		const filename = resolve(root, file);
		try {
			if ((await stat(filename)).size > 1048576) throw new Error("Configuration file exceeds 1 MiB");
			const entries = parseRepositoryManifest(await readFile(filename, "utf8"), filename);
			if (entries.length > 512) throw new Error("Configuration file exceeds 512 repositories");
			candidates.push(...entries.map((entry) => ({
				...entry,
				source: projectRepositoryPath(root, filename)
			})));
		} catch (error) {
			result.warnings.push(`${projectRepositoryPath(root, filename)}: ${failure(error)}`);
		}
	}
	if (project.includeProjectRoot) {
		candidates.unshift({
			name: project.name || basename(root),
			path: root,
			source: "project"
		});
		result.roots.push(root);
	}
	const seen = /* @__PURE__ */ new Set();
	for (const candidate of candidates) {
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
			else result.roots.push(path);
		} catch (error) {
			repo.state = error.code === "ENOENT" ? "missing" : "error";
			repo.reason = failure(error);
		}
		if (seen.has(pathKey(path))) continue;
		seen.add(pathKey(path));
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
//#region src/git-review.ts
/** Read-only Git review. Every repository is derived from the receiving session. */
const MAX_BYTES = 2097152;
const MAX_FILES = 1e3;
function git(root, args) {
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
			timeout: 15e3,
			maxBuffer: MAX_BYTES,
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
async function approved(workspace, cwd) {
	const candidates = workspace.project === null ? [{
		name: basename(cwd),
		path: cwd,
		state: "ready"
	}] : workspace.repositories.filter((repo) => repo.state === "ready");
	const repositories = [];
	const seen = /* @__PURE__ */ new Set();
	for (const candidate of candidates) try {
		const root = await realpath((await git(candidate.path, ["rev-parse", "--show-toplevel"])).trim());
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
async function diffArgs(root, request) {
	const hasHead = await git(root, [
		"rev-parse",
		"--verify",
		"HEAD"
	]).then(() => true, () => false);
	if (request.mode === "unstaged") return {
		args: [],
		comparison: "index → working tree"
	};
	if (request.mode === "staged") return {
		args: ["--cached"],
		comparison: "HEAD → index"
	};
	if (request.mode === "uncommitted") return {
		args: hasHead ? ["HEAD"] : ["--cached"],
		comparison: "HEAD → working tree"
	};
	if (!hasHead) throw new Error("This repository has no commits");
	const requested = request.ref || (request.mode === "commit" ? "HEAD" : "");
	if (!requested) throw new Error("Select a comparison branch");
	const oid = (await git(root, [
		"rev-parse",
		"--verify",
		"--end-of-options",
		`${requested}^{commit}`
	])).trim();
	if (!/^[0-9a-f]{40,64}$/i.test(oid)) throw new Error("Invalid commit");
	if (request.mode === "branch") return {
		args: [(await git(root, [
			"merge-base",
			"HEAD",
			oid
		])).trim(), "HEAD"],
		comparison: `${requested} merge-base → HEAD`
	};
	return {
		args: [await git(root, [
			"rev-parse",
			"--verify",
			`${oid}^`
		]).then((value) => value.trim(), async () => (await git(root, [
			"hash-object",
			"-t",
			"tree",
			"--stdin"
		])).trim()), oid],
		comparison: `${oid.slice(0, 8)} (${request.ref || "HEAD"})`
	};
}
const diffFlags = [
	"--no-ext-diff",
	"--no-textconv",
	"--no-color",
	"--ignore-submodules=all",
	"--find-renames"
];
function safePath(root, path) {
	if (!path || path.includes("\0") || isAbsolute(path) || !inside(root, resolve(root, path))) throw new Error("Invalid repository file path");
	return resolve(root, path);
}
function parseGitNames(output, repository) {
	const fields = output.split("\0");
	const files = [];
	for (let index = 0; index < fields.length - 1;) {
		const status = fields[index++];
		if (!status) continue;
		const first = fields[index++];
		const path = /^[RC]/.test(status) ? fields[index++] : first;
		if (!path) throw new Error("Incomplete Git name-status output");
		const existing = files.find((file) => file.path === path);
		if (existing) {
			if (status[0] === "U") existing.status = "U";
			continue;
		}
		files.push({
			repository,
			path,
			.../^[RC]/.test(status) ? { oldPath: first } : {},
			status: status[0],
			added: 0,
			removed: 0,
			binary: false,
			untracked: false
		});
	}
	return files;
}
function applyNumstat(output, files) {
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
async function untrackedText(root, path) {
	const candidate = safePath(root, path);
	const stat = await lstat(candidate);
	if (stat.isSymbolicLink() || !stat.isFile() || stat.size > MAX_BYTES) return {
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
async function changed(root, request) {
	if (request.mode === "branch" && !request.ref) {
		const current = (await git(root, [
			"symbolic-ref",
			"--quiet",
			"--short",
			"HEAD"
		]).catch(() => "")).trim();
		const branches = (await git(root, [
			"for-each-ref",
			"--format=%(refname:short)",
			"refs/heads",
			"refs/remotes"
		])).split("\n").filter(Boolean);
		const preferred = (await git(root, [
			"symbolic-ref",
			"--quiet",
			"--short",
			"refs/remotes/origin/HEAD"
		]).catch(() => "")).trim();
		request = {
			...request,
			ref: preferred || branches.find((branch) => /^(origin\/)?(main|master)$/.test(branch) && branch !== current) || branches.find((branch) => branch !== current && !branch.endsWith("/HEAD"))
		};
	}
	const comparison = await diffArgs(root, request);
	const files = parseGitNames(await git(root, [
		"diff",
		...diffFlags,
		...comparison.args,
		"--name-status",
		"-z",
		"--"
	]), root);
	applyNumstat(await git(root, [
		"diff",
		...diffFlags,
		...comparison.args,
		"--numstat",
		"-z",
		"--"
	]), files);
	if (request.mode === "uncommitted" && comparison.args.includes("--cached")) {
		const unstaged = parseGitNames(await git(root, [
			"diff",
			...diffFlags,
			"--name-status",
			"-z",
			"--"
		]), root);
		for (const file of unstaged) if (!files.some((item) => item.path === file.path)) files.push(file);
		for (let index = files.length - 1; index >= 0; index--) {
			const file = files[index];
			let content;
			try {
				content = await untrackedText(root, file.path);
			} catch (error) {
				if (error.code !== "ENOENT") throw error;
				files.splice(index, 1);
				continue;
			}
			file.added = content.text === "" ? 0 : content.text.replace(/\n$/, "").split("\n").length;
			file.removed = 0;
			file.binary = content.binary;
			file.untracked = true;
			file.status = "A";
		}
	}
	if (request.mode === "unstaged" || request.mode === "uncommitted") {
		const paths = (await git(root, [
			"ls-files",
			"--others",
			"--exclude-standard",
			"-z"
		])).split("\0").filter(Boolean);
		if (paths.length + files.length > MAX_FILES) throw new Error(`Review exceeds ${MAX_FILES} files; select a smaller scope`);
		for (const path of paths) {
			if (path.endsWith("/")) continue;
			if (files.some((item) => item.path === path)) continue;
			const content = await untrackedText(root, path);
			files.push({
				repository: root,
				path,
				status: "?",
				added: content.text === "" ? 0 : content.text.replace(/\n$/, "").split("\n").length,
				removed: 0,
				binary: content.binary,
				untracked: true
			});
		}
	}
	if (files.length > MAX_FILES) throw new Error(`Review exceeds ${MAX_FILES} files; select a smaller scope`);
	return {
		files,
		comparison: comparison.comparison,
		args: comparison.args
	};
}
async function gitReview(workspace, cwd, request) {
	const repositories = await approved(workspace, cwd);
	if (request.repository && !repositories.some((repo) => pathKey(repo.path) === pathKey(request.repository))) throw new Error("Repository is outside this session");
	const result = {
		repositories,
		files: [],
		warnings: [...workspace.warnings],
		comparisons: []
	};
	for (let start = 0; start < repositories.length; start += 4) await Promise.all(repositories.slice(start, start + 4).map(async (repo) => {
		if (request.repository && pathKey(repo.path) !== pathKey(request.repository)) return;
		try {
			repo.branch = (await git(repo.path, [
				"symbolic-ref",
				"--quiet",
				"--short",
				"HEAD"
			]).catch(() => "HEAD")).trim();
			if (request.mode === "commit" || request.mode === "branch") {
				repo.branches = (await git(repo.path, [
					"for-each-ref",
					"--format=%(refname:short)",
					"refs/heads",
					"refs/remotes"
				])).split("\n").filter((value) => value && !value.endsWith("/HEAD"));
				const fields = (await git(repo.path, [
					"log",
					"-50",
					"--format=%H%x00%s%x00%cs%x00"
				]).catch(() => "")).split("\0");
				for (let index = 0; index + 2 < fields.length; index += 3) repo.commits.push({
					oid: fields[index].trim(),
					subject: fields[index + 1],
					date: fields[index + 2]
				});
			}
			const changes = await changed(repo.path, request);
			result.files.push(...changes.files);
			result.comparisons.push(`${repo.name}: ${changes.comparison}`);
		} catch (error) {
			result.warnings.push(`${repo.name}: ${error instanceof Error ? error.message : String(error)}`);
		}
	}));
	result.files.sort((a, b) => a.repository.localeCompare(b.repository) || a.path.localeCompare(b.path));
	return result;
}
async function gitReviewDiff(workspace, cwd, request) {
	const repo = (await approved(workspace, cwd)).find((repo) => pathKey(repo.path) === pathKey(request.repository));
	if (!repo) throw new Error("Repository is outside this session");
	safePath(repo.path, request.path);
	const changes = await changed(repo.path, request);
	const file = changes.files.find((item) => item.path === request.path);
	if (!file) throw new Error("This file changed; refresh the review");
	if (file.binary) return {
		diffs: [],
		binary: true,
		note: "Binary, symbolic link, or file exceeds 2 MiB"
	};
	if (file.untracked) {
		const content = await untrackedText(repo.path, file.path);
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
	const patch = await git(repo.path, [
		"diff",
		...diffFlags,
		...changes.args,
		"--unified=2147483647",
		"--",
		...file.oldPath ? [file.oldPath] : [],
		file.path
	]);
	const diffs = parsePatch(patch).flatMap((part) => part.hunks.map((hunk) => {
		const oldLines = [];
		const newLines = [];
		let oldFinal = true;
		let newFinal = true;
		let previous = "";
		for (const line of hunk.lines) {
			if (line.startsWith("\\")) {
				if (previous !== "+") oldFinal = false;
				if (previous !== "-") newFinal = false;
				continue;
			}
			if (line[0] !== "+") oldLines.push(line.slice(1));
			if (line[0] !== "-") newLines.push(line.slice(1));
			previous = line[0] || "";
		}
		return {
			path: resolve(repo.path, file.path),
			oldText: oldLines.join("\n") + (oldLines.length && oldFinal ? "\n" : ""),
			newText: newLines.join("\n") + (newLines.length && newFinal ? "\n" : ""),
			oldStart: Math.max(1, hunk.oldStart),
			newStart: Math.max(1, hunk.newStart)
		};
	}));
	return {
		diffs,
		binary: /Binary files|GIT binary patch/.test(patch),
		note: diffs.length ? "" : "Rename or file mode change; no text difference"
	};
}
//#endregion
//#region src/file-review-service.ts
/** Host-side, workspace-contained undo / redo service for produced text diffs. */
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
async function resolveFile(cwd, requestedPath, roots) {
	const candidate = resolve(await realpath(cwd), requestedPath);
	const linkStat = await lstat(candidate);
	if (linkStat.isSymbolicLink()) throw new Error("symbolic links are not supported");
	if (!linkStat.isFile()) throw new Error("path is not a regular file");
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
async function inspectOne(cwd, file, roots) {
	if (file.diffs.length === 0 || !file.diffs.every((diff) => hunkSupported(diff, file.path))) return {
		path: file.path,
		state: "unsupported",
		changed: false,
		reason: "change has no complete reversible diff"
	};
	try {
		const inspected = inspectText((await resolveFile(cwd, file.path, roots)).lfText, file);
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
async function applyOne(cwd, file, action, roots) {
	if (file.diffs.length === 0 || !file.diffs.every((diff) => hunkSupported(diff, file.path))) return {
		path: file.path,
		state: "unsupported",
		changed: false,
		reason: "change has no complete reversible diff"
	};
	try {
		const resolved = await resolveFile(cwd, file.path, roots);
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
		const project = localFile !== null ? localFile.project : matched.project !== null ? {
			...matched.project,
			name: basename(matched.project.root)
		} : {
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
		const key = agentKey(agent);
		const list = this.recordLog.get(key);
		if (list === void 0) {
			this.recordLog.set(key, [mutation]);
			return;
		}
		list.push(mutation);
		if (list.length > RECORDED_PER_AGENT_CAP) list.splice(0, list.length - RECORDED_PER_AGENT_CAP);
	}
	/** Return the recorded mutations for the requested `run_code` roots. */
	async recorded(agent, request) {
		const list = this.recordLog.get(agentKey(agent));
		if (list === void 0 || request.rootCallIds.length === 0) return { mutations: [] };
		const wanted = new Set(request.rootCallIds);
		return { mutations: list.filter((mutation) => wanted.has(mutation.rootCallId)) };
	}
	/** Inspect current disk state without changing files. */
	async status(agent, request) {
		const cwd = sessionCwd(agent);
		const { roots } = await this.workspace(agent);
		return { files: await Promise.all(request.files.map((file) => inspectOne(cwd, file, roots))) };
	}
	/** Toggle every independently safe file while the receiving Agent is idle. */
	async apply(agent, request) {
		return agent.runMaintenance(async () => {
			const cwd = sessionCwd(agent);
			const { roots } = await this.workspace(agent);
			const files = [];
			for (const file of request.files) files.push(await applyOne(cwd, file, request.action, roots));
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
		return [...this.ctx.loader?.entries() ?? []].find((entry) => entry.fiber === this.ctx.fiber && entry.options.name === "dsh-file-review-tab-multi-git-repository");
	}
};
//#endregion
//#region src/repository-config.ts
/** DSH's volatile schema preserves the service and recordings during live saves. */
const Config = schema.object({
	enabled: schema.boolean().default(true).description("是否启用多代码仓管理"),
	projects: schema.array(schema.object({
		name: schema.string().default(""),
		root: schema.string().required(),
		enabled: schema.boolean().default(true).description("是否启用该项目的多代码仓管理"),
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
