import type { ProducedFileDiff } from '../change-types.ts'
import { normalizeReviewPath } from './repository-paths.ts'

export type CommentScope =
  | 'last-turn'
  | 'session'
  | 'pending'
  | 'uncommitted'
  | 'unstaged'
  | 'staged'
  | 'commit'
  | 'branch'
export interface ReviewCommentTarget {
  readonly scope: CommentScope
  readonly turn?: number | undefined
  readonly repository: string
  readonly repositoryName: string
  readonly path: string
  readonly absolutePath: string
  readonly ref?: string | undefined
}
export interface ReviewCommentLine {
  readonly kind: 'context' | 'add' | 'del'
  readonly oldNumber: number | null
  readonly newNumber: number | null
  readonly text: string
}
export interface ReviewCommentAnchor extends ReviewCommentTarget {
  readonly side: 'old' | 'new' | 'file'
  readonly line: number | null
  readonly quote: string
  readonly before: string
  readonly after: string
  readonly revision: string
  readonly endLine?: number | undefined
  readonly sourceKey?: string | undefined
}
export interface ReviewComment {
  readonly id: string
  readonly anchor: ReviewCommentAnchor
  readonly text: string
  readonly discussionId?: string | undefined
}
export const COMMENT_TEXT_LIMIT = 6000

function pathKey(path: string): string {
  const normalized = normalizeReviewPath(path)
  return /^[A-Za-z]:/.test(normalized) || normalized.startsWith('//')
    ? normalized.toLowerCase()
    : normalized
}
/** Session review scopes address the same recorded turn, regardless of the filter. */
export function commentFileKey(target: ReviewCommentTarget): string {
  const source =
    target.scope === 'session' || target.scope === 'last-turn' || target.scope === 'pending'
      ? `turn:${target.turn}`
      : target.scope
  return JSON.stringify([
    pathKey(target.repository),
    pathKey(target.absolutePath),
    source,
    target.ref ?? '',
  ])
}
export function commentAnchorKey(anchor: ReviewCommentAnchor): string {
  return JSON.stringify([
    commentFileKey(anchor),
    anchor.side,
    anchor.line,
    anchor.endLine ?? anchor.line,
    anchor.revision,
    anchor.quote,
    anchor.sourceKey ?? '',
  ])
}
/** A deterministic snapshot tag: comments never silently move to another diff revision. */
export function reviewDiffRevision(diffs: readonly ProducedFileDiff[]): string {
  let hash = 2166136261
  const add = (value: string) => {
    for (let index = 0; index < value.length; index++)
      hash = Math.imul(hash ^ value.charCodeAt(index), 16777619)
    hash = Math.imul(hash ^ 0xff, 16777619)
  }
  for (const diff of diffs) {
    add(diff.path)
    add(String(diff.oldStart))
    add(String(diff.newStart))
    add(diff.oldText === null ? '\0' : diff.oldText)
    add(diff.newText)
  }
  return (hash >>> 0).toString(16)
}
export function fileCommentAnchor(target: ReviewCommentTarget): ReviewCommentAnchor {
  return { ...target, side: 'file', line: null, quote: '', before: '', after: '', revision: '' }
}

const referenceIndexes = new WeakMap<
  readonly ReviewCommentLine[],
  {
    old: ReviewCommentLine[]
    next: ReviewCommentLine[]
    oldIndex: WeakMap<ReviewCommentLine, number>
    newIndex: WeakMap<ReviewCommentLine, number>
  }
>()

/** Full-file context must not be scanned again for every visible comment line. */
function referenceIndex(lines: readonly ReviewCommentLine[]) {
  let index = referenceIndexes.get(lines)
  if (!index) {
    index = { old: [], next: [], oldIndex: new WeakMap(), newIndex: new WeakMap() }
    for (const row of lines) {
      if (row.oldNumber !== null) {
        index.oldIndex.set(row, index.old.length)
        index.old.push(row)
      }
      if (row.newNumber !== null) {
        index.newIndex.set(row, index.next.length)
        index.next.push(row)
      }
    }
    referenceIndexes.set(lines, index)
  }
  return index
}
export function lineCommentAnchor(
  target: ReviewCommentTarget,
  row: ReviewCommentLine,
  lines: readonly ReviewCommentLine[],
  revision: string,
  contextSide: 'old' | 'new' = 'new',
): ReviewCommentAnchor {
  const side = row.kind === 'del' ? 'old' : row.kind === 'add' ? 'new' : contextSide
  const reference = referenceIndex(lines)
  const sameSide = side === 'old' ? reference.old : reference.next
  const index = (side === 'old' ? reference.oldIndex : reference.newIndex).get(row) ?? -1
  const excerpt = (items: readonly ReviewCommentLine[]) =>
    items.map(line => line.text.slice(0, 1000)).join('\n')
  return {
    ...target,
    side,
    line: side === 'old' ? row.oldNumber : row.newNumber,
    quote: row.text.slice(0, 2000),
    before: index < 0 ? '' : excerpt(sameSide.slice(Math.max(0, index - 2), index)),
    after: index < 0 ? '' : excerpt(sameSide.slice(index + 1, index + 3)),
    revision,
  }
}

