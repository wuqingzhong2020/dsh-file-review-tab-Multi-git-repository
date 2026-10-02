import { useCallback, useMemo, useState, type CSSProperties } from 'react'
import type { ProducedFileDiff as DiffHunk } from '../change-types.ts'
import {
  buildUnifiedHunks, expandAllContextGap, expandContextGap, unifiedDiffText,
  splitDiffRows, unifiedHunkRange, unifiedVisibleBlocks, visibleHunkRows,
  type ContextExpansion, type UnifiedGap, type UnifiedLine,
} from './unified-diff-model.ts'
import css from './UnifiedDiff.module.css'
import { ReviewCommentLine, ReviewOutdatedComments } from './ReviewComments.tsx'
import { lineCommentAnchor, reviewDiffRevision, type ReviewCommentTarget } from './review-comments.ts'
import { useDiffViewPreferences } from './DiffViewControls.tsx'
import { t } from './locales.ts'
import { useReviewLocale } from './use-review-locale.ts'

export { summarizeDiffs, unifiedDiffText } from './unified-diff-model.ts'
export type { UnifiedDiffStats } from './unified-diff-model.ts'

export interface UnifiedDiffLabels {
  readonly copy: string
  readonly copied: string
  readonly expandContext: (count: number, remaining: number) => string
  readonly collapseContext: string
  readonly unavailableContext: (count: number) => string
}
interface UnifiedDiffProps {
  readonly diffs: readonly DiffHunk[]
  readonly contextLines: number
  readonly labels: UnifiedDiffLabels
  readonly className?: string | undefined
  readonly showCopyButton?: boolean | undefined
  readonly showFileHeaders?: boolean | undefined
  readonly reviewTarget?: ReviewCommentTarget | undefined
}

function ExpandIcon({ direction }: { direction: UnifiedGap['position'] }) {
  return <svg viewBox="0 0 16 16" aria-hidden="true">
    {direction !== 'trailing' && <path d="m4 5 4-3 4 3M8 2v4" />}
    {direction !== 'leading' && <path d="m4 11 4 3 4-3M8 14v-4" />}
    <path d="M2 8h1m3 0h1m3 0h1m3 0h1" />
  </svg>
}

function ExpandAllIcon({ direction }: { direction: 'up' | 'down' }) {
  return <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d={direction === 'up' ? 'm4 8 4-4 4 4m-8 4 4-4 4 4M3 2h10' : 'm4 4 4 4 4-4m-8 4 4 4 4-4M3 14h10'} />
  </svg>
}

function CollapseContextIcon() {
  return <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="m4 2 4 4 4-4M8 2v4m-4 8 4-4 4 4M8 14v-4M2 8h12" />
  </svg>
}

