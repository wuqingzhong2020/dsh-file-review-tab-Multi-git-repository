import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import type { ProducedFileDiff as DiffHunk } from '../change-types.ts'
import {
  buildUnifiedHunks, expandAllContextGap, expandContextGap, unifiedDiffText,
  splitDiffRows, unifiedHunkRange, unifiedVisibleBlocks, visibleHunkRows,
  type ContextExpansion, type UnifiedGap, type UnifiedLine,
} from './unified-diff-model.ts'
import css from './UnifiedDiff.module.css'
import { ReviewCommentLine, ReviewOutdatedComments } from './ReviewComments.tsx'
import { commentFileKey, lineCommentAnchor, reviewDiffRevision, type ReviewCommentTarget } from './review-comments.ts'
import { useDiffViewPreferences } from './DiffViewControls.tsx'
import { t } from './locales.ts'
import { useReviewLocale } from './use-review-locale.ts'
import { DiffCode } from './DiffCode.tsx'
import { diffLanguage, highlightDiff } from './diff-highlight.ts'
import { expandDiffGapSlice, indexDiff, nearestDiffChange, revealDiffLocation, stepDiffIndex, type DiffLocation } from './diff-navigation.ts'
import { searchDiff, type DiffSearchMatch, type DiffSearchSide } from './diff-search.ts'

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
  readonly sourceKey?: string | undefined
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
export function UnifiedDiff({ diffs, contextLines, labels, className, showCopyButton = true, showFileHeaders = true, reviewTarget, sourceKey }: UnifiedDiffProps) {
  useReviewLocale()
  const preferences = useDiffViewPreferences()
  const isSplit = preferences.layout === 'split'
  const hunks = useMemo(() => buildUnifiedHunks(diffs, contextLines), [contextLines, diffs])
  const revision = useMemo(() => reviewDiffRevision(diffs), [diffs])
  const identity = `${sourceKey ?? (reviewTarget ? commentFileKey(reviewTarget) : '')}:${revision}`
  const index = useMemo(() => indexDiff(hunks, contextLines), [hunks, contextLines])
  const syntax = useMemo(() => highlightDiff(diffs, hunks), [diffs, hunks])
  const container = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const searchButton = useRef<HTMLButtonElement>(null)
  const lineElements = useRef(new Map<string, HTMLDivElement>())
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [side, setSide] = useState<DiffSearchSide>('both')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const result = useMemo(() => searchDiff(index.lines, searchOpen ? query : '', { side, caseSensitive, wholeWord }), [index, searchOpen, query, side, caseSensitive, wholeWord])
  const searchKey = JSON.stringify([identity, searchOpen, query, side, caseSensitive, wholeWord])
  const [selectedMatch, setSelectedMatch] = useState({ key: '', index: -1 })
  const matchIndex = selectedMatch.key === searchKey ? selectedMatch.index : result.matches.length ? 0 : -1
  const activeMatch = result.matches[matchIndex]
  const matchesByLine = useMemo(() => {
    const matches = new Map<string, DiffSearchMatch[]>()
    for (const match of result.matches) { const group = matches.get(match.location.id) ?? []; group.push(match); matches.set(match.location.id, group) }
    return matches
  }, [result])
  const [selectedChange, setSelectedChange] = useState({ identity: '', index: -1 })
  const changeIndex = selectedChange.identity === identity ? selectedChange.index : -1
  const [focus, setFocus] = useState<{ identity: string; location: DiffLocation; side: 'old' | 'new'; serial: number } | null>(null)
  const focused = useMemo(() => {
    if (focus?.identity !== identity) return null
    const row = hunks[focus.location.hunkIndex]?.lines[focus.location.lineIndex]
    const location = row ? index.byLine.get(row) : undefined
    return location ? { ...focus, location } : null
  }, [focus, identity, hunks, index])
  const [progress, setProgress] = useState<{ revision: string; gaps: ReadonlyMap<string, ContextExpansion> }>(() => ({ revision: identity, gaps: new Map() }))
  const expansions = useMemo(() => {
    const base = progress.revision === identity ? progress.gaps : new Map<string, ContextExpansion>()
    return focused ? revealDiffLocation(hunks, base, focused.location) : base
  }, [progress, identity, hunks, focused])
  const locate = useCallback((location: DiffLocation, targetSide: 'old' | 'new') => {
    setSelectedChange({ identity, index: nearestDiffChange(index.changes, location) })
    setFocus(current => ({ identity, location, side: targetSide, serial: (current?.serial ?? 0) + 1 }))
  }, [identity, index])
  const lastSearchKey = useRef('')
  useEffect(() => {
    if (lastSearchKey.current === searchKey) return
    lastSearchKey.current = searchKey
    setSelectedMatch({ key: searchKey, index: result.matches.length ? 0 : -1 })
    const first = result.matches[0]
    if (first) locate(first.location, first.side)
    else setFocus(null)
  }, [searchKey, result, locate])
  useEffect(() => { if (searchOpen) input.current?.focus() }, [searchOpen])
  useEffect(() => {
    if (!focused) return
    const target = lineElements.current.get(`${focused.location.id}:${isSplit ? focused.side : 'unified'}`)
    target?.scrollIntoView({ block: 'center', inline: 'nearest' })
  }, [focused, isSplit])
  const moveMatch = (direction: 1 | -1) => {
    const next = stepDiffIndex(matchIndex, direction, result.matches.length)
    const match = result.matches[next]
    if (!match) return
    setSelectedMatch({ key: searchKey, index: next }); locate(match.location, match.side)
  }
  const moveChange = (direction: 1 | -1) => {
    const next = stepDiffIndex(changeIndex, direction, index.changes.length)
    const change = index.changes[next]
    if (change) locate(change.first, change.first.line.newNumber === null ? 'old' : 'new')
  }
  const closeSearch = () => { setSearchOpen(false); setFocus(null); searchButton.current?.focus() }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.nativeEvent.isComposing) return
    const editable = event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable="true"]')
    if (editable && event.target !== input.current) return
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f' && !event.altKey) {
      event.preventDefault(); setSearchOpen(true); input.current?.focus(); input.current?.select()
    } else if (searchOpen && (event.key === 'F3' || event.target === input.current && event.key === 'Enter')) {
      event.preventDefault(); moveMatch(event.shiftKey ? -1 : 1)
    } else if (searchOpen && event.key === 'Escape') { event.preventDefault(); closeSearch() }
    else if (!editable && (event.ctrlKey || event.metaKey) && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault(); moveChange(event.key === 'ArrowDown' ? 1 : -1)
    }
  }
  const [copied, setCopied] = useState(false)
  const expand = (gap: UnifiedGap, direction?: 'up' | 'down') => {
    const originId = gap.originId ?? gap.id
    setProgress(current => {
      const gaps = new Map(current.revision === identity ? current.gaps : [])
      // The control holds remaining lines; its id addresses the full gap.
      const original = hunks.flatMap(hunk => hunk.rows).find((row): row is UnifiedGap => row.kind === 'gap' && row.id === originId)
      const previous = expansions.get(originId)
      if (original) gaps.set(originId, previous?.revealed?.length
        ? expandDiffGapSlice(gap, previous, direction ? gap.lines.length : preferences.contextExpansionLines, direction)
        : direction ? expandAllContextGap(original, direction, gaps.get(originId)) : expandContextGap(original, gaps.get(originId), preferences.contextExpansionLines))
      return { revision: identity, gaps }
    })
  }
  const collapseGap = (gap: UnifiedGap) => {
    setFocus(null)
    setProgress(current => {
      const gaps = new Map(current.revision === identity ? current.gaps : [])
      gaps.delete(gap.originId ?? gap.id)
      return { revision: identity, gaps }
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
  const lineProps = (row: UnifiedLine, targetSide: 'old' | 'new' | 'unified') => {
    const location = index.byLine.get(row)!
    const key = `${location.id}:${targetSide}`
    return {
      ref: (element: HTMLDivElement | null) => { if (element) lineElements.current.set(key, element); else lineElements.current.delete(key) },
      'data-diff-line-id': location.id,
      'data-navigation-target': focused?.location.id === location.id ? '' : undefined,
    }
  }
  const code = (row: UnifiedLine, targetSide: 'old' | 'new' | 'unified') => {
    const location = index.byLine.get(row)!
    const actualSide = targetSide === 'unified' ? row.newNumber === null ? 'old' : 'new' : targetSide
    const tokens = syntax.get(row)?.[actualSide === 'old' ? 'old' : 'next']
    const matches = matchesByLine.get(location.id)?.filter(match => targetSide === 'unified' || match.side === targetSide)
    return <DiffCode text={row.text} tokens={tokens} matches={matches} active={activeMatch?.id} />
  }
  const renderLine = (row: UnifiedLine, key: string, lines: readonly UnifiedLine[]) => <ReviewCommentLine key={key} anchor={reviewTarget ? lineCommentAnchor(reviewTarget, row, lines, revision) : undefined}
    alternateAnchor={reviewTarget && row.kind === 'context' ? lineCommentAnchor(reviewTarget, row, lines, revision, 'old') : undefined}>
    {button => <div {...lineProps(row, 'unified')} className={`${css.unifiedLine} ${css[`unified_${row.kind}`] ?? ''}`} data-line-kind={row.kind} data-old-line={row.oldNumber ?? undefined} data-new-line={row.newNumber ?? undefined}>
      <span className={`${css.unifiedLineNumber} ${css.unifiedOldNumber}`}>{button}{row.oldNumber}</span>
      <span className={css.unifiedLineNumber}>{row.newNumber}</span>
      <span className={css.unifiedSign}>{row.kind === 'del' ? '-' : row.kind === 'add' ? '+' : ' '}</span>
      <span className={css.unifiedText}>{code(row, 'unified')}</span>
    </div>}
  </ReviewCommentLine>
  const renderSplitCell = (row: UnifiedLine | null, side: 'old' | 'new', key: number, lines: readonly UnifiedLine[]) => <div key={key}
    className={`${css.splitCell} ${row ? css[`unified_${row.kind}`] ?? '' : css.splitMissing}`}>
    {row && <ReviewCommentLine anchor={reviewTarget ? lineCommentAnchor(reviewTarget, row, lines, revision, side) : undefined}>
      {button => <div {...lineProps(row, side)} className={`${css.splitLine} ${css[`unified_${row.kind}`] ?? ''}`} data-line-kind={row.kind} data-diff-side={side}
        data-old-line={side === 'old' ? row.oldNumber ?? undefined : undefined} data-new-line={side === 'new' ? row.newNumber ?? undefined : undefined}>
        <span className={`${css.unifiedLineNumber} ${css.unifiedOldNumber}`}>{button}{side === 'old' ? row.oldNumber : row.newNumber}</span>
        <span className={css.unifiedSign}>{row.kind === 'del' ? '-' : row.kind === 'add' ? '+' : ' '}</span>
        <span className={css.unifiedText}>{code(row, side)}</span>
      </div>}
    </ReviewCommentLine>}
  </div>
  let previousPath: string | undefined
  return <div ref={container} tabIndex={0} onKeyDown={onKeyDown} className={`${css.unifiedBlock} ${showFileHeaders ? '' : css.unifiedEmbedded} ${reviewTarget ? css.commentEnabled : ''} ${preferences.wrap ? css.wrapLines : ''} ${className ?? ''}`} style={style} data-diff="" data-diff-layout={preferences.layout} data-diff-wrap={preferences.wrap}>
    <div className={css.unifiedToolbar}>
      <button ref={searchButton} type="button" className={css.toolButton} aria-label={t('diffSearch')} title={t('diffSearchShortcut')} aria-expanded={searchOpen}
        onClick={() => { if (searchOpen) closeSearch(); else setSearchOpen(true) }}><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="6.5" cy="6.5" r="4" /><path d="m9.5 9.5 4 4" /></svg>{t('diffSearch')}</button>
      <button type="button" className={css.toolButton} aria-label={t('diffPreviousChange')} title={t('diffPreviousChangeShortcut')} disabled={!index.changes.length} onClick={() => moveChange(-1)}>↑</button>
      <select className={css.changeSelect} aria-label={t('diffChangeNavigation')} value={changeIndex} disabled={!index.changes.length} onChange={event => {
        const change = index.changes[Number(event.target.value)]
        if (change) locate(change.first, change.first.line.newNumber === null ? 'old' : 'new')
      }}>
        <option value={-1}>{t('diffChangeCount', { count: index.changes.length })}</option>
        {index.changes.map((change, number) => <option key={change.id} value={number}>{t('diffChangePosition', { current: number + 1, count: index.changes.length })}</option>)}
      </select>
      <button type="button" className={css.toolButton} aria-label={t('diffNextChange')} title={t('diffNextChangeShortcut')} disabled={!index.changes.length} onClick={() => moveChange(1)}>↓</button>
      <span className={css.languageLabel} title={t('diffSyntaxLanguage')}>{({ cpp: 'C/C++', javascript: 'JavaScript', typescript: 'TypeScript', python: 'Python 3', json: 'JSON', markdown: 'Markdown', text: t('diffPlainText') })[diffLanguage(diffs[0]!.path)]}</span>
      {expansions.size > 0 && <button type="button" onClick={() => { setFocus(null); setProgress({ revision: identity, gaps: new Map() }) }}>{labels.collapseContext}</button>}
      {showCopyButton && <button type="button" className={css.unifiedCopyButton} onClick={onCopy}>{copied ? labels.copied : labels.copy}</button>}
    </div>
    {searchOpen && <div className={css.searchToolbar} role="search" aria-label={t('diffSearch')}>
      <input ref={input} type="search" maxLength={256} aria-label={t('diffSearchQuery')} placeholder={t('diffSearchQuery')} value={query} onChange={event => setQuery(event.target.value)} />
      <select aria-label={t('diffSearchSide')} value={side} onChange={event => setSide(event.target.value as DiffSearchSide)}>
        <option value="both">{t('diffSearchBoth')}</option><option value="old">{t('diffOld')}</option><option value="new">{t('diffNew')}</option>
      </select>
      <button type="button" title={t('diffSearchCase')} aria-label={t('diffSearchCase')} aria-pressed={caseSensitive} onClick={() => setCaseSensitive(!caseSensitive)}>Aa</button>
      <button type="button" title={t('diffSearchWord')} aria-label={t('diffSearchWord')} aria-pressed={wholeWord} onClick={() => setWholeWord(!wholeWord)}>{t('diffSearchWord')}</button>
      <span className={css.searchStatus} role="status">{query ? result.truncated ? t('diffSearchLimited', { count: result.matches.length }) : t('diffSearchCount', { current: matchIndex + 1, count: result.matches.length }) : t('diffSearchRecorded')}</span>
      <button type="button" aria-label={t('diffSearchPrevious')} title={t('diffSearchPrevious')} disabled={!result.matches.length} onClick={() => moveMatch(-1)}>↑</button>
      <button type="button" aria-label={t('diffSearchNext')} title={t('diffSearchNext')} disabled={!result.matches.length} onClick={() => moveMatch(1)}>↓</button>
      <button type="button" aria-label={t('diffSearchClose')} title={t('diffSearchClose')} onClick={closeSearch}>×</button>
      {activeMatch && <small>{t(activeMatch.side === 'old' ? 'commentOldLine' : 'commentNewLine', { line: activeMatch.side === 'old' ? activeMatch.location.line.oldNumber ?? '' : activeMatch.location.line.newNumber ?? '' })}</small>}
    </div>}
    {diffs.map((diff, hunkIndex) => {
      const firstForPath = diff.path !== previousPath
      previousPath = diff.path
      const hunk = hunks[hunkIndex]!
      const total = totals.get(diff.path)!
      const visibleRows = visibleHunkRows(hunk, expansions, true)
      const blocks = unifiedVisibleBlocks(visibleRows)
      const hiddenCounts = new Map<string, number>()
      for (const row of visibleRows) if (row.kind === 'gap') {
        const key = row.originId ?? row.id
        hiddenCounts.set(key, (hiddenCounts.get(key) ?? 0) + row.lines.length)
      }
      const expandedCounts = new Map(hunk.rows.filter((row): row is UnifiedGap => row.kind === 'gap').map(gap => [gap.id, gap.lines.length - (hiddenCounts.get(gap.id) ?? 0)]))
      return <section key={`${diff.path}:${hunkIndex}`} className={css.unifiedFile} data-syntax-language={diffLanguage(diff.path)}>
        {showFileHeaders && firstForPath && <header className={css.unifiedHeader}>
          <span className={css.unifiedStatus}>M</span><span className={css.unifiedPath}>{diff.path}</span>
          <span className={css.unifiedAdded}>+{total.added}</span><span className={css.unifiedRemoved}>-{total.removed}</span>
        </header>}
        {hunk.unchangedBefore > 0 && <div className={css.unifiedUnavailable} title={labels.unavailableContext(hunk.unchangedBefore)}>{labels.unavailableContext(hunk.unchangedBefore)}</div>}
        {isSplit && <div className={css.splitLegend}><span>{t('diffOld')}</span><span>{t('diffNew')}</span></div>}
        <div className={`${css.unifiedBody} ${isSplit ? css.splitBody : ''}`}>
          {blocks.map((block, blockIndex) => {
            const splitRows = isSplit ? splitDiffRows(block.lines) : []
            const originalId = block.gap?.originId ?? block.gap?.id
            const expandedLines = originalId ? expandedCounts.get(originalId) ?? 0 : 0
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
