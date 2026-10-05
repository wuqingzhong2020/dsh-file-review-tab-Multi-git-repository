/** Shared identities and Host contract for the session review page. */
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import type {
  FileReviewRequest,
  FileReviewResult,
  RecordedRequest,
  RecordedResult,
} from '../change-types.ts'
import type { ReviewWorkspace } from '../repository-types.ts'
import type { SessionFileChange } from './session-changes.ts'
import type { UnifiedDiffStats } from './UnifiedDiff.tsx'

export type { ReviewMode } from '../review-scopes.ts'

export interface FileReviewRemote {
  workspace(): Promise<RemoteResult<ReviewWorkspace>>
  status(request: FileReviewRequest): Promise<RemoteResult<FileReviewResult>>
  apply(request: FileReviewRequest): Promise<RemoteResult<FileReviewResult>>
  recorded(request: RecordedRequest): Promise<RemoteResult<RecordedResult>>
}

/** One flattened (turn, file) change unit used for status and apply requests. */
export interface FlatChange {
  readonly turn: number
  readonly path: string
  readonly diffs: SessionFileChange['diffs']
  /** Deleted paths stay listed but never reach the Host inspector. */
  readonly deleted?: true
}

/** Keep the existing row identity: expansion, status and deep links share it. */
export function stateKey(turn: number, path: string): string {
  return `${turn}|${path}`
}

/** UI eligibility only: contextual hunks or lifecycle identities still need Host validation. */
export function isReversible(file: SessionFileChange): boolean {
  return (
    file.diffs.length > 0 &&
    file.diffs.every(
      diff =>
        diff.path === file.path &&
        (diff.recordId !== undefined || diff.oldText !== null) &&
        (diff.recordId !== undefined || diff.oldText !== diff.newText) &&
        (diff.oldText !== '' || diff.oldStart !== undefined) &&
        (diff.newText !== '' || diff.newStart !== undefined),
    )
  )
}

export function addStats(left: UnifiedDiffStats, right: UnifiedDiffStats): UnifiedDiffStats {
  return { added: left.added + right.added, removed: left.removed + right.removed }
}
