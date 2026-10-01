import { useEffect, useRef, useState } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import type { NamedReviewRepository, ReviewProject, ReviewProjectPage, ReviewWorkspace, SaveReviewProject } from '../repository-types.ts'
import { repositoriesChanged } from './repository-events.ts'
import { absoluteReviewPath, normalizeReviewPath, relativeProjectDirectory } from './repository-paths.ts'
import { t } from './locales.ts'
import css from './RepositorySettings.module.css'

interface ProjectRemote {
  project(): Promise<RemoteResult<ReviewProjectPage>>
  saveProject(request: SaveReviewProject): Promise<RemoteResult<ReviewProjectPage>>
  setTemporaryRepositories(entries: NamedReviewRepository[]): Promise<RemoteResult<ReviewWorkspace>>
}

interface DirectoryPickerRemote { pick(): Promise<RemoteResult<string | null>> }

async function unwrap<T>(promise: Promise<RemoteResult<T>>): Promise<T> {
  const result = await promise
  if (!result.ok) throw new Error(result.error.message)
  return result.value
}

function clean(project: ReviewProject): ReviewProject {
  return {
    ...project,
    name: project.name.trim(),
    enabled: project.enabled ?? true,
    configFiles: [],
    repositories: [],
    namedRepositories: (project.namedRepositories ?? [])
      .filter(entry => entry.name.trim() !== '' && entry.path.trim() !== '')
      .map(entry => ({ name: entry.name.trim(), path: normalizeReviewPath(entry.path.trim()) })),
  }
}

function editable(project: ReviewProject, workspace: ReviewWorkspace): ReviewProject {
  return {
    ...project,
    enabled: project.enabled ?? true,
    configFiles: [], repositories: [],
    namedRepositories: workspace.repositories
      .filter(repo => repo.source !== 'project')
      .map(repo => ({ name: repo.name, path: repo.relativePath })),
  }
}

function temporaryEntries(project: ReviewProject): NamedReviewRepository[] {
  return (project.namedRepositories ?? [])
    .filter(entry => entry.name.trim() && absoluteReviewPath(entry.path) && relativeProjectDirectory(project.root, entry.path) === null)
    .map(entry => ({ name: entry.name.trim(), path: normalizeReviewPath(entry.path.trim()) }))
}

