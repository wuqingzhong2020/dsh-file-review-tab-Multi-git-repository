/** Observe official execution/acceptance/log seams without changing tool outcomes. */
import { randomUUID } from 'node:crypto'
import type { Context } from '@deepseek-ai/cordis'
import type { ToolExecution, ToolExecutionToken } from '@deepseek-ai/dsh-tools'
import type { FileReviewService } from './file-review-service.ts'
import { captureImage, lifecyclePath, sameLifecycleImage } from './file-lifecycle.ts'
import {
  boundedLifecycle,
  lifecycleBlock,
  lifecycleFromContent,
  LIFECYCLE_KEY,
  type LifecycleImage,
  type LifecycleRecord,
} from './lifecycle-record.ts'

const CAPTURE_PATH_LIMIT = 32
interface BeforeCapture {
  path: string
  filename: string
  before: LifecycleImage | null
  complete: boolean
  reason?: string
}

/** Tool-authored metadata can never become an authority for whole-file writes. */
function cleanContent<T>(content: readonly T[]): T[] {
  return content.map(block => {
    if (!block || typeof block !== 'object' || !(LIFECYCLE_KEY in block)) return block
    const copy = { ...block }
    delete copy[LIFECYCLE_KEY]
    return copy as T
  })
}

function capturePaths(ctx: Context, exec: ToolExecution): string[] {
  try {
    const view = ctx.tools.get(exec.name, exec.agent)?.presentCall?.(exec.arguments)
    if (view?.card === 'diff') {
      return [...new Set([
        ...view.diffs.map(diff => diff.path),
        ...(view.locations ?? []).map(location => location.path),
      ])]
    }
    if (view?.card === 'generic' && view.kind === 'edit') {
      return [...new Set((view.locations ?? []).map(location => location.path))]
    }
  } catch {
    // Unknown presentation stays on the legacy review path.
  }
  return []
}

async function captureBefore(
  cwd: string,
  path: string,
  roots: readonly string[],
): Promise<BeforeCapture | null> {
  let filename: string
  try {
    filename = await lifecyclePath(cwd, path, roots)
  } catch {
    return null // Unauthorized paths must not produce records.
  }
  try {
    return { path, filename, before: await captureImage(filename), complete: true }
  } catch (error) {
    return { path, filename, before: null, complete: false, reason: String(error) }
  }
}

async function finishCapture(
  exec: ToolExecution,
  sessionId: string,
  capture: BeforeCapture,
): Promise<LifecycleRecord | null> {
  let after: LifecycleImage | null = null
  let { complete, reason } = capture
  try {
    after = await captureImage(capture.filename)
  } catch (error) {
    complete = false
    reason = String(error)
  }
  if (complete && sameLifecycleImage(capture.before, after)) return null
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
    ...(reason ? { reason } : {}),
  })
}

export function registerLifecycleCapture(ctx: Context, service: FileReviewService): void {
  const pending = new Map<ToolExecutionToken, LifecycleRecord[]>()

  ctx.on('tools/execute', async (exec, next) => {
    const agent = exec.agent
    const cwd = agent?.session.header.cwd
    if (!agent || !cwd) return next()
    const paths = capturePaths(ctx, exec)
    if (!paths.length || paths.length > CAPTURE_PATH_LIMIT) return next()
    let captures: (BeforeCapture | null)[]
    try {
      const owners = await service.resolvePaths(agent, paths)
      captures = await Promise.all(paths.map((path, index) => {
        const owner = owners[index]
        return owner?.state === 'managed' && owner.target ? captureBefore(cwd, path, [owner.target.path]) : null
      }))
    } catch { return next() }
    const result = await next()
    if (result.isError) return result
    const records: LifecycleRecord[] = []
    for (const capture of captures) {
      if (!capture) continue
      try {
        if (!(await service.approvedRoots(agent, capture.path)).length) continue
        const record = await finishCapture(exec, String(agent.session.header.id), capture)
        if (record) records.push(record)
      } catch {
        // Invalid snapshots cannot authorize a write or change the tool outcome.
      }
    }
    if (records.length) pending.set(exec.token, records)
    return result
  })

  ctx.on('tools/post-execute', async (exec, result, next) => {
    const decision = await next()
    const records = pending.get(exec.token)
    if (result.isError || decision.kind !== 'accept' || 'value' in decision) return decision
    const content = decision.content ?? result.content
    const hasMarker = content.some(block =>
      block && typeof block === 'object' && LIFECYCLE_KEY in block,
    )
    if (!records && !hasMarker) return decision
    return {
      ...decision,
      content: [...cleanContent(content), ...(records ?? []).map(lifecycleBlock)] as typeof result.content,
    }
  })

  ctx.on('tools/result', (exec, result) => {
    const captured = pending.get(exec.token)
    pending.delete(exec.token)
    if (result.isError || !exec.agent || !captured) return
    const ids = new Set(captured.map(record => record.recordId))
    try {
      for (const record of lifecycleFromContent(result.content)) {
        if (ids.has(record.recordId)) service.recordLifecycle(exec.agent, record)
      }
    } catch {
      // Observers must not alter committed outcomes.
    }
  })

  ctx.on('tools/ptc-dispatch-log', async (dispatch, next) => {
    const content = cleanContent(await next())
    if (dispatch.isError || !dispatch.agent) return content
    const records = service.lifecycleRecords(dispatch.agent).filter(record =>
      record.rootCallId === String(dispatch.exec.rootCallId)
      && record.subCallId === String(dispatch.subCallId),
    )
    return [...content, ...records.map(lifecycleBlock)] as typeof dispatch.content
  })
  ctx.effect(() => () => pending.clear())
}
