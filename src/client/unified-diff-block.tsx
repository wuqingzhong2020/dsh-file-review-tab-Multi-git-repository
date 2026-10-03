import type { ReactNode } from 'react'
import type { ProducedFileDiff } from '../change-types.ts'
import type { DiffIndex, DiffLocation } from './diff-navigation.ts'
import type { DiffViewPreferences } from './diff-view-preferences.ts'
import { t } from './locales.ts'
import type { ReviewCommentAnchor } from './review-comments.ts'
import {
  splitDiffRows,
  unifiedHunkRange,
  type UnifiedGap,
  type UnifiedLine,
  type UnifiedVisibleBlock,
} from './unified-diff-model.ts'
import type { UnifiedDiffLabels } from './UnifiedDiff.tsx'
import { VirtualDiffRows } from './VirtualDiffRows.tsx'
import css from './UnifiedDiff.module.css'

function ExpandIcon({ direction }: { direction: UnifiedGap['position'] }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      {direction !== 'trailing' && <path d="m4 5 4-3 4 3M8 2v4" />}
      {direction !== 'leading' && <path d="m4 11 4 3 4-3M8 14v-4" />}
      <path d="M2 8h1m3 0h1m3 0h1m3 0h1" />
    </svg>
  )
}

function ExpandAllIcon({ direction }: { direction: 'up' | 'down' }) {
  const path =
    direction === 'up' ? 'm4 8 4-4 4 4m-8 4 4-4 4 4M3 2h10' : 'm4 4 4 4 4-4m-8 4 4 4 4-4M3 14h10'
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d={path} />
    </svg>
  )
}

function CollapseContextIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="m4 2 4 4 4-4M8 2v4m-4 8 4-4 4 4M8 14v-4M2 8h12" />
    </svg>
  )
}

interface GapControlsProps {
  readonly gap: UnifiedGap
  readonly expandedLines: number
  readonly expansionLines: number
  readonly labels: UnifiedDiffLabels
  readonly expand: (gap: UnifiedGap, direction?: 'up' | 'down') => void
  readonly collapse: (gap: UnifiedGap) => void
}

function GapControls({
  gap,
  expandedLines,
  expansionLines,
  labels,
  expand,
  collapse,
}: GapControlsProps) {
  const hiddenLines = gap.lines.length
  const expandLabel =
    hiddenLines > 0 ? labels.expandContext(Math.min(expansionLines, hiddenLines), hiddenLines) : ''
  const collapseLabel = t('collapseContextGap', { count: expandedLines })
  const expandUpLabel = t('expandAllContextUp', { count: hiddenLines })
  const expandDownLabel = t('expandAllContextDown', { count: hiddenLines })
  return (
    <div className={css.unifiedGapControls}>
      {expandedLines > 0 && (
        <button
          type="button"
          className={css.unifiedGapButton}
          aria-label={collapseLabel}
          title={collapseLabel}
          data-context-collapse={gap.id}
          onClick={() => collapse(gap)}
        >
          <CollapseContextIcon />
        </button>
      )}
      {hiddenLines > 0 && gap.position !== 'trailing' && (
        <button
          type="button"
          className={css.unifiedGapButton}
          aria-label={expandUpLabel}
          title={expandUpLabel}
          data-context-expand-all="up"
          onClick={() => expand(gap, 'up')}
        >
          <ExpandAllIcon direction="up" />
        </button>
      )}
      {hiddenLines > 0 && (
        <button
          type="button"
          className={css.unifiedGapButton}
          aria-label={expandLabel}
          title={expandLabel}
          data-context-gap={gap.position}
          data-hidden-lines={hiddenLines}
          onClick={() => expand(gap)}
        >
          <ExpandIcon direction={gap.position} />
        </button>
      )}
      {hiddenLines > 0 && gap.position !== 'leading' && (
        <button
          type="button"
          className={css.unifiedGapButton}
          aria-label={expandDownLabel}
          title={expandDownLabel}
          data-context-expand-all="down"
          onClick={() => expand(gap, 'down')}
        >
          <ExpandAllIcon direction="down" />
        </button>
      )}
    </div>
  )
}

