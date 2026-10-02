import { useCallback, useMemo, useState, type CSSProperties } from 'react'
import type { ProducedFileDiff as DiffHunk } from '../change-types.ts'
import {
  buildUnifiedHunks, CONTEXT_EXPANSION_LINES, expandContextGap, unifiedDiffText,
  unifiedHunkRange, unifiedVisibleBlocks, visibleHunkRows,
  type ContextExpansion, type UnifiedGap, type UnifiedLine,
} from './unified-diff-model.ts'
import css from './UnifiedDiff.module.css'
import { ReviewCommentLine, ReviewOutdatedComments } from './ReviewComments.tsx'
import { lineCommentAnchor, reviewDiffRevision, type ReviewCommentTarget } from './review-comments.ts'

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

/** GitHub-style unified view with two gutters and incremental context expansion. */
export function UnifiedDiff({ diffs, contextLines, labels, className, showCopyButton = true, showFileHeaders = true, reviewTarget }: UnifiedDiffProps) {
  const hunks = useMemo(() => buildUnifiedHunks(diffs, contextLines), [contextLines, diffs])
  const revision = useMemo(() => reviewDiffRevision(diffs), [diffs])
  const [progress, setProgress] = useState<{ revision: string; gaps: ReadonlyMap<string, ContextExpansion> }>(() => ({ revision, gaps: new Map() }))
  const expansions = progress.revision === revision ? progress.gaps : new Map<string, ContextExpansion>()
  const [copied, setCopied] = useState(false)
  const expand = (gap: UnifiedGap) => {
    setProgress(current => {
      const gaps = new Map(current.revision === revision ? current.gaps : [])
      // The control holds remaining lines; its id addresses the full gap.
      const original = hunks.flatMap(hunk => hunk.rows).find((row): row is UnifiedGap => row.kind === 'gap' && row.id === gap.id)
      if (original) gaps.set(gap.id, expandContextGap(original, gaps.get(gap.id)))
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
  const renderLine = (row: UnifiedLine, key: string, lines: readonly UnifiedLine[]) => <ReviewCommentLine key={key} anchor={reviewTarget ? lineCommentAnchor(reviewTarget, row, lines, revision) : undefined}>
    {button => <div className={`${css.unifiedLine} ${css[`unified_${row.kind}`] ?? ''}`} data-line-kind={row.kind} data-old-line={row.oldNumber ?? undefined} data-new-line={row.newNumber ?? undefined}>
      <span className={`${css.unifiedLineNumber} ${css.unifiedOldNumber}`}>{button}{row.oldNumber}</span>
      <span className={css.unifiedLineNumber}>{row.newNumber}</span>
      <span className={css.unifiedSign}>{row.kind === 'del' ? '-' : row.kind === 'add' ? '+' : ' '}</span>
      <span className={css.unifiedText}>{row.text}</span>
    </div>}
  </ReviewCommentLine>
  let previousPath: string | undefined
  return <div className={`${css.unifiedBlock} ${showFileHeaders ? '' : css.unifiedEmbedded} ${reviewTarget ? css.commentEnabled : ''} ${className ?? ''}`} style={style} data-diff="" data-diff-layout="unified">
    {(showCopyButton || expansions.size > 0) && <div className={css.unifiedToolbar}>
      {expansions.size > 0 && <button type="button" onClick={() => { setProgress({ revision, gaps: new Map() }) }}>{labels.collapseContext}</button>}
      {showCopyButton && <button type="button" className={css.unifiedCopyButton} onClick={onCopy}>{copied ? labels.copied : labels.copy}</button>}
    </div>}
    {diffs.map((diff, hunkIndex) => {
      const firstForPath = diff.path !== previousPath
      previousPath = diff.path
      const hunk = hunks[hunkIndex]!
      const total = totals.get(diff.path)!
      const blocks = unifiedVisibleBlocks(visibleHunkRows(hunk, expansions))
      return <section key={`${diff.path}:${hunkIndex}`} className={css.unifiedFile}>
        {showFileHeaders && firstForPath && <header className={css.unifiedHeader}>
          <span className={css.unifiedStatus}>M</span><span className={css.unifiedPath}>{diff.path}</span>
          <span className={css.unifiedAdded}>+{total.added}</span><span className={css.unifiedRemoved}>-{total.removed}</span>
        </header>}
        {hunk.unchangedBefore > 0 && <div className={css.unifiedUnavailable} title={labels.unavailableContext(hunk.unchangedBefore)}>{labels.unavailableContext(hunk.unchangedBefore)}</div>}
        <div className={css.unifiedBody}>
          {blocks.map((block, blockIndex) => <div key={block.gap?.id ?? `block:${blockIndex}`}>
            <div className={css.unifiedHunkHeader}>
              {block.gap ? <button type="button" className={css.unifiedGapButton}
                aria-label={labels.expandContext(Math.min(CONTEXT_EXPANSION_LINES, block.gap.lines.length), block.gap.lines.length)}
                title={labels.expandContext(Math.min(CONTEXT_EXPANSION_LINES, block.gap.lines.length), block.gap.lines.length)}
                data-context-gap={block.gap.position} data-hidden-lines={block.gap.lines.length}
                onClick={() => { if (block.gap) expand(block.gap) }}><ExpandIcon direction={block.gap.position} /></button>
                : <span className={css.unifiedHunkGutter} />}
              <span className={css.unifiedHunkRange}>
                {block.lines.length ? unifiedHunkRange(block.lines, diff) : ''}
                {block.gap && block.lines.length === 0 && <small>{labels.expandContext(Math.min(CONTEXT_EXPANSION_LINES, block.gap.lines.length), block.gap.lines.length)}</small>}
              </span>
            </div>
            {block.lines.map(row => renderLine(row, `${row.kind}:${row.oldNumber ?? ''}:${row.newNumber ?? ''}`, hunk.lines))}
          </div>)}
        </div>
      </section>
    })}
    <ReviewOutdatedComments target={reviewTarget} revision={revision} />
  </div>
}
