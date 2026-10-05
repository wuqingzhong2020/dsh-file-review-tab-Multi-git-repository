# Reviewing non-Git directories

Version 0.3.2 requires manager 0.1.2. The manager owns configuration, classification, discovery and file admission. Review adapts its shared Host service for session diffs, lifecycle capture, locations, undo/redo and Git comparison.

Add a target in the native management tab, choose Non-Git directory, name it and select its folder, then save. Discovery previews immediate children; explicitly add and save candidates. Internal paths persist relative to the project. External targets exist only in the current session. Existing v1 files upgrade to v2 with an exact `.v1.bak` when new fields are needed.

The tab title remains File Review (Multi-Git). The shared selector offers All Git repositories, individual Git repositories, All non-Git directories, individual ordinary directories and Ownership unresolved when historical records exist. Mixed projects default to Git, ordinary-only projects to directories. All Git excludes ordinary and unmanaged files even in session scopes.

Ordinary directories support Last turn, This session and Pending review. All five Git modes are disabled. Switching from a Git comparison restores the previous session mode, initially This session, and hides Git references. Existing tool records provide diffs; no synthetic whole-directory baseline is created.

Counts, batch copy, undo and confirmation apply only to displayed files. Deep links select the owner before expanding. Unmanaged history stays visible but cannot open or change files. Confirm N files in this scope records each file revision; hidden files remain pending, and late edits reopen only changed or new files. Legacy full-turn decisions expand only when their complete revision matches.

A nested ordinary target is excluded from its parent Git comparison. Unavailable targets, unknown discovery children, undisclosed nested Git roots, metadata and escaping links block parent fallback. Target conversions never rewrite historical comments or record provenance.

The implementation separates selection (`review-target-selection.ts`), epoch-fenced ownership (`use-target-ownership.ts`), file decisions (`review-confirmations.ts`) and Host adapters. Tests cover real Git boundaries, directory undo/redo, legacy decisions, session isolation and bilingual browser interactions.