interface DiffBlockProps {
  readonly diff: ProducedFileDiff
  readonly block: UnifiedVisibleBlock
  readonly blockIndex: number
  readonly hunkIndex: number
  readonly hunkLines: readonly UnifiedLine[]
  readonly identity: string
  readonly index: DiffIndex
  readonly preferences: DiffViewPreferences
  readonly labels: UnifiedDiffLabels
  readonly expandedLines: number
  readonly focused: {
    readonly location: DiffLocation
    readonly side: 'old' | 'new'
    readonly serial: number
  } | null
  readonly commentAnchor: ReviewCommentAnchor | undefined
  readonly expand: GapControlsProps['expand']
  readonly collapse: GapControlsProps['collapse']
  readonly renderLine: (row: UnifiedLine, key: string, lines: readonly UnifiedLine[]) => ReactNode
  readonly renderSplitCell: (
    row: UnifiedLine | null,
    side: 'old' | 'new',
    key: number,
    lines: readonly UnifiedLine[],
  ) => ReactNode
}

/** Share block identity and pinned comment rows across both presentations. */
export function DiffBlock({
  diff,
  block,
  blockIndex,
  hunkIndex,
  hunkLines,
  identity,
  index,
  preferences,
  labels,
  expandedLines,
  focused,
  commentAnchor,
  expand,
  collapse,
  renderLine,
  renderSplitCell,
}: DiffBlockProps) {
  const isSplit = preferences.layout === 'split'
  const splitRows = isSplit ? splitDiffRows(block.lines) : []
  const rowCount = isSplit ? splitRows.length : block.lines.length
  const firstLineId = block.lines[0] ? index.byLine.get(block.lines[0])!.id : ''
  const virtualIdentity = `${identity}:${hunkIndex}:${block.gap?.id ?? blockIndex}:${block.lines.length}:${firstLineId}:${preferences.layout}:${preferences.wrap}:${preferences.fontFamily}:${preferences.fontSize}:${preferences.lineHeight}:${preferences.tabSize}`
  const focusIndex = !focused
    ? -1
    : isSplit
      ? splitRows.findIndex(
          pair => (focused.side === 'old' ? pair.old : pair.next) === focused.location.line,
        )
      : block.lines.indexOf(focused.location.line)

  const keepIndices: number[] = []
  if (commentAnchor?.sourceKey === `${identity}:hunk:${hunkIndex}`) {
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const row = isSplit
        ? commentAnchor.side === 'old'
          ? splitRows[rowIndex]!.old
          : splitRows[rowIndex]!.next
        : block.lines[rowIndex]
      const number = commentAnchor.side === 'old' ? row?.oldNumber : row?.newNumber
      if (row && number === commentAnchor.line) keepIndices.push(rowIndex)
    }
  }

  const renderRow = (rowIndex: number) => {
    if (isSplit) {
      const pair = splitRows[rowIndex]!
      return (
        <div key={rowIndex} className={css.splitPair}>
          {renderSplitCell(pair.old, 'old', rowIndex, hunkLines)}
          {renderSplitCell(pair.next, 'new', rowIndex, hunkLines)}
        </div>
      )
    }
    const row = block.lines[rowIndex]!
    return renderLine(row, `${row.kind}:${rowIndex}`, hunkLines)
  }

  const gap = block.gap
  return (
    <div>
      <div className={css.unifiedHunkHeader}>
        {gap ? (
          <GapControls
            gap={gap}
            expandedLines={expandedLines}
            expansionLines={preferences.contextExpansionLines}
            labels={labels}
            expand={expand}
            collapse={collapse}
          />
        ) : (
          <span className={css.unifiedHunkGutter} />
        )}
        <span className={css.unifiedHunkRange}>
          {block.lines.length ? unifiedHunkRange(block.lines, diff) : ''}
          {gap && block.lines.length === 0 && gap.lines.length > 0 && (
            <small>
              {labels.expandContext(
                Math.min(preferences.contextExpansionLines, gap.lines.length),
                gap.lines.length,
              )}
            </small>
          )}
        </span>
      </div>
      <VirtualDiffRows
        count={rowCount}
        enabled={preferences.virtualize}
        estimate={preferences.fontSize * preferences.lineHeight}
        identity={virtualIdentity}
        focusVersion={focused?.serial ?? 0}
        focusIndex={focusIndex}
        keepIndices={keepIndices}
        render={renderRow}
      />
    </div>
  )
}
