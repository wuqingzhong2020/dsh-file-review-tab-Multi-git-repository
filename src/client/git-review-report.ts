import type { GitReviewDiff, GitReviewFile } from '../git-review-types.ts'
import { COPY_BYTE_LIMIT, COPY_FILE_LIMIT, type AggregateDiffFile } from './aggregate-diff.ts'
import { loadMissingReviewDiffs } from './git-review-diff-loader.ts'

export function gitReviewFileKey(file: Pick<GitReviewFile, 'repository' | 'path'>): string {
  return `${file.repository}\0${file.path}`
}

interface GitReviewReportOptions {
  source: string
  load: (file: GitReviewFile) => Promise<GitReviewDiff>
  /** Refuse cancellation or a changed comparison before and after each asynchronous read. */
  ensureActive: () => void
}

/** Retain file order and partial failures while bounding the in-memory copy payload. */
export async function loadGitReviewReport(
  files: readonly GitReviewFile[],
  { source, load, ensureActive }: GitReviewReportOptions,
): Promise<AggregateDiffFile[]> {
  if (files.length > COPY_FILE_LIMIT) throw new Error('Copy exceeds the 256-file budget')
  const output = new Map<string, AggregateDiffFile>()
  const encoder = new TextEncoder()
  let retainedBytes = 0
  await loadMissingReviewDiffs(files, gitReviewFileKey, new Set(), async file => {
    ensureActive()
    let diff: GitReviewDiff | undefined
    let failure: string | undefined
    try {
      diff = await load(file)
    } catch (error) {
      failure = String(error)
    }
    ensureActive()
    retainedBytes += encoder.encode(JSON.stringify(diff ?? failure)).length
    if (retainedBytes > COPY_BYTE_LIMIT) throw new Error('Copy exceeds the 2 MiB budget')
    const note = failure || diff?.note || (diff?.binary ? 'Binary file' : undefined)
    output.set(gitReviewFileKey(file), {
      repository: file.repository,
      path: file.path,
      source,
      diffs: diff?.diffs ?? [],
      ...(note ? { note } : {}),
    })
  })
  ensureActive()
  return files.map(file => output.get(gitReviewFileKey(file))!)
}
