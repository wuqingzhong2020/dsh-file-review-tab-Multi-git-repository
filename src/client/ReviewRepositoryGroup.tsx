import { useId, type ReactNode } from 'react'
import { t } from './locales.ts'
import { useReviewLocale } from './use-review-locale.ts'
import css from './FileReviewTab.module.css'

export function FileContentsButton({ expanded, label, onClick, controls }: { expanded: boolean; label: string; onClick: () => void; controls?: string }) {
  return <button type="button" className={css.repositoryVisibilityButton} title={label} aria-label={label} aria-expanded={expanded} aria-controls={controls} onClick={onClick}>
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3 10h14" />
      {expanded ? <path d="m7 3 3 3 3-3M10 1v5m-3 11 3-3 3 3m-3-3v5" /> : <path d="m7 5 3-3 3 3M10 2v5m-3 8 3 3 3-3m-3-2v5" />}
    </svg>
  </button>
}

export function ReviewRepositoryGroup({ name, path, count, children, collapsed, onCollapsedChange, contentsExpanded, onContentsExpandedChange }: {
  name: string; path: string; count: number; children: ReactNode
  collapsed: boolean; onCollapsedChange: (collapsed: boolean) => void
  contentsExpanded: boolean; onContentsExpandedChange: (expanded: boolean) => void
}) {
  useReviewLocale()
  const bodyId = useId()
  const expanded = contentsExpanded && !collapsed
  return <section className={css.repositoryGroup} aria-label={name}>
    <div className={css.repositoryGroupHeader}>
    <button type="button" className={css.repositoryGroupTitle} aria-expanded={!collapsed} aria-controls={bodyId}
      title={path ? `${name}\n${path}` : name} onClick={() => { onCollapsedChange(!collapsed) }}>
      <svg viewBox="0 0 20 20" aria-hidden="true" className={`${css.chevron} ${collapsed ? '' : css.chevronOpen}`}><path d="m7 5 5 5-5 5" /></svg>
      <span className={css.repositoryGroupName}>{name}</span>
    </button>
    <FileContentsButton expanded={expanded} controls={bodyId} label={t(expanded ? 'collapseRepositoryFiles' : 'expandRepositoryFiles', { name })} onClick={() => {
      if (!expanded) onCollapsedChange(false)
      onContentsExpandedChange(!expanded)
    }} />
    <span className={css.turnCount}>{count === 1 ? t('filesOne') : t('files', { count })}</span>
    </div>
    <div id={bodyId}>{!collapsed && children}</div>
  </section>
}
