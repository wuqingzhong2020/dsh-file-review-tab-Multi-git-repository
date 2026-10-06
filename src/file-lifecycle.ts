/** Exact images and filesystem transitions, restricted to the current session roots. */
import { lstat, open, readFile, realpath, unlink } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import { writeFileAtomic } from '@deepseek-ai/dsh-atomic-write'
import { inside } from 'dsh-multi-git-repo-manager/workspace'
import { CAPTURE_MAX_BYTES, type LifecycleImage, type LifecycleRecord } from './lifecycle-record.ts'
import type { FileReviewAction, FileReviewFileResult } from './change-types.ts'

export async function lifecyclePath(
  cwd: string,
  path: string,
  roots: readonly string[],
): Promise<string> {
  const candidate = resolve(await realpath(cwd), path)
  // Missing targets must still have an existing, authorized real parent.
  const parent = await realpath(dirname(candidate))
  const filename = join(parent, basename(candidate))
  if (!roots.some(root => inside(root, filename))) {
    throw new Error('resolved path is outside the configured project repositories')
  }
  return filename
}

export async function captureImage(filename: string): Promise<LifecycleImage | null> {
  let stat
  try {
    stat = await lstat(filename)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error('lifecycle requires a regular file without symbolic links')
  }
  if (stat.size > CAPTURE_MAX_BYTES) throw new Error('file exceeds the lifecycle capture budget')
  const bytes = await readFile(filename)
  const text = bytes.toString('utf8')
  if (bytes.length > CAPTURE_MAX_BYTES || text.includes('\0') || !Buffer.from(text).equals(bytes)) {
    throw new Error('file is not ordinary UTF-8 text')
  }
  const checked = await lstat(filename)
  if (!sameIdentity(checked, stat) || checked.mtimeMs !== stat.mtimeMs || checked.size !== stat.size) {
    throw new Error('file changed during lifecycle capture')
  }
  return { text, mode: stat.mode & 0o777, dev: stat.dev, ino: stat.ino }
}

/** Content equality deliberately ignores inode changes made by our own atomic writes. */
export function sameLifecycleImage(a: LifecycleImage | null, b: LifecycleImage | null): boolean {
  return a === null || b === null ? a === b : a.text === b.text && a.mode === b.mode
}

function sameIdentity(
  a: Pick<LifecycleImage, 'dev' | 'ino'>,
  b: Pick<LifecycleImage, 'dev' | 'ino'>,
): boolean {
  return a.dev === b.dev && a.ino === b.ino
}

async function writeImage(
  filename: string,
  current: LifecycleImage | null,
  target: LifecycleImage | null,
): Promise<void> {
  if (target === null) {
    await unlink(filename)
  } else if (current === null) {
    // Exclusive creation refuses a file that appeared after the final check.
    const handle = await open(filename, 'wx', target.mode)
    try {
      await handle.writeFile(target.text)
      await handle.sync()
    } finally {
      await handle.close()
    }
  } else {
    await writeFileAtomic(filename, target.text, { mode: target.mode })
  }
}

/** Host verified records are the sole authority for whole-file writes/deletions. */
export async function applyLifecycle(
  cwd: string,
  path: string,
  roots: readonly string[],
  records: readonly LifecycleRecord[],
  action?: FileReviewAction,
  identities?: Map<string, LifecycleImage>,
): Promise<FileReviewFileResult> {
  const result = (
    state: FileReviewFileResult['state'],
    reason?: string,
    changed = false,
  ): FileReviewFileResult => ({ path, state, changed, ...(reason ? { reason } : {}) })
  if (!records.length || records.some(record => !record.complete)) {
    return result('unsupported', 'change has no complete trusted lifecycle record')
  }
  try {
    const filename = await lifecyclePath(cwd, path, roots)
    if (records.some(record => record.filename !== filename)) {
      return result('unsupported', 'lifecycle path does not match the current repository authorization')
    }
    for (let index = 1; index < records.length; index++) {
      if (!sameLifecycleImage(records[index - 1]!.after, records[index]!.before)) {
        return result('unsupported', 'lifecycle sequence is incomplete')
      }
    }
    const before = records[0]!.before
    const after = records.at(-1)!.after
    const current = await captureImage(filename)
    if (sameLifecycleImage(before, after)) return result('unsupported', 'lifecycle has no net file change')
    const state = sameLifecycleImage(current, after)
      ? 'applied'
      : sameLifecycleImage(current, before) ? 'undone' : 'conflict'
    if (state === 'conflict') {
      return result(state, 'current content or permissions do not match the recorded change')
    }
    if (!action || state === (action === 'undo' ? 'undone' : 'applied')) return result(state)
    const target = action === 'undo' ? before : after
    const expected = action === 'undo' ? after : before
    const identityKey = records.map(record => record.recordId).join(':')
    const identity = identities?.get(identityKey) ?? expected
    if (current && identity && !sameIdentity(current, identity)) {
      return result('conflict', 'file was replaced at the recorded path')
    }
    const rechecked = await captureImage(filename)
    if (!sameLifecycleImage(current, rechecked)
      || (current && rechecked && !sameIdentity(current, rechecked))) {
      return result('conflict', 'file changed while the operation was being prepared')
    }
    await writeImage(filename, current, target)
    const written = await captureImage(filename)
    if (written) identities?.set(identityKey, written)
    else identities?.delete(identityKey)
    return result(action === 'undo' ? 'undone' : 'applied', undefined, true)
  } catch (error) {
    return result('error', error instanceof Error ? error.message : String(error))
  }
}