/** Two presentations share the original rows, context expansion, and anchors. */
export function UnifiedDiff({ diffs, contextLines, labels, className, showCopyButton = true, showFileHeaders = true, reviewTarget }: UnifiedDiffProps) {
  useReviewLocale()
  const preferences = useDiffViewPreferences()
  const isSplit = preferences.layout === 'split'
  const hunks = useMemo(() => buildUnifiedHunks(diffs, contextLines), [contextLines, diffs])
  const revision = useMemo(() => reviewDiffRevision(diffs), [diffs])
  const [progress, setProgress] = useState<{ revision: string; gaps: ReadonlyMap<string, ContextExpansion> }>(() => ({ revision, gaps: new Map() }))
  const expansions = progress.revision === revision ? progress.gaps : new Map<string, ContextExpansion>()
  const [copied, setCopied] = useState(false)
  const expand = (gap: UnifiedGap, direction?: 'up' | 'down') => {
    setProgress(current => {
      const gaps = new Map(current.revision === revision ? current.gaps : [])
      // The control holds remaining lines; its id addresses the full gap.
      const original = hunks.flatMap(hunk => hunk.rows).find((row): row is UnifiedGap => row.kind === 'gap' && row.id === gap.id)
      if (original) gaps.set(gap.id, direction
        ? expandAllContextGap(original, direction, gaps.get(gap.id))
        : expandContextGap(original, gaps.get(gap.id), preferences.contextExpansionLines))
      return { revision, gaps }
    })
  }
  const collapseGap = (gap: UnifiedGap) => {
    setProgress(current => {
      const gaps = new Map(current.revision === revision ? current.gaps : [])
      gaps.delete(gap.id)
      return { revision, gaps }
    })
  }
  const onCopy = useCallback(() => {
    if (copied) return
    void navigator.clipboard?.writeText(unifiedDiffText(diffs)).then(() => {
      setCopied(true)
      window.setTimeout(() => { setCopied(false) }, 1000)
    }).catch(() => {})
  }, [copied, diffs])
  if (!diffs.length) return null

  const maxNumber = hunks.reduce((max, hunk) => hunk.lines.reduce((current, line) => Math.max(current, line.oldNumber ?? 0, line.newNumber ?? 0), max), 1)
  const style = { '--diff-number-width': `${Math.max(4, String(maxNumber).length)}ch` } as CSSProperties
  const totals = new Map<string, { added: number; removed: number }>()
  diffs.forEach((diff, index) => {
    const total = totals.get(diff.path) ?? { added: 0, removed: 0 }
    totals.set(diff.path, { added: total.added + (hunks[index]?.added ?? 0), removed: total.removed + (hunks[index]?.removed ?? 0) })
  })
  const renderLine = (row: UnifiedLine, key: string, lines: readonly UnifiedLine[]) => <ReviewCommentLine key={key} anchor={reviewTarget ? lineCommentAnchor(reviewTarget, row, lines, revision) : undefined}
    alternateAnchor={reviewTarget && row.kind === 'context' ? lineCommentAnchor(reviewTarget, row, lines, revision, 'old') : undefined}>
    {button => <div className={`${css.unifiedLine} ${css[`unified_${row.kind}`] ?? ''}`} data-line-kind={row.kind} data-old-line={row.oldNumber ?? undefined} data-new-line={row.newNumber ?? undefined}>
      <span className={`${css.unifiedLineNumber} ${css.unifiedOldNumber}`}>{button}{row.oldNumber}</span>
      <span className={css.unifiedLineNumber}>{row.newNumber}</span>
      <span className={css.unifiedSign}>{row.kind === 'del' ? '-' : row.kind === 'add' ? '+' : ' '}</span>
      <span className={css.unifiedText}>{row.text}</span>
    </div>}
  </ReviewCommentLine>
  const renderSplitCell = (row: UnifiedLine | null, side: 'old' | 'new', key: number, lines: readonly UnifiedLine[]) => <div key={key}
    className={`${css.splitCell} ${row ? css[`unified_${row.kind}`] ?? '' : css.splitMissing}`}>
    {row && <ReviewCommentLine anchor={reviewTarget ? lineCommentAnchor(reviewTarget, row, lines, revision, side) : undefined}>
      {button => <div className={`${css.splitLine} ${css[`unified_${row.kind}`] ?? ''}`} data-line-kind={row.kind} data-diff-side={side}
        data-old-line={side === 'old' ? row.oldNumber ?? undefined : undefined} data-new-line={side === 'new' ? row.newNumber ?? undefined : undefined}>
        <span className={`${css.unifiedLineNumber} ${css.unifiedOldNumber}`}>{button}{side === 'old' ? row.oldNumber : row.newNumber}</span>
        <span className={css.unifiedSign}>{row.kind === 'del' ? '-' : row.kind === 'add' ? '+' : ' '}</span>
        <span className={css.unifiedText}>{row.text}</span>
      </div>}
    </ReviewCommentLine>}
  </div>
  let previousPath: string | undefined
  return <div className={`${css.unifiedBlock} ${showFileHeaders ? '' : css.unifiedEmbedded} ${reviewTarget ? css.commentEnabled : ''} ${preferences.wrap ? css.wrapLines : ''} ${className ?? ''}`} style={style} data-diff="" data-diff-layout={preferences.layout} data-diff-wrap={preferences.wrap}>
    {(showCopyButton || expansions.size > 0) && <div className={css.unifiedToolbar}>
      {expansions.size > 0 && <button type="button" onClick={() => { setProgress({ revision, gaps: new Map() }) }}>{labels.collapseContext}</button>}
      {showCopyButton && <button type="button" className={css.unifiedCopyButton} onClick={onCopy}>{copied ? labels.copied : labels.copy}</button>}
    </div>}
    {diffs.map((diff, hunkIndex) => {
      const firstForPath = diff.path !== previousPath
      previousPath = diff.path
      const hunk = hunks[hunkIndex]!
      const total = totals.get(diff.path)!
      const blocks = unifiedVisibleBlocks(visibleHunkRows(hunk, expansions, true))
      return <section key={`${diff.path}:${hunkIndex}`} className={css.unifiedFile}>
        {showFileHeaders && firstForPath && <header className={css.unifiedHeader}>
          <span className={css.unifiedStatus}>M</span><span className={css.unifiedPath}>{diff.path}</span>
          <span className={css.unifiedAdded}>+{total.added}</span><span className={css.unifiedRemoved}>-{total.removed}</span>
        </header>}
        {hunk.unchangedBefore > 0 && <div className={css.unifiedUnavailable} title={labels.unavailableContext(hunk.unchangedBefore)}>{labels.unavailableContext(hunk.unchangedBefore)}</div>}
        {isSplit && <div className={css.splitLegend}><span>{t('diffOld')}</span><span>{t('diffNew')}</span></div>}
        <div className={`${css.unifiedBody} ${isSplit ? css.splitBody : ''}`}>
          {blocks.map((block, blockIndex) => {
            const splitRows = isSplit ? splitDiffRows(block.lines) : []
            const expansion = block.gap ? expansions.get(block.gap.id) : undefined
            const expandedLines = (expansion?.before ?? 0) + (expansion?.after ?? 0)
            return <div key={block.gap?.id ?? `block:${blockIndex}`}>
            <div className={css.unifiedHunkHeader}>
              {block.gap ? <div className={css.unifiedGapControls}>
                {expandedLines > 0 && <button type="button" className={css.unifiedGapButton}
                  aria-label={t('collapseContextGap', { count: expandedLines })} title={t('collapseContextGap', { count: expandedLines })}
                  data-context-collapse={block.gap.id} onClick={() => { if (block.gap) collapseGap(block.gap) }}><CollapseContextIcon /></button>}
                {block.gap.lines.length > 0 && block.gap.position !== 'trailing' && <button type="button" className={css.unifiedGapButton}
                  aria-label={t('expandAllContextUp', { count: block.gap.lines.length })} title={t('expandAllContextUp', { count: block.gap.lines.length })}
                  data-context-expand-all="up" onClick={() => { if (block.gap) expand(block.gap, 'up') }}><ExpandAllIcon direction="up" /></button>}
                {block.gap.lines.length > 0 && <button type="button" className={css.unifiedGapButton}
                aria-label={labels.expandContext(Math.min(preferences.contextExpansionLines, block.gap.lines.length), block.gap.lines.length)}
                title={labels.expandContext(Math.min(preferences.contextExpansionLines, block.gap.lines.length), block.gap.lines.length)}
                data-context-gap={block.gap.position} data-hidden-lines={block.gap.lines.length}
                onClick={() => { if (block.gap) expand(block.gap) }}><ExpandIcon direction={block.gap.position} /></button>}
                {block.gap.lines.length > 0 && block.gap.position !== 'leading' && <button type="button" className={css.unifiedGapButton}
                  aria-label={t('expandAllContextDown', { count: block.gap.lines.length })} title={t('expandAllContextDown', { count: block.gap.lines.length })}
                  data-context-expand-all="down" onClick={() => { if (block.gap) expand(block.gap, 'down') }}><ExpandAllIcon direction="down" /></button>}
              </div>
                : <span className={css.unifiedHunkGutter} />}
              <span className={css.unifiedHunkRange}>
                {block.lines.length ? unifiedHunkRange(block.lines, diff) : ''}
                {block.gap && block.lines.length === 0 && block.gap.lines.length > 0 && <small>{labels.expandContext(Math.min(preferences.contextExpansionLines, block.gap.lines.length), block.gap.lines.length)}</small>}
              </span>
            </div>
            {isSplit ? splitRows.length > 0 && <div className={css.splitGrid} style={{ gridTemplateRows: `repeat(${splitRows.length}, minmax(22px, auto))` }}>
              <div className={`${css.splitPane} ${css.splitOldPane}`}>{splitRows.map((row, index) => renderSplitCell(row.old, 'old', index, hunk.lines))}</div>
              <div className={`${css.splitPane} ${css.splitNewPane}`}>{splitRows.map((row, index) => renderSplitCell(row.next, 'new', index, hunk.lines))}</div>
            </div> : block.lines.map(row => renderLine(row, `${row.kind}:${row.oldNumber ?? ''}:${row.newNumber ?? ''}`, hunk.lines))}
          </div>})}
        </div>
      </section>
    })}
    <ReviewOutdatedComments target={reviewTarget} revision={revision} />
  </div>
}