/** A session-owned editor for the repositories of this conversation's project. */
export function RepositorySettings({ ctx, sessionId }: { ctx: Context; sessionId: string }) {
  const sessions = (ctx as Context & { sessions: ISessions }).sessions
  const remote = (): ProjectRemote => {
    const service = sessions.scope(sessionId as SessionId)?.get('remote.fileReview') as ProjectRemote | undefined
    if (service === undefined) throw new Error(t('remoteUnavailable'))
    return service
  }
  const [page, setPage] = useState<ReviewProjectPage | null>(null)
  const [draft, setDraft] = useState<ReviewProject | null>(null)
  const [preview, setPreview] = useState<ReviewWorkspace | null>(null)
  const [busy, setBusy] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [message, setMessage] = useState('')
  const [pendingDelete, setPendingDelete] = useState<number | null>(null)
  const requestVersion = useRef(0)

  const load = async () => {
    const version = ++requestVersion.current
    setBusy(true)
    setMessage('')
    try {
      const result = await unwrap(remote().project())
      if (requestVersion.current !== version) return
      setPage(result)
      setDraft(editable(result.project, result.workspace))
      setPreview(result.workspace)
      setDirty(false)
    } catch (error) { if (requestVersion.current === version) setMessage(error instanceof Error ? error.message : String(error)) }
    finally { if (requestVersion.current === version) setBusy(false) }
  }

  useEffect(() => {
    setPage(null)
    setDraft(null)
    setPreview(null)
    setPendingDelete(null)
    void load()
    return () => { requestVersion.current += 1 }
  }, [sessionId])

  const edit = (patch: Partial<ReviewProject>) => {
    setDraft(current => current === null ? null : { ...current, ...patch })
    setPreview(null)
    setDirty(true)
    setMessage('')
  }

  useEffect(() => {
    if (!page?.configured || draft === null) return
    const entries = temporaryEntries(draft)
    const timer = setTimeout(() => {
      void unwrap(remote().setTemporaryRepositories(entries))
        .then(() => { repositoriesChanged() })
        .catch(error => { setMessage(error instanceof Error ? error.message : String(error)) })
    }, 300)
    return () => { clearTimeout(timer) }
  }, [draft?.namedRepositories, page?.configured, sessionId])

  const chooseDirectory = async (index: number) => {
    if (draft === null) return
    const desktop = (globalThis as unknown as { __DSH_DIRECTORY_PICKER__?: { pick(): Promise<string | null> } }).__DSH_DIRECTORY_PICKER__
    const picker = (ctx.remote as unknown as { directoryPicker?: DirectoryPickerRemote }).directoryPicker
    const uiWorkspace = (ctx as unknown as { uiWorkspace?: { pickDirectory(): Promise<string | null> } }).uiWorkspace
    if (desktop?.pick === undefined && picker?.pick === undefined && uiWorkspace?.pickDirectory === undefined) {
      setMessage(t('projectPickerUnavailable'))
      return
    }
    const version = requestVersion.current
    setBusy(true)
    setMessage('')
    try {
      const selected = desktop?.pick !== undefined
        ? await desktop.pick()
        : picker?.pick !== undefined
          ? await unwrap(picker.pick())
          : await uiWorkspace!.pickDirectory()
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
    } catch (error) { if (requestVersion.current === version) setMessage(error instanceof Error ? error.message : String(error)) }
    finally { if (requestVersion.current === version) setBusy(false) }
  }

  const save = async () => {
    if (draft === null || page === null) return
    const version = requestVersion.current
    setBusy(true)
    setMessage('')
    try {
      await unwrap(remote().saveProject({
        project: clean(draft), revision: page.revision, fileRevision: page.fileRevision,
      }))
      await unwrap(remote().setTemporaryRepositories(temporaryEntries(draft)))
      const result = await unwrap(remote().project())
      if (requestVersion.current !== version) return
      setPage(result)
      setDraft(editable(result.project, result.workspace))
      setPreview(result.workspace)
      setDirty(false)
      repositoriesChanged()
      setMessage(t('projectSaved'))
    } catch (error) { if (requestVersion.current === version) setMessage(error instanceof Error ? error.message : String(error)) }
    finally { if (requestVersion.current === version) setBusy(false) }
  }

  return <div className={css.scroll}><div className={css.root}>
    <header className={css.pageHeader}>
      <div><h2>{t('projectTab')}</h2><p className={css.hint}>{t('projectIntro')}</p></div>
      <div className={css.actions}>
        <button type="button" disabled={busy} onClick={() => { void load() }}>{t('projectReload')}</button>
        <button type="button" className={css.primary} disabled={busy || draft === null || (!dirty && page?.configured)} onClick={() => { void save() }}>
          {busy ? t('projectWorking') : t('projectSave')}
        </button>
      </div>
    </header>
    {message && <p className={css.message} role="status">{message}</p>}
    {draft !== null && <fieldset disabled={busy} className={css.form}>
      <label className={css.field}>{t('projectCurrentRoot')}<input value={draft.root} readOnly /></label>
      <label className={css.field}>{t('projectName')}<input value={draft.name} readOnly /></label>
      <label className={css.field}>{t('projectConfigFile')}<input value="dsh-file-review-repositories.json" readOnly /></label>
      {!page?.configured && <p className={css.hint}>{t('projectInactive')}</p>}
      <label className={css.check}><input type="checkbox" checked={draft.enabled ?? true} onChange={event => { edit({ enabled: event.target.checked }) }} />{t('projectEnable')}</label>
      {draft.enabled === false && <p className={css.hint}>{t('projectDisabledHint')}</p>}
      <label className={css.check}><input type="checkbox" checked={draft.includeProjectRoot} onChange={event => { edit({ includeProjectRoot: event.target.checked }) }} />{t('projectIncludeRoot')}</label>
      <h3>{t('projectRepos')}</h3>
      <p className={css.hint}>{t('projectReposHint')}</p>
      {page?.fileRevision === '' && page.project.configFiles.length > 0 && <p className={css.hint}>{t('projectImportHint')}</p>}
      <div className={css.repoEditor}>
        <div className={css.repoHeader}><span>{t('repository')}</span><span>{t('projectPath')}</span></div>
        {(draft.namedRepositories ?? []).map((entry, index) => <div className={css.repoRow} key={index}>
          <input aria-label={`${t('repository')} ${index + 1}`} value={entry.name} onChange={event => {
            const next = [...(draft.namedRepositories ?? [])]; next[index] = { ...entry, name: event.target.value }; edit({ namedRepositories: next })
          }} />
          <div className={css.pathCell}>
            <input aria-label={`${t('projectPath')} ${index + 1}`} value={entry.path} placeholder="project/PluginManager" onChange={event => {
              const next = [...(draft.namedRepositories ?? [])]; next[index] = { ...entry, path: event.target.value }; edit({ namedRepositories: next })
            }} />
            {absoluteReviewPath(entry.path) && relativeProjectDirectory(draft.root, entry.path) === null && <small title={t('projectTemporaryHint')}>{t('projectTemporary')}</small>}
          </div>
          <div className={css.repoActions}>
            <button type="button" onClick={() => { void chooseDirectory(index) }}>{t('projectOpenRepo')}</button>
            <button type="button" aria-label={`${t('projectRemoveRepo')} ${entry.name || index + 1}`} onClick={() => { setPendingDelete(index) }}>{t('projectRemoveRepo')}</button>
          </div>
        </div>)}
      </div>
      <button type="button" onClick={() => { edit({ namedRepositories: [...(draft.namedRepositories ?? []), { name: '', path: '' }] }) }}>{t('projectAddRepo')}</button>
    </fieldset>}
    {preview !== null && <div className={css.preview}>
      <h3>{t('projectResolved', { count: preview.repositories.filter(repo => repo.state === 'ready').length, total: preview.repositories.length })}</h3>
      {preview.warnings.map(warning => <p className={css.message} key={warning}>{warning}</p>)}
      <table><thead><tr><th>{t('repository')}</th><th>{t('projectPath')}</th><th>{t('projectState')}</th></tr></thead>
        <tbody>{preview.repositories.map(repo => <tr key={repo.path}>
          <td>{repo.name}<small>{repo.source === 'project' ? t('projectRootSource') : repo.source === 'manual' ? t('projectManual') : repo.source === 'temporary' ? t('projectTemporary') : repo.source}</small></td>
          <td>{repo.relativePath}</td><td title={repo.reason}>{t(repo.state === 'ready' ? 'repoReady' : repo.state === 'missing' ? 'repoMissing' : repo.state === 'notGit' ? 'repoNotGit' : 'stateError')}</td>
        </tr>)}</tbody>
      </table>
    </div>}
    {pendingDelete !== null && draft !== null && <div className={css.dialogBackdrop}>
      <div className={css.dialog} role="dialog" aria-modal="true" aria-labelledby="file-review-delete-title">
        <h3 id="file-review-delete-title">{t('projectDeleteTitle')}</h3>
        <p>{t('projectDeleteDescription', { name: draft.namedRepositories?.[pendingDelete]?.name || String(pendingDelete + 1) })}</p>
        <div className={css.dialogActions}>
          <button type="button" autoFocus onClick={() => { setPendingDelete(null) }}>{t('projectCancel')}</button>
          <button type="button" onClick={() => {
            edit({ namedRepositories: (draft.namedRepositories ?? []).filter((_, index) => index !== pendingDelete) })
            setPendingDelete(null)
          }}>{t('projectRemoveRepo')}</button>
        </div>
      </div>
    </div>}
  </div></div>
}