export function parseReviewComments(raw: string): readonly ReviewComment[] {
  const data: unknown = JSON.parse(raw)
  if (
    !data ||
    typeof data !== 'object' ||
    !('version' in data) ||
    data.version !== 1 ||
    !('comments' in data) ||
    !Array.isArray(data.comments)
  )
    throw new Error('Invalid review comment data')
  const ids = new Set<string>()
  return data.comments.map((item: unknown) => {
    if (!item || typeof item !== 'object') throw new Error('Invalid review comment')
    const value = item as Record<string, unknown>
    const anchor = value.anchor as Record<string, unknown> | undefined
    if (
      typeof value.id !== 'string' ||
      ids.has(value.id) ||
      typeof value.text !== 'string' ||
      !value.text.trim() ||
      value.text.length > COMMENT_TEXT_LIMIT ||
      !anchor
    )
      throw new Error('Invalid review comment')
    ids.add(value.id)
    if (
      ![
        'last-turn',
        'session',
        'pending',
        'uncommitted',
        'unstaged',
        'staged',
        'commit',
        'branch',
      ].includes(String(anchor.scope)) ||
      !['old', 'new', 'file'].includes(String(anchor.side))
    )
      throw new Error('Invalid review anchor')
    for (const field of [
      'repository',
      'repositoryName',
      'path',
      'absolutePath',
      'quote',
      'before',
      'after',
      'revision',
    ])
      if (typeof anchor[field] !== 'string') throw new Error('Invalid review anchor')
    if (
      anchor.side === 'file'
        ? anchor.line !== null
        : typeof anchor.line !== 'number' || !Number.isInteger(anchor.line) || anchor.line < 1
    )
      throw new Error('Invalid review line')
    if (
      anchor.endLine !== undefined &&
      (anchor.side === 'file' ||
        typeof anchor.endLine !== 'number' ||
        !Number.isSafeInteger(anchor.endLine) ||
        anchor.endLine < Number(anchor.line))
    )
      throw new Error('Invalid review range')
    for (const field of ['ref', 'sourceKey'])
      if (anchor[field] !== undefined && typeof anchor[field] !== 'string')
        throw new Error('Invalid review source')
    if (anchor.scope === 'session' || anchor.scope === 'last-turn' || anchor.scope === 'pending') {
      if (typeof anchor.turn !== 'number' || !Number.isInteger(anchor.turn) || anchor.turn < 1)
        throw new Error('Invalid review turn')
    }
    if (value.discussionId !== undefined && typeof value.discussionId !== 'string')
      throw new Error('Invalid discussion link')
    return {
      id: value.id,
      text: value.text,
      anchor: anchor as unknown as ReviewCommentAnchor,
      ...(typeof value.discussionId === 'string' ? { discussionId: value.discussionId } : {}),
    }
  })
}

