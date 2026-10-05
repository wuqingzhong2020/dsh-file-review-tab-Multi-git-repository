/** Versioned, bounded facts carried by the official durable tool log. */
import { z } from 'zod'

export const LIFECYCLE_KEY = 'dshFileReviewMultiRepository'
export const MARKER_MAX_BYTES = 256 * 1024
export const CAPTURE_MAX_BYTES = 1024 * 1024
export const SESSION_MAX_RECORDS = 4000
export const SESSION_MAX_BYTES = 16 * 1024 * 1024
export const lifecycleImageSchema = z.object({
  text: z.string().max(CAPTURE_MAX_BYTES),
  mode: z.number().int().min(0).max(0o777),
  dev: z.number(),
  ino: z.number(),
}).strict()
export const lifecycleRecordSchema = z.object({
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
  reason: z.string().max(1024).optional(),
}).strict()
export type LifecycleImage = z.infer<typeof lifecycleImageSchema>
export type LifecycleRecord = z.infer<typeof lifecycleRecordSchema>

export function lifecycleRecordBytes(record: LifecycleRecord): number {
  return new TextEncoder().encode(JSON.stringify(record)).length
}

export function incompleteLifecycle(record: LifecycleRecord, reason: string): LifecycleRecord {
  return { ...record, before: null, after: null, complete: false, reason }
}

export function boundedLifecycle(record: LifecycleRecord): LifecycleRecord {
  return lifecycleRecordBytes(record) <= MARKER_MAX_BYTES
    ? record
    : incompleteLifecycle(record, 'lifecycle record exceeds the persistence budget')
}

export function lifecycleFromContent(content: readonly unknown[]): LifecycleRecord[] {
  const records: LifecycleRecord[] = []
  for (const block of content) {
    if (!block || typeof block !== 'object' || !('type' in block) || block.type !== 'text'
      || !('text' in block) || block.text !== '' || !(LIFECYCLE_KEY in block)) continue
    const parsed = lifecycleRecordSchema.safeParse(block[LIFECYCLE_KEY])
    if (parsed.success && lifecycleRecordBytes(parsed.data) <= MARKER_MAX_BYTES) {
      records.push(parsed.data)
    }
  }
  return records
}

export function lifecycleBlock(record: LifecycleRecord) {
  return { type: 'text' as const, text: '', [LIFECYCLE_KEY]: record }
}
