import { useEffect, useRef, useState } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import type {
  NamedReviewRepository,
  ReviewProject,
  ReviewProjectPage,
  ReviewWorkspace,
  SaveReviewProject,
} from '../repository-types.ts'
import { repositoriesChanged } from './repository-events.ts'
import { pickRepositoryDirectory } from './directory-picker.ts'
import {
  absoluteReviewPath,
  normalizeReviewPath,
  relativeProjectDirectory,
  repositoryProjectPath,
} from './repository-paths.ts'
import {
  prepareProjectForSave,
  createRepositoryDraft,
  collectTemporaryRepositories,
} from './repository-settings-model.ts'
import { t } from './locales.ts'

interface ProjectRemote {
  directoryStart(path: string): Promise<RemoteResult<string>>
  project(): Promise<RemoteResult<ReviewProjectPage>>
  saveProject(request: SaveReviewProject): Promise<RemoteResult<ReviewProjectPage>>
  setTemporaryRepositories(entries: NamedReviewRepository[]): Promise<RemoteResult<ReviewWorkspace>>
}

async function unwrapProjectResult<T>(promise: Promise<RemoteResult<T>>): Promise<T> {
  const result = await promise
  if (!result.ok) throw new Error(result.error.message)
  return result.value
}

/** Own the session form, remote requests, directory picker and temporary-repository updates. */
export function useRepositorySettings(ctx: Context, sessionId: string) {
  const sessions = (ctx as Context & { sessions: ISessions }).sessions
  const projectService = (): ProjectRemote => {
    const service = sessions.scope(sessionId as SessionId)?.get('remote.fileReview') as
      | ProjectRemote
      | undefined
    if (service === undefined) throw new Error(t('remoteUnavailable'))
    return service
  }
  const [page, setPage] = useState<ReviewProjectPage | null>(null)
  const [draft, setDraft] = useState<ReviewProject | null>(null)
  const [preview, setPreview] = useState<ReviewWorkspace | null>(null)
  const [busy, setBusy] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [message, setMessage] = useState<string | { key: 'projectSaved' }>('')
  const [pendingDelete, setPendingDelete] = useState<number | null>(null)
  const [pickerError, setPickerError] = useState<{ index: number; message: string } | null>(null)
  // Reloads and session changes invalidate earlier requests before they can update the form.
  const requestVersion = useRef(0)

  const acceptPage = (result: ReviewProjectPage) => {
    setPage(result)
    setDraft(createRepositoryDraft(result.project, result.workspace, result.temporaryRepositories))
    setPreview(result.workspace)
    setDirty(false)
  }

  const load = async () => {
    const version = ++requestVersion.current
    setBusy(true)
    setMessage('')
    setPickerError(null)
    try {
      const result = await unwrapProjectResult(projectService().project())
      if (requestVersion.current !== version) return
      acceptPage(result)
    } catch (error) {
      if (requestVersion.current === version)
        setMessage(error instanceof Error ? error.message : String(error))
    } finally {
      if (requestVersion.current === version) setBusy(false)
    }
  }

  useEffect(() => {
    setPage(null)
    setDraft(null)
    setPreview(null)
    setPendingDelete(null)
    void load()
    return () => {
      requestVersion.current += 1
    }
  }, [sessionId])

  const edit = (patch: Partial<ReviewProject>) => {
    setDraft(current => (current === null ? null : { ...current, ...patch }))
    setPreview(null)
    setDirty(true)
    setMessage('')
    setPickerError(null)
  }

  useEffect(() => {
    if (!page?.configured || draft === null) return
    const entries = collectTemporaryRepositories(draft)
    const timer = setTimeout(() => {
      void unwrapProjectResult(projectService().setTemporaryRepositories(entries))
        .then(() => {
          repositoriesChanged()
        })
        .catch(error => {
          setMessage(error instanceof Error ? error.message : String(error))
        })
    }, 300)
    return () => {
      clearTimeout(timer)
    }
  }, [draft?.namedRepositories, page?.configured, sessionId])

  const chooseDirectory = async (index: number) => {
    if (draft === null) return
    const version = requestVersion.current
    setBusy(true)
    setMessage('')
    setPickerError(null)
    try {
      const defaultPath = await unwrapProjectResult(
        projectService().directoryStart(draft.namedRepositories?.[index]?.path ?? ''),
      )
      if (requestVersion.current !== version) return
      const selected = await pickRepositoryDirectory(
        ctx,
        t('projectPickerUnavailable'),
        defaultPath,
      )
      if (selected === null || requestVersion.current !== version) return
      if (!absoluteReviewPath(selected)) throw new Error(t('projectPickerInvalid'))
      const normalizedSelected = normalizeReviewPath(selected)
      const path = relativeProjectDirectory(draft.root, normalizedSelected) ?? normalizedSelected
      const next = [...(draft.namedRepositories ?? [])]
      const entry = next[index]
      if (entry === undefined) return
      next[index] = {
        name: entry.name.trim() || normalizedSelected.split('/').filter(Boolean).at(-1) || selected,
        path,
      }
      edit({ namedRepositories: next })
    } catch (error) {
      if (requestVersion.current === version)
        setPickerError({ index, message: error instanceof Error ? error.message : String(error) })
    } finally {
      if (requestVersion.current === version) setBusy(false)
    }
  }

  const save = async () => {
    if (draft === null || page === null) return
    const version = requestVersion.current
    setBusy(true)
    setMessage('')
    try {
      await unwrapProjectResult(
        projectService().saveProject({
          project: prepareProjectForSave(draft),
          revision: page.revision,
          fileRevision: page.fileRevision,
        }),
      )
      await unwrapProjectResult(
        projectService().setTemporaryRepositories(collectTemporaryRepositories(draft)),
      )
      const result = await unwrapProjectResult(projectService().project())
      if (requestVersion.current !== version) return
      acceptPage(result)
      repositoriesChanged()
      setMessage({ key: 'projectSaved' })
    } catch (error) {
      if (requestVersion.current === version)
        setMessage(error instanceof Error ? error.message : String(error))
    } finally {
      if (requestVersion.current === version) setBusy(false)
    }
  }

  const updateRepository = (index: number, patch: Partial<NamedReviewRepository>) => {
    if (draft === null) return
    const entries = [...(draft.namedRepositories ?? [])]
    const entry = entries[index]
    if (entry === undefined) return
    entries[index] = { ...entry, ...patch }
    edit({ namedRepositories: entries })
  }

  const normalizeRepositoryPath = (index: number) => {
    const entry = draft?.namedRepositories?.[index]
    if (draft === null || entry === undefined) return
    const path = repositoryProjectPath(draft.root, entry.path)
    if (path !== entry.path) updateRepository(index, { path })
  }

  const addRepository = () => {
    if (draft === null) return
    edit({ namedRepositories: [...(draft.namedRepositories ?? []), { name: '', path: '' }] })
  }

  const confirmRepositoryRemoval = () => {
    if (draft === null || pendingDelete === null) return
    edit({
      namedRepositories: (draft.namedRepositories ?? []).filter(
        (_, index) => index !== pendingDelete,
      ),
    })
    setPendingDelete(null)
  }

  return {
    page,
    draft,
    preview,
    busy,
    dirty,
    message,
    pendingDelete,
    pickerError,
    load,
    save,
    edit,
    chooseDirectory,
    updateRepository,
    normalizeRepositoryPath,
    addRepository,
    requestRepositoryRemoval: setPendingDelete,
    cancelRepositoryRemoval: () => {
      setPendingDelete(null)
    },
    confirmRepositoryRemoval,
  }
}