export interface CommentMessageLabels {
  readonly introduction: string
  readonly repository: string
  readonly file: string
  readonly source: string
  readonly reference: string
  readonly opinion: string
  readonly scope: (scope: CommentScope) => string
  readonly turn: (turn: number) => string
  readonly position: (anchor: ReviewCommentAnchor) => string
}
function codeBlock(text: string): string {
  const longest = Math.max(2, ...[...text.matchAll(/`+/g)].map(match => match[0].length))
  const fence = '`'.repeat(longest + 1)
  return `${fence}text\n${text}\n${fence}`
}
export function formatReviewComments(
  comments: readonly ReviewComment[],
  labels: CommentMessageLabels,
): string {
  return [
    labels.introduction,
    ...comments.map((comment, index) => {
      const anchor = comment.anchor
      return [
        `${index + 1}. [${anchor.repositoryName}] ${anchor.path}`,
        `${labels.repository}: ${anchor.repository}`,
        `${labels.file}: ${anchor.absolutePath}`,
        `${labels.source}: ${labels.scope(anchor.scope)}${anchor.turn === undefined ? '' : ` · ${labels.turn(anchor.turn)}`}${anchor.ref ? ` · ${anchor.ref}` : ''} · ${labels.position(anchor)}${anchor.revision ? ` · ${anchor.revision}` : ''}`,
        ...(anchor.side === 'file'
          ? []
          : [
              `${labels.reference}:`,
              codeBlock(
                [
                  anchor.before,
                  anchor.quote
                    .split('\n')
                    .map(line => `> ${line}`)
                    .join('\n'),
                  anchor.after,
                ]
                  .filter(Boolean)
                  .join('\n'),
              ),
            ]),
        `${labels.opinion}:\n${comment.text}`,
      ].join('\n')
    }),
  ].join('\n\n')
}

interface CommentStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}
export interface ReviewCommentSnapshot {
  readonly comments: readonly ReviewComment[]
  readonly busy: boolean
  readonly storageError: boolean
}
/** Per-session draft store. Submission clears only the batch accepted by the host. */
export class ReviewCommentStore {
  private snapshot: ReviewCommentSnapshot = { comments: [], busy: false, storageError: false }
  private readonly listeners = new Set<() => void>()
  private readonly storage: CommentStorage | undefined
  private readonly key: string
  constructor(storage?: CommentStorage, key = '') {
    this.storage = storage
    this.key = key
    try {
      const raw = storage?.getItem(key)
      if (raw) this.snapshot = { ...this.snapshot, comments: parseReviewComments(raw) }
    } catch {
      this.snapshot = { ...this.snapshot, storageError: true }
    }
  }
  getSnapshot = (): ReviewCommentSnapshot => this.snapshot
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }
  private publish(
    comments = this.snapshot.comments,
    busy = this.snapshot.busy,
    persist = false,
  ): void {
    let storageError = this.snapshot.storageError
    if (persist) {
      try {
        if (!this.storage) storageError = true
        else {
          this.storage.setItem(this.key, JSON.stringify({ version: 1, comments }))
          storageError = false
        }
      } catch {
        storageError = true
      }
    }
    this.snapshot = { comments, busy, storageError }
    for (const listener of this.listeners) listener()
  }
  save(anchor: ReviewCommentAnchor, text: string, id?: string, discussionId?: string): void {
    if (this.snapshot.busy || !text.trim() || text.length > COMMENT_TEXT_LIMIT) return
    const existing = id ? this.snapshot.comments.find(item => item.id === id) : undefined
    const comment = {
      id: existing?.id ?? globalThis.crypto.randomUUID(),
      anchor,
      text: text.trim(),
      ...((discussionId ?? existing?.discussionId)
        ? { discussionId: discussionId ?? existing?.discussionId }
        : {}),
    }
    this.publish(
      existing
        ? this.snapshot.comments.map(item => (item.id === existing.id ? comment : item))
        : [...this.snapshot.comments, comment],
      false,
      true,
    )
  }
  remove(id: string): void {
    if (!this.snapshot.busy)
      this.publish(
        this.snapshot.comments.filter(item => item.id !== id),
        false,
        true,
      )
  }
  /** Explicitly accepted draft relocation; submitted/history records keep the original anchor. */
  relocate(id: string, anchor: ReviewCommentAnchor): void {
    if (!this.snapshot.busy)
      this.publish(
        this.snapshot.comments.map(item => (item.id === id ? { ...item, anchor } : item)),
        false,
        true,
      )
  }
  acknowledge(batch: readonly ReviewComment[]): void {
    const accepted = new Map(batch.map(item => [item.id, item]))
    const remaining = this.snapshot.comments.filter(item => {
      const sent = accepted.get(item.id)
      return (
        !sent ||
        sent.text !== item.text ||
        commentAnchorKey(sent.anchor) !== commentAnchorKey(item.anchor)
      )
    })
    if (remaining.length !== this.snapshot.comments.length)
      this.publish(remaining, this.snapshot.busy, true)
  }
  async submit(send: (comments: readonly ReviewComment[]) => Promise<void>): Promise<boolean> {
    if (this.snapshot.busy || this.snapshot.comments.length === 0) return false
    const batch = this.snapshot.comments
    this.publish(batch, true)
    try {
      await send(batch)
      const ids = new Set(batch.map(item => item.id))
      this.publish(
        this.snapshot.comments.filter(item => !ids.has(item.id)),
        false,
        true,
      )
      return true
    } catch (cause) {
      this.publish(this.snapshot.comments, false)
      throw cause
    }
  }
}
