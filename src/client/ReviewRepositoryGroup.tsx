import { useId, useState, type ReactNode } from 'react'
import { t } from './locales.ts'
import css from './FileReviewTab.module.css'

export function ReviewRepositoryGroup({ name, path, count, children }: { name: string; path: string; count: number; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const bodyId = useId()
  return <section className={css.repositoryGroup} aria-label={name}>
    <button type="button" className={css.repositoryGroupHeader} aria-expanded={!collapsed} aria-controls={bodyId}
      title={path ? `${name}\n${path}` : name} onClick={() => { setCollapsed(current => !current) }}>
      <svg viewBox="0 0 20 20" aria-hidden="true" className={`${css.chevron} ${collapsed ? '' : css.chevronOpen}`}><path d="m7 5 5 5-5 5" /></svg>
      <span className={css.repositoryGroupName}>{name}</span>
      <span className={css.turnCount}>{count === 1 ? t('filesOne') : t('files', { count })}</span>
    </button>
    <div id={bodyId}>{!collapsed && children}</div>
  </section>
}
