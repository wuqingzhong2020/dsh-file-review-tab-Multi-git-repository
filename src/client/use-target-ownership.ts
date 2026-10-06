import { MULTI_GIT_REPO_MANAGER_REMOTE_NAMESPACE } from 'dsh-multi-git-repo-manager/service-names'
import { useEffect, useMemo, useState } from 'react'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import type { ManagedWorkspace, TargetPathResolution } from 'dsh-multi-git-repo-manager/types'
import { resolveSessionPath, type TurnFileChanges } from './session-changes.ts'

interface TargetRemote { resolveTargetPaths(paths: string[]): Promise<RemoteResult<TargetPathResolution[]>> }
/** Epoch fenced Host ownership. No directory inference from browser labels grants access. */
export function useTargetOwnership(sessions: ISessions, sessionId: string, cwd: string | undefined, visible: boolean, workspace: ManagedWorkspace | null, turns: readonly TurnFileChanges[]) {
  const pathsKey = JSON.stringify([...new Set(turns.flatMap(turn => turn.files.map(file => file.path)))])
  const [result, setResult] = useState<{ key: string; owners: ReadonlyMap<string, TargetPathResolution> } | null>(null)
  const key = JSON.stringify([sessionId, cwd, workspace?.workspaceRevision, pathsKey])
  useEffect(() => {
    if (!visible || workspace === null) return
    let active = true
    const remote = sessions.scope(sessionId as SessionId)?.get(MULTI_GIT_REPO_MANAGER_REMOTE_NAMESPACE) as TargetRemote | undefined
    const paths = JSON.parse(pathsKey) as string[]
    if (!paths.length) { setResult({ key, owners: new Map() }); return }
    void (async () => {
      const owners = new Map<string, TargetPathResolution>()
      for (let offset = 0; offset < paths.length; offset += 512) {
        const batch = paths.slice(offset, offset + 512)
        const response = await remote?.resolveTargetPaths(batch.map(path => resolveSessionPath(cwd, path)))
        if (!response?.ok) return
        response.value.forEach((owner, index) => owners.set(batch[index]!, owner))
      }
      if (active) setResult({ key, owners })
    })().catch(() => { /* Refresh retries; an unresolved path never grants operations. */ })
    return () => { active = false }
  }, [sessions, sessionId, cwd, visible, workspace?.workspaceRevision, pathsKey, key])
  return useMemo(() => ({ owners: result?.key === key ? result.owners : new Map<string, TargetPathResolution>(), ready: workspace !== null && result?.key === key }), [result, key, workspace])
}
