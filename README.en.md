# dsh-file-review-tab-multi-git-repository

[简体中文](README.md) | [English](README.en.md)

Current version: **v0.2.0**.

**dsh-file-review-tab-multi-git-repository is a modified version of [dsh-file-review-tab](https://github.com/Lzh3070/dsh-file-review-tab), extended to manage multiple Git repositories and adapted for DeepSeek Harness Desktop 0.2.0-rc.2 using its native right sidebar, without a third-party sidebar requirement.**

Building on the original file review sidebar tab and end-of-turn review row, this plugin adds project-level repository configuration, review across repositories, review comments, and turn confirmations. The host's built-in change summaries, review page, and file mentions remain enabled.

## User documentation

Read the [Plugin user guide](docs/USER_GUIDE.en.md) ([Chinese version](docs/USER_GUIDE.md)) for step-by-step instructions and screenshots covering review scopes, multiple repositories, diff reading, external editor navigation, feedback and discussions. The **User guide** button beside the review scope opens the manual in a plugin dialog using the host's language setting, with Markdown formatting and screenshots. Click a screenshot to enlarge it.

## Developer documentation

Before developing or troubleshooting, read the [Architecture and development guide](docs/ARCHITECTURE.md) (Chinese). It covers the Host/Client boundary, the two diff data flows, repository configuration, communication contracts, state storage, file operation boundaries, and common entry points for changes. This README is the project entry point; consult the architecture guide alongside it.

Release maintainers should also read the [Public release and plugin marketplace guide](docs/RELEASING.md) (Chinese), which explains pushing source code to GitHub, uploading prebuilt packages, and applying for marketplace inclusion.

## Features

- **File search**: Each diff toolbar offers literal search, match counts, case sensitivity, whole-word matching, and before/after filtering. Recorded code in folded intervals is searchable; locating a match reveals only three nearby context lines on each side. Enter / F3 moves forward, Shift+Enter / Shift+F3 backward, and Esc closes search. Ctrl/Cmd+F opens search when the diff area has focus; comment editors retain their editing shortcuts. Results are capped at 10,000 with a visible limit notice.
- **Change navigation**: Toolbar arrows and a change selector cycle through modification blocks, show the current block and total, and indicate the target line. Ctrl/Cmd+↑ / ↓ works within the diff area. Switching layouts or UI languages retains the query and location.
- **Basic syntax highlighting**: File extensions identify C/C++, JavaScript, TypeScript, **Python 3**, JSON, and Markdown. Common keywords, strings, comments, and numbers are colored; Python triple-quoted strings are supported. Unknown types use plain text. Markdown remains source code. Long lines and hunks exceeding the highlighting budget retain their original text and line diff.
- **End-of-turn review row**: After a turn ends, a row shows the edited file count, additions and deletions, and Undo / Review actions. Clicking Review or an individual filename **opens the sidebar tab through a deep link, expands the relevant file's diff, and scrolls to the top of that turn's group**, instead of opening a full-width drawer. This is a separate entry that coexists with the host's native change card; it does not replace or disable it.
- **File review sidebar tab**: Lists files changed in the current session, grouped by turn. Expand a file to see a line-by-line red/green diff. Supports undoing a turn, undoing a single file, and reapplying changes. The tab badge updates with the changed file count.
- **Repository groups and content expansion**: Each group header shows the repository name and changed file count, with repository-relative file paths below it. The icon beside a repository header expands or collapses all file diffs in that repository. The turn header icon controls file contents across all repositories in that turn; in Git scopes, the icon beside the file count controls all currently displayed file contents. Collapsing contents keeps filenames visible. Clicking the repository name or its left arrow hides or shows the entire file list. If some files are already expanded, the icon first expands the rest, then collapses all on the next click. Each action affects only its own scope. Git diffs load on demand and are cached; bulk expansion requests at most four files concurrently.
- **GitHub-style diffs**: Old/new line-number columns, red/green change backgrounds, and blue hunk headers. By default, three context lines are kept around each change. The arrow on the left of a blue header reveals N more unchanged lines per click (20 by default). Middle intervals divide N lines between both ends; leading and trailing intervals expand outward from the change. Additional upward/downward double-arrow icons reveal all remaining unchanged lines in the adjacent interval, reaching the beginning or end of the recorded content, or the neighboring change block. An expanded interval keeps a local collapse icon, including after full expansion. Clicking it hides only that interval's expanded unchanged lines, leaving other intervals unchanged. Collapse expanded context restores the default display for all intervals.
- **Selection references**: Click a line number, then Shift+click on the same side for a contiguous range, or drag-select code from one version side. Right-click inside the selection or press Shift+F10 to copy a complete reference, copy its path and range, add a range comment, navigate externally or clear the selection. Right-clicking outside the range selects that line. References include repository, comparison source, side, revision and start/end lines. Cross-file, mixed-version and missing-history ranges are rejected; quote and adjacent context are each limited to 64 KiB.
- **External line navigation**: Open selections in the configured external IDE. VS Code is recommended; Antigravity IDE is also supported on Windows. The Host checks the session's permitted repository paths and current disk content before passing a new-version line number. Relocated references require confirmation. Ambiguous matches, old-version lines, deleted files and missing editors display explanations and retain the built-in file viewer.
- **Review settings**: Configure expansion count N (20 by default), code font, size, line height, tab width, theme or blue/orange colors, background intensity, external IDE path, scoped search/navigation shortcuts, discussion storage and large-file virtualization. Save applies immediately and stores preferences locally; Cancel or Esc discards edits. Settings apply to all eight scopes and both layouts; shortcuts remain inside the diff.
- **Two diff layouts**: Choose Unified or Split at the top. Unified lists removed and added lines vertically. Split shows the old version on the left and the new version on the right, aligning corresponding changes. Wrap lines can be turned off to inspect long lines with horizontal scrolling. Layout and wrapping choices are saved locally. Switching layouts preserves expanded context and comments. Both sides of the split view support comments on actual code lines, using their respective old/new line numbers.
- **Multi-repository management session tab**: Next to the conversation and trace tabs, add, edit, or remove repositories maintained by the current project. Save them to `dsh-file-review-repositories.json` in the project root. Switching projects loads the corresponding configuration. File review shows each file's repository and repository-relative path, with filtering by repository. Supports the main repository, nested repositories, and external repositories used temporarily in the current session.
- **Deleted files remain visible**: dsh has no file deletion tool, so deletions happen through terminal commands. The plugin parses literal path arguments in commands such as `rm`, `rmdir`, `unlink`, `Remove-Item`, `del`, and `rd`. Deleted files appear with a deleted marker in both review entry points. Their content is no longer available, so there is no line diff or undo. Deletions using wildcards (`rm *.log`) or command substitution (`rm $(...)`) are not recognized because the affected files cannot be enumerated afterward.
- **Automatic archiving**: The main list keeps the latest five turns; turns in progress are never archived. Older completed turns move into a collapsed Archived turns section at the bottom. Archived contents are not rendered while collapsed. Expanding it loads ten turns per page, with Load more for subsequent pages. Diff rows also mount lazily, avoiding dozens of diff groups mounting at once in long sessions. Deep links to archived turns automatically expand and locate them. Expansion state is remembered per session; the tab badge counts only the main list.
- **PTC / Code Mode support**: Nested `edit`/`write` calls inside `run_code` programs are captured. The Host snapshots the full before/after content, and the browser reconstructs line-numbered hunks and associates them with the correct turn. Diff viewing, status checks, undo, and reapply are supported. Standard mode behavior is unchanged; the end-of-turn review row still covers standard-mode turns only.
- **Review scopes**: Choose Last turn, This session, Pending review, Uncommitted, Unstaged, Staged, Committed, or Branch. Session scopes retain undo support. Pending review lists unconfirmed turns and supports confirming a turn, undoing a turn, and undoing individual files. Confirmations are stored locally per session and survive restarts; they can be undone in This session. Git scopes support worktree, index, historical commit, and branch comparisons, aggregated using the project's repository configuration.
- **Comments and discussions**: All eight scopes support single-line, range and whole-file comments; Git file operations remain read-only. Edit, delete and submit opinions in batches, queue while busy, and preserve the conversation draft. Failed submissions retain pending opinions. Discussions retain submitted batches and link text replies through request identity and actual turn admission, with unread/read, manual resolve/reopen and follow-up actions. One batch shares its reply; individual fixes are not inferred.
- **Large-file virtualization**: Visible blocks over 400 rows render a window of rows with measured wrapping and comment heights. Split cells are measured together, and editing rows remain mounted. Search and change navigation still cover complete recorded content. Virtualization can be disabled in Settings.
- **Session isolation**: Each session reviews files using its own project configuration. Status polling pauses while the tab is hidden.
- **Host language setting**: File review, multi-repository management, settings dialogs, comments, and the end-of-turn review row follow Chinese or English in General settings → Language. Changes apply immediately while preserving expanded diffs, comment drafts, and unsaved repository edits. Plugin notices and recognized error explanations switch language as well; paths, code, and user input keep their original text.
- **Narrow-container support**: In a half-width sidebar, turn headers wrap and secondary details such as line statistics and Open in built-in viewer yield space, keeping filenames and undo actions visible.
- **Style isolation**: CSS Modules and the host's `--dsw-alias-*` theme tokens keep styles isolated from the conversation area and other plugins.

## Installation

Supported versions: **DeepSeek Harness Desktop 0.2.0-rc.2**. File Review uses the native right sidebar; dsh-better-sidebar is optional. Install from a prebuilt GitHub Release `.tgz` or the public GitHub repository. Publishing to npm is not required.

The host chooses the built-in viewer for each file. Native previews may be read-only; optional editor plugins can provide editing for the formats they handle. External IDE navigation remains available separately.

The public package is named `dsh-file-review-tab-multi-git-repository-0.2.0.tgz` and is uploaded by the maintainer to the Assets section of the [GitHub Release](https://github.com/wuqingzhong2020/dsh-file-review-tab-Multi-git-repository/releases). Download and URL installation require the corresponding Release and asset to have been published first. See the [Release guide](docs/RELEASING.md) for the steps.

### DeepSeek Harness Desktop

For Desktop installed at `D:\app\DeepSeekHarnessDesktop`, download the Release `.tgz`, fully exit Desktop, then run the following in PowerShell. Replace the example path with the actual download location:

```powershell
pnpm --dir "$env:USERPROFILE\.dsh\profiles\desktop" add "D:\Downloads\dsh-file-review-tab-multi-git-repository-0.2.0.tgz"
```

Maintainers can also use the package with the same name in the project's `dist/` directory. Desktop manages the `desktop` Profile; use the local package installation method above. Restart Desktop after installation so that the Host and browser plugin load the new build. Open Multi-repository management at the top of the session, and open File Review from the native right sidebar's ＋ guide.

### Standalone Web Profile

Once the Release is published, install from the version-specific package URL:

```sh
dsh plugin --profile web add https://github.com/wuqingzhong2020/dsh-file-review-tab-Multi-git-repository/releases/download/v0.2.0/dsh-file-review-tab-multi-git-repository-0.2.0.tgz
```

You can also install from the public GitHub repository, which must retain `lib/` build outputs synchronized with the source:

```sh
dsh plugin --profile web add github:wuqingzhong2020/dsh-file-review-tab-Multi-git-repository
```

If hot reloading is disabled, restart `dsh web` after installation. For older host versions, refer to the upstream `dsh-file-review-tab` compatibility notes.

### Desktop directory picker starting-path adapter

The native directory picker in Desktop 0.2.0-rc.2 does not accept a starting path. To make Open start at the entered path, install the plugin, fully exit Desktop, then run the bundled compatibility script in PowerShell. Change the second argument if Desktop is installed elsewhere:

```powershell
node "$env:USERPROFILE\.dsh\profiles\desktop\node_modules\dsh-file-review-tab-multi-git-repository\scripts\patch-desktop-directory-picker.mjs" "D:\app\DeepSeekHarnessDesktop\resources\app.asar"
```

The adapter only adds a starting-path parameter to the native directory picker. It preserves existing window and sender checks and creates an `app.asar.dsh-directory-picker-*.bak` backup beside the original file. The script can be run repeatedly and stops for unsupported Desktop builds. Recheck the adapter after updating Desktop. Installing the `.tgz` alone does not modify the host.

## Public releases and plugin marketplace inclusion

**Publishing to npm is not required for marketplace inclusion.** This project can be distributed through a public GitHub source repository and prebuilt GitHub Release packages. Preparing a package, pushing source code, uploading Release assets, and requesting marketplace inclusion are separate steps.

See the [Public release and plugin marketplace guide](docs/RELEASING.md) for the complete `v0.2.0` packaging, push, and Release workflow. The bilingual [Release notes](docs/releases/version.md#v020) and [Marketplace YAML template](docs/market/wuqingzhong2020__dsh-file-review-tab-Multi-git-repository.yml) are also available. Submit the marketplace entry after uploading the installation package. The release guide and template are in Chinese.

The marketplace uses the [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) community directory. Users can find this plugin in the marketplace after its inclusion PR has been reviewed, merged, and synchronized. Consult the directory's [Contribution guide](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/blob/main/contributing.md) for its rules.

## Switching review scopes

The dropdown beside the File review title defaults to **Last turn**. Available scopes are:

- **Last turn / This session**: Tool-produced changes from the latest turn or the entire session, with undo and reapply. If the latest turn changed no files, the view is empty; it does not fall back to an earlier turn.
- **Pending review**: Unconfirmed tool-produced changes in the current session, grouped by turn. For example, after five turns of edits, confirming the first three with Confirm turn leaves only turns four and five in this scope. Confirmation applies to the whole turn across all repositories. A turn must finish before it can be confirmed. This session and Last turn show a confirmed marker, with Undo confirmation to return the turn to Pending review. Confirmations are stored locally per session; they do not change files or Git state and do not clear review comments. If additional changes are recorded for the same turn later, it becomes pending again. This scope retains safe undo and reapply. Older unconfirmed turns load ten at a time through Load more, rather than going into the collapsed archive.
- **Uncommitted**: The combined diff from HEAD to the current worktree, including untracked files.
- **Unstaged**: The diff from the index to the worktree, including untracked files.
- **Staged**: The diff from HEAD to the index.
- **Committed**: Changes in a commit relative to its first parent. After selecting a specific repository, choose from its latest 50 commits. All repositories defaults to each repository's latest commit.
- **Branch**: Committed changes from the merge base with the selected branch to the current HEAD. After selecting a specific repository, choose a local or remote branch. All repositories automatically selects each repository's default branch or another comparable branch. A message is shown when no comparison branch is available.

Git scopes use the project's repository configuration and the current session's temporary repositories. Filter by repository, expand line diffs, or open files in the editor. New, deleted, and renamed files are supported. Binary files, symbolic links, and untracked files larger than 2 MiB display an explanation. Git scopes are read-only: they do not stage, commit, switch branches, or undo changes. Use the refresh action in the upper-right corner to reread disk state.

Git context comes from the actual versions in the selected comparison, including the original code for historical commits. PTC / Code Mode can expand the full recorded before/after content. If a historical standard-tool turn recorded only a partial diff, missing content is marked as not recorded; current disk content is never substituted for a historical version. Expanding context does not change the original undo diff or comment anchors. Copy diff still copies the compact diff with three context lines.

## Search and navigation scope

Search and highlighting work in all eight review scopes and both layouts. Locations are isolated by session, repository, file, and comparison source. Removed lines appear only in before-version searches. Shared context is counted once when searching both versions. If historical records lack content, only recorded code is searched; current files are never read to fill historical gaps. Special characters in queries are matched literally.

Highlighting uses a lightweight lexer rather than a complete language parser. Lines longer than 16,000 characters use plain text. Each diff component has a 500,000-character highlighting budget; hunks exceeding the remaining budget use plain text. Search, original line numbers, comments, statistics, copying, and undo still use the original diff. Visible blocks over 400 rows use variable-height virtualization by default; disabling it restores all-row mounting. See the [v0.2.0 validation record](docs/releases/version.md#v020-验证记录) for measurements and validation limits.

## Selection references and external navigation

Click an old/new line number, then Shift+click another number on the same side to select complete contiguous lines, including recorded folded lines between the endpoints. Right-click inside the selection or press Shift+F10 while a line number has focus to open the actions menu. **Copy line reference** copies text without editing the conversation draft. **Comment on selection** opens an editor at the start of the range. Layout and language changes retain selection; changing the file or diff revision clears it.

**Open selection in external IDE** in the context menu verifies the file on disk first. Matching full versions retain their coordinates; partial sources require a unique quote and adjacent context match. Moved references require confirmation through the notice in the menu. Old-version coordinates cannot identify current files. New-side index, commit, branch and older-turn content must pass the same checks. Successful launch means the request was handed to the editor; it does not guarantee focus or that unsaved buffers match disk.

Leave **External IDE executable path** empty to detect the recommended VS Code, or enter an absolute executable path without arguments. Windows currently supports `Code.exe` and `Antigravity IDE.exe`, for example `D:\app\Antigravity IDE\Antigravity IDE.exe`; other IDEs need adapters for their line-navigation arguments. Navigation accepts ordinary UTF-8 files up to 16 MiB. Deleted, binary, out-of-scope and unverifiable files never receive guessed line numbers.

## Submitting file review comments

Expand a diff in any scope. Hover over the left side of a code line and click **＋**, or select a range and choose **Comment on selection**. Enter an opinion, then click the comment action or press Ctrl+Enter. Added lines reference new-version line numbers; deleted lines reference old-version line numbers. Use the comment action beside a file for whole-file feedback, including files without an available text diff.

Adding a comment saves a pending draft. The top review comments button lets you view, edit, and delete opinions from different files and scopes together. Submit them as one message to the Agent in the associated session. The conversation draft is preserved; busy sessions queue the message. Failed submissions retain drafts; successful ones clear only the submitted drafts. **Discussions** keeps the submitted content and linked replies by default. Disabling discussion storage sends new feedback normally without creating new local batches.

Comments are stored locally per session and remain available after changing scopes, filtering repositories, or restarting. They are not written to `dsh-file-review-repositories.json`. Last turn, This session, and Pending review share comments for the same turn. When diff content changes, existing comments retain their original references and show a notice instead of moving automatically to another code line. The submitted message asks the Agent to verify the current file content before acting on those comments.

Discussions distinguish queued, running, answered, cancelled, failed and uncertain submissions. Replies follow request ID → user event → actual turn, never an unrelated latest Agent message. Expand **Agent reply to this batch**, mark read, resolve/reopen manually, or **Add follow-up** to create a new draft with the original batch context. Restart never resends automatically; inspect the conversation before resending an uncertain request. Hosts without request identity support keep replies in the conversation only. Storage failures are visible and current records remain in memory.

Outdated pending drafts from the new side of Uncommitted/Unstaged can **Check current location**. A unique match requires explicit confirmation and must also match the loaded diff model before updating. Historical references and submitted opinions always retain their original anchors.

## Configuring a multi-repository project

Open a session for the target project and select **Multi-repository management** beside the conversation and trace tabs. The session determines the current project directory and name; they cannot be edited here. Each project maintains its own configuration file.

1. If the project has no configuration file, **Reload saved configuration** is disabled and the save action reads **Generate new configuration file**. Click **Add repository** and enter its name and path. Each row's **Open** action starts from that row's existing valid directory, accepting both project-relative and absolute paths. Empty, nonexistent, or non-directory paths fall back to the current project directory. Selected directories inside the project become relative paths; directories outside it remain absolute. **Remove** asks for confirmation and removes only the list entry, leaving the directory on disk intact. Checkboxes control whether multi-repository management is enabled and whether files in the project root are reviewed as well.
2. Click **Generate new configuration file**. The plugin creates `dsh-file-review-repositories.json` in the current project root and shows the Git status of each repository below. The action then changes to **Save configuration**, and reloading becomes available. The root is shown as `.`, and child repositories use relative paths such as `project/PluginManager`.
3. Subsequent sessions in the project or its subdirectories automatically discover and read this file. It can be kept with the project or committed to Git. **Projects without this file do not enable multi-repository scope** and continue to review using the original session directory.

Example configuration:

```json
{
  "version": 1,
  "includeProjectRoot": true,
  "repositories": [
    { "name": "PluginManager", "path": "project/PluginManager" },
    { "name": "ThirdPartyManager", "path": "project/ThirdPartyManager" }
  ]
}
```

Repository paths are resolved relative to the **current project root**. Only repositories inside the project are saved as relative paths. Repositories outside it, including parent or sibling directories on the same drive and directories on other drives, are shown as absolute paths and marked temporary. They are used only in the current session and **are not written to the configuration file**. The temporary badge appears on the right side of the path input; hovering over it shows the full explanation. It does not increase row height, keeping inputs and action buttons aligned. Manually entered `../` paths that point outside the project are also converted to absolute paths. Junctions pointing outside the project are not saved either. The plugin does not clone, pull, or modify repositories. After editing the configuration file directly, click **Reload saved configuration** to load the new content.

If an older Profile contains `submodules.ini`, `.gitmodules`, or another repository manifest, opening the management page imports recognized repositories as editable rows for explicit migration. The old Profile entry alone does not enable multi-repository scope. After the first save, the new configuration file takes over and the old manifest is no longer a dependency. For example, ProjectManager's `submodules.ini` is used only for a one-time migration. New projects need no repository manifest.

Files inside the project root are reviewed by default. Disable the corresponding option if you only want to maintain the listed child repositories. Sessions in the project root or its subdirectories automatically use the nearest project configuration file. Temporary external repositories belong only to the session that added them and do not affect other projects or sessions. Unconfigured sessions retain the original session-directory scope.

Undo and reapply are restricted to the currently matched project scope. The Host checks real paths and rejects attempts to cross the permitted boundaries through symbolic links or directory junctions. New files, deletions, conflicts, and files without complete diffs retain the original handling rules.

## Development validation

Use Node.js 24 and pnpm 11, and first run `pnpm install --frozen-lockfile` to install the locked dependencies. Some tests import `.ts` files directly, while others import `lib/index.js`. Keep source code and `lib/` synchronized when developing features.

```powershell
pnpm typecheck
pnpm build
node --test tests/*.test.mjs
```

Tests use temporary repository directories and cover separate projects, INI/JSON manifests, external repositories, path deduplication, Windows path recognition, real-path boundaries for undo, Git worktree/index comparisons, historical commits, branches, new files, renames, deletions, and repositories without HEAD. They do not modify the actual project repositories.

Tests require neither Desktop nor the maintainer's project directories. Git integration tests require `git` on PATH. Link-boundary tests require a writable system temporary directory and permission to create directory links. Personal Git configuration is not yet fully isolated, so cross-platform results must be verified on the relevant platforms; passing on one machine does not establish support everywhere. See the [Architecture guide's validation notes](docs/ARCHITECTURE.md#102-验证能力与当前仓库情况) (Chinese) for environment requirements and planned improvements. `tests/` is development source and belongs in Git; it is excluded from the installation package.

## Acknowledgments

This plugin modifies and extends [Lzh3070/dsh-file-review-tab](https://github.com/Lzh3070/dsh-file-review-tab). Thanks to its author for the file review sidebar tab, conversation review row, and related foundations.

The upstream core diff renderer and undo service originate from [left0ver/dsh-file-review](https://github.com/left0ver/dsh-file-review) (MIT License, © ZhangWenChao). Sidebar integration uses the host’s native tab registry and body/title slots. Thanks to [dsh-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) for the earlier integration reference.

## License

[MIT](./LICENSE)
