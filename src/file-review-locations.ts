/** Host disk checks and editor admission for references to reviewed text. */
import { lstat, realpath } from 'node:fs/promises'
import { resolve } from 'node:path'
import { findVSCode, launchVSCode, vscodeArguments } from './editor-launch.ts'
import { resolveReviewFile } from './file-review-files.ts'
import {
  locateReviewReference,
  type ReviewLocationRequest,
  type ReviewLocationResult,
} from './review-location.ts'
import type { ReviewWorkspace } from './repository-types.ts'
import { inside, pathKey } from './repository-workspace.ts'

const MAX_REFERENCE_FILE_BYTES = 16 * 1024 * 1024

interface ReferenceFileAccess {
  workspace(): Promise<ReviewWorkspace>
  cwd(): string
}

interface ReferenceEditorAccess extends ReferenceFileAccess {
  locateReference(): Promise<ReviewLocationResult>
}

export async function locateReferenceOnDisk(
  request: ReviewLocationRequest,
  access: ReferenceFileAccess,
): Promise<ReviewLocationResult> {
  try {
    const { roots } = await access.workspace()
    const repository = await realpath(request.repository)
    if (!roots.some(root => pathKey(root) === pathKey(repository))) {
      return { state: 'unsupported', reason: 'scope' }
    }
    const candidate = resolve(access.cwd(), request.path)
    if (!inside(repository, candidate)) {
      return { state: 'unsupported', reason: 'scope' }
    }
    const metadata = await lstat(candidate)
    if (metadata.size > MAX_REFERENCE_FILE_BYTES) {
      return { state: 'unsupported', reason: 'size' }
    }
    const file = await resolveReviewFile(access.cwd(), request.path, roots)
    if (!inside(repository, file.filename)) {
      return { state: 'unsupported', reason: 'scope' }
    }
    if (file.lfText.includes('\0')) {
      return { state: 'unsupported', reason: 'binary' }
    }
    return locateReviewReference(file.lfText, request)
  } catch (cause) {
    const missing =
      typeof cause === 'object' && cause !== null && 'code' in cause && cause.code === 'ENOENT'
    return { state: missing ? 'missing' : 'unsupported' }
  }
}

export async function openReferenceInEditor(
  request: ReviewLocationRequest,
  access: ReferenceEditorAccess,
): Promise<ReviewLocationResult> {
  if (request.side !== 'new') return { state: 'unsupported', reason: 'old' }
  const located = await access.locateReference()
  const canOpen = located.state === 'exact' || (located.state === 'moved' && request.allowRelocate)
  if (!canOpen) return located

  const executable = await findVSCode(request.editorPath)
  if (executable === null) return { state: 'editor-missing' }
  // Check again after executable detection (registry lookups can take time).
  const current = await access.locateReference()
  if (
    current.line !== located.line ||
    current.endLine !== located.endLine ||
    current.state !== located.state
  ) {
    return { state: 'changed' }
  }
  try {
    const { roots } = await access.workspace()
    const file = await resolveReviewFile(access.cwd(), request.path, roots)
    if (!inside(await realpath(request.repository), file.filename)) {
      return { state: 'unsupported', reason: 'scope' }
    }
    if (file.lfText.includes('\0')) {
      return { state: 'unsupported', reason: 'binary' }
    }
    const final = locateReviewReference(file.lfText, request)
    if (final.line !== located.line || final.state !== located.state) {
      return { state: 'changed' }
    }
    await launchVSCode(executable, vscodeArguments(file.filename, located.line!))
    return { ...located, state: 'started' }
  } catch {
    return { state: 'error', reason: 'launch' }
  }
}
