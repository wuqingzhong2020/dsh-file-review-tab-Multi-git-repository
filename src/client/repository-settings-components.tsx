import { Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import type {
  NamedReviewRepository,
  ReviewRepository,
  ReviewWorkspace,
} from '../repository-types.ts'
import { absoluteReviewPath, repositoryProjectPath } from './repository-paths.ts'
import { t } from './locales.ts'
import { localizeReviewMessage } from './message-locales.ts'
import css from './RepositorySettings.module.css'

interface RepositoryListEditorProps {
  projectRoot: string
  entries: NamedReviewRepository[]
  pickerError: { index: number; message: string } | null
  onUpdate(index: number, patch: Partial<NamedReviewRepository>): void
  onNormalizePath(index: number): void
  onChooseDirectory(index: number): Promise<void>
  onRemove(index: number): void
}

export function RepositoryListEditor({
  projectRoot,
  entries,
  pickerError,
  onUpdate,
  onNormalizePath,
  onChooseDirectory,
  onRemove,
}: RepositoryListEditorProps) {
  return (
    <div className={css.repoEditor}>
      <div className={css.repoHeader}>
        <span>{t('repository')}</span>
        <span>{t('projectPath')}</span>
      </div>
      {entries.map((entry, index) => {
        const isTemporary = absoluteReviewPath(repositoryProjectPath(projectRoot, entry.path))
        return (
          <div className={css.repoRow} key={index}>
            <input
              aria-label={`${t('repository')} ${index + 1}`}
              value={entry.name}
              onChange={event => {
                onUpdate(index, { name: event.target.value })
              }}
            />
            <div className={`${css.pathCell} ${isTemporary ? css.temporaryPath : ''}`}>
              <input
                aria-label={`${t('projectPath')} ${index + 1}`}
                value={entry.path}
                placeholder="project/PluginManager"
                onChange={event => {
                  onUpdate(index, { path: event.target.value })
                }}
                onBlur={() => {
                  onNormalizePath(index)
                }}
              />
              {isTemporary && (
                <span
                  className={css.temporaryBadge}
                  title={t('projectTemporaryHint')}
                  aria-label={t('projectTemporary')}
                >
                  {t('projectTemporaryShort')}
                </span>
              )}
            </div>
            <div className={css.repoActions}>
              <button
                type="button"
                onClick={() => {
                  void onChooseDirectory(index)
                }}
              >
                {t('projectOpenRepo')}
              </button>
              <button
                type="button"
                aria-label={`${t('projectRemoveRepo')} ${entry.name || index + 1}`}
                onClick={() => {
                  onRemove(index)
                }}
              >
                {t('projectRemoveRepo')}
              </button>
            </div>
            {pickerError?.index === index && (
              <p className={css.pickerError} role="alert">
                {localizeReviewMessage(pickerError.message)}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

function repositorySourceLabel(source: string): string {
  switch (source) {
    case 'project':
      return t('projectRootSource')
    case 'manual':
      return t('projectManual')
    case 'temporary':
      return t('projectTemporary')
    default:
      return source
  }
}

function repositoryStateLabel(state: ReviewRepository['state']): string {
  switch (state) {
    case 'ready':
      return t('repoReady')
    case 'missing':
      return t('repoMissing')
    case 'notGit':
      return t('repoNotGit')
    default:
      return t('stateError')
  }
}

export function RepositoryPreview({ workspace }: { workspace: ReviewWorkspace }) {
  const readyCount = workspace.repositories.filter(repo => repo.state === 'ready').length
  return (
    <div className={css.preview}>
      <h3>{t('projectResolved', { count: readyCount, total: workspace.repositories.length })}</h3>
      {workspace.warnings.map(warning => (
        <p className={css.message} key={warning}>
          {localizeReviewMessage(warning)}
        </p>
      ))}
      <table>
        <thead>
          <tr>
            <th>{t('repository')}</th>
            <th>{t('projectPath')}</th>
            <th>{t('projectState')}</th>
          </tr>
        </thead>
        <tbody>
          {workspace.repositories.map(repo => (
            <tr key={repo.path}>
              <td>
                {repo.name}
                <small>{repositorySourceLabel(repo.source)}</small>
              </td>
              <td>{repo.relativePath}</td>
              <td title={repo.reason ? localizeReviewMessage(repo.reason) : undefined}>
                {repositoryStateLabel(repo.state)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function RepositoryDeleteDialog({
  name,
  onCancel,
  onConfirm,
}: {
  name: string
  onCancel(): void
  onConfirm(): void
}) {
  return (
    <Modal
      open
      onClose={onCancel}
      title={t('projectDeleteTitle')}
      className={css.dialog ?? ''}
      headless
    >
      <h3 id="file-review-delete-title">{t('projectDeleteTitle')}</h3>
      <p>{t('projectDeleteDescription', { name })}</p>
      <div className={css.dialogActions}>
        <button type="button" data-modal-autofocus onClick={onCancel}>
          {t('projectCancel')}
        </button>
        <button type="button" onClick={onConfirm}>
          {t('projectRemoveRepo')}
        </button>
      </div>
    </Modal>
  )
}
