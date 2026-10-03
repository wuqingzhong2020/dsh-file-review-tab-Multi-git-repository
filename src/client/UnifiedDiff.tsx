import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { Menu, MenuItemButton } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ProducedFileDiff as DiffHunk } from '../change-types.ts'
import {
  buildUnifiedHunks, expandAllContextGap, expandContextGap, unifiedDiffText,
  splitDiffRows, unifiedHunkRange, unifiedVisibleBlocks, visibleHunkRows,
  type ContextExpansion, type UnifiedGap, type UnifiedLine,
} from './unified-diff-model.ts'
import css from './UnifiedDiff.module.css'
import { ReviewCommentLine, ReviewOutdatedComments, useReviewInteractions } from './ReviewComments.tsx'
import { commentFileKey, lineCommentAnchor, reviewDiffRevision, type ReviewCommentAnchor, type ReviewCommentTarget } from './review-comments.ts'
import { useDiffViewPreferences } from './DiffViewControls.tsx'
import { t, type CopyKey } from './locales.ts'
import { useReviewLocale } from './use-review-locale.ts'
import { DiffCode } from './DiffCode.tsx'
import { diffLanguage, highlightDiff } from './diff-highlight.ts'
import { expandDiffGapSlice, indexDiff, nearestDiffChange, revealDiffLocation, stepDiffIndex, type DiffLocation } from './diff-navigation.ts'
import { searchDiff, type DiffSearchMatch, type DiffSearchSide } from './diff-search.ts'
import { formatReviewReference, rangeReference } from './review-reference.ts'
import { openReviewFile, referenceRequest, reviewLocation } from './review-file-opener.ts'
import type { ReviewLocationResult } from '../review-location.ts'
import { VirtualDiffRows } from './VirtualDiffRows.tsx'
import { contextSelection, type DiffReferenceSelection } from './review-context-selection.ts'

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
  const interactions = useReviewInteractions()
  const isSplit = preferences.layout === 'split'
  const hunks = useMemo(() => buildUnifiedHunks(diffs, contextLines), [contextLines, diffs])
  const revision = useMemo(() => reviewDiffRevision(diffs), [diffs])
  const identity = `${sourceKey ?? (reviewTarget ? commentFileKey(reviewTarget) : '')}:${revision}`
  const index = useMemo(() => indexDiff(hunks, contextLines), [hunks, contextLines])
  const [selection, setSelection] = useState<DiffReferenceSelection | null>(null)
  const selected = selection?.identity === identity ? selection : null
  const reference = useMemo(() => selected && reviewTarget ? rangeReference(reviewTarget, index.lines, selected.start, selected.end, selected.side, revision, `${identity}:hunk:${selected.start.hunkIndex}`) : null, [selected, reviewTarget, index, revision, identity])
  const [referenceNotice, setReferenceNotice] = useState<CopyKey | null>(null)
  const [editorResult, setEditorResult] = useState<ReviewLocationResult | null>(null)
  const [editorBusy, setEditorBusy] = useState(false)
  const [menuPoint, setMenuPoint] = useState<{ x: number; y: number } | null>(null)
  const menuOrigin = useRef<HTMLElement | null>(null)
  const menuOwner = useRef<HTMLDivElement>(null)
  const referenceKey = reference ? JSON.stringify([identity, reference.side, reference.line, reference.endLine, reference.sourceKey]) : ''
  const latestReferenceKey = useRef(referenceKey); latestReferenceKey.current = referenceKey
  const latestIdentity = useRef(identity); latestIdentity.current = identity
  useEffect(() => { setSelection(null); setReferenceNotice(null); setEditorResult(null); setMenuPoint(null) }, [identity])
  useEffect(() => { setMenuPoint(null) }, [isSplit])
  const closeMenu = useCallback(() => {
    const active = document.activeElement
    const owned = active instanceof Element && menuOwner.current?.contains(active)
    setMenuPoint(null)
    if (owned) queueMicrotask(() => {
      if (document.activeElement === document.body || document.activeElement === active) menuOrigin.current?.focus({ preventScroll: true })
    })
  }, [])
  useEffect(() => {
    if (!menuPoint) return
    // Menu focus must not scroll the file or race the native right-button focus.
    const frame = requestAnimationFrame(() => menuOwner.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus({ preventScroll: true }))
    const dismiss = (event: Event) => {
      // Scrolling the menu's own long feedback is allowed; moving the diff dismisses it.
      if (event.type === 'scroll' && event.target instanceof Element && menuOwner.current && event.target.closest('[role="menu"]')?.contains(menuOwner.current)) return
      closeMenu()
    }
    window.addEventListener('scroll', dismiss, true); window.addEventListener('resize', dismiss); window.addEventListener('blur', dismiss)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', dismiss, true); window.removeEventListener('resize', dismiss); window.removeEventListener('blur', dismiss) }
  }, [menuPoint, closeMenu])
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
  const contextRow = (target: EventTarget | null) => {
    if (!(target instanceof Element) || target.closest('input, textarea, select, [contenteditable="true"], button:not([data-reference-number-side])')) return null
    const row = target.closest<HTMLElement>('[data-diff-line-id]')
    if (!row || row.closest('[data-diff]') !== container.current) return null
    const location = index.lines.find(item => item.id === row.dataset.diffLineId)
    const side = target.closest<HTMLElement>('[data-reference-number-side]')?.dataset.referenceNumberSide ?? row.dataset.referenceSide
    return location && (side === 'old' || side === 'new') ? { row, location, side: side as 'old' | 'new' } : null
  }
  const showMenu = (location: DiffLocation, side: 'old' | 'new', row: HTMLElement, x: number, y: number) => {
    if (!reviewTarget) return false
    const next = contextSelection(selected, identity, location, side)
    if (!rangeReference(reviewTarget, index.lines, next.start, next.end, side, revision, identity)) return false
    menuOrigin.current = row.querySelector<HTMLElement>(`[data-reference-number-side="${side}"]`) ?? container.current
    setSelection(next); setReferenceNotice(null); setEditorResult(null); setMenuPoint({ x, y })
    return true
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.nativeEvent.isComposing) return
    if (event.target instanceof Element && event.target.closest('[role="menu"]')) return
    const editable = event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable="true"]')
    if (editable && event.target !== input.current) return
    if (!editable && (event.key === 'ContextMenu' || event.key === 'F10' && event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey)) {
      const clicked = contextRow(event.target)
      const location = clicked?.location ?? selected?.end
      const side = clicked?.side ?? selected?.side
      const row = clicked?.row ?? (location ? lineElements.current.get(`${location.id}:${isSplit ? side : 'unified'}`) : undefined)
      if (location && side && row) {
        const rect = row.getBoundingClientRect()
        if (showMenu(location, side, row, Math.max(12, rect.left + 40), Math.min(window.innerHeight - 12, Math.max(12, rect.bottom)))) event.preventDefault()
      }
      return
    }
    const shortcut = preferences.searchShortcut
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f' && event.altKey === shortcut.includes('alt') && event.shiftKey === shortcut.includes('shift')) {
      event.preventDefault(); setSearchOpen(true); input.current?.focus(); input.current?.select()
    } else if (searchOpen && (event.key === 'F3' || event.target === input.current && event.key === 'Enter')) {
      event.preventDefault(); moveMatch(event.shiftKey ? -1 : 1)
    } else if (searchOpen && event.key === 'Escape') { event.preventDefault(); closeSearch() }
    else if (!editable && !event.shiftKey && (preferences.changeShortcut === 'mod+arrow' ? (event.ctrlKey || event.metaKey) && !event.altKey : event.altKey && !event.ctrlKey && !event.metaKey) && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
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
  const selectLine = (row: UnifiedLine, side: 'old' | 'new', extend: boolean) => {
    setMenuPoint(null)
    const location = index.byLine.get(row)!
    if (extend && selected && selected.side !== side) { setSelection(null); setReferenceNotice('referenceInvalid'); setEditorResult(null); return }
    const start = extend && selected?.side === side ? selected.start : location
    if (!reviewTarget || !rangeReference(reviewTarget, index.lines, start, location, side, revision, identity)) { setSelection(null); setReferenceNotice('referenceInvalid'); setEditorResult(null); return }
    setSelection({ identity, start, end: location, side }); setReferenceNotice(null); setEditorResult(null)
  }
  const openSelection = async (allowRelocate = false) => {
    if (!reference || !interactions || editorBusy) return
    if (reference.side !== 'new') { setEditorResult({ state: 'unsupported', reason: 'old' }); return }
    setEditorBusy(true)
    const requestedIdentity = identity
    const requestedReference = referenceKey
    const fullText = diffs[selected!.start.hunkIndex]?.newStart === 1 ? diffs[selected!.start.hunkIndex]?.newText : undefined
    try { const result = await reviewLocation(interactions.ctx, interactions.sessionId, { ...referenceRequest(reference, preferences.editorPath, fullText), allowRelocate }); if (requestedIdentity === latestIdentity.current && requestedReference === latestReferenceKey.current) setEditorResult(result) }
    catch { if (requestedIdentity === latestIdentity.current && requestedReference === latestReferenceKey.current) setEditorResult({ state: 'error' }) }
    finally { setEditorBusy(false) }
  }
  const copyReference = async (pathOnly: boolean) => {
    if (!reference) return
    const requestedReference = referenceKey
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(pathOnly ? `${reference.absolutePath}:${reference.line}-${reference.endLine} (${reference.side})` : formatReviewReference(reference))
      if (requestedReference === latestReferenceKey.current) setReferenceNotice('referenceCopied')
    } catch { if (requestedReference === latestReferenceKey.current) setReferenceNotice('referenceCopyFailed') }
  }
  const rowAnchor = (row: UnifiedLine, lines: readonly UnifiedLine[], side: 'old' | 'new' = 'new') => reviewTarget ? { ...lineCommentAnchor(reviewTarget, row, lines, revision, side), sourceKey: `${identity}:hunk:${index.byLine.get(row)!.hunkIndex}` } : undefined
  const numberButton = (row: UnifiedLine, side: 'old' | 'new') => {
    const number = side === 'old' ? row.oldNumber : row.newNumber
    if (!reviewTarget) return number
    return number === null ? null : <button type="button" className={css.lineSelect} data-reference-number-side={side} aria-haspopup="menu" aria-label={`${t('referenceSelect')} · ${t(side === 'old' ? 'commentOldLine' : 'commentNewLine', { line: number })}`} title={t('referenceHint')}
      onClick={event => { event.stopPropagation(); selectLine(row, side, event.shiftKey) }}>{number}</button>
  }
  const selectedByDrag = () => {
    const native = window.getSelection()
    if (!native || native.isCollapsed) return
    const cell = (node: Node | null) => {
      const element = node instanceof Element ? node : node?.parentElement
      if (!element?.closest('[data-diff-code]')) return null
      const line = element.closest<HTMLElement>('[data-diff-line-id]')
      return line?.closest('[data-diff]') === container.current ? line : null
    }
    const from = cell(native.anchorNode), to = cell(native.focusNode)
    if (!from || !to) return
    const start = index.lines.find(item => item.id === from.dataset.diffLineId), end = index.lines.find(item => item.id === to.dataset.diffLineId)
    const side = from.dataset.referenceSide as 'old' | 'new'
    const mixed = !isSplit && start && end && index.lines.some(item => item.hunkIndex === start.hunkIndex
      && item.lineIndex >= Math.min(start.lineIndex, end.lineIndex) && item.lineIndex <= Math.max(start.lineIndex, end.lineIndex)
      && (side === 'new' ? item.line.newNumber === null : item.line.oldNumber === null))
    if (!reviewTarget || !start || !end || mixed || side !== to.dataset.referenceSide || !rangeReference(reviewTarget, index.lines, start, end, side, revision, identity)) { setSelection(null); setReferenceNotice('referenceInvalid'); setEditorResult(null); return }
    setSelection({ identity, start, end, side }); setReferenceNotice(null); setEditorResult(null)
    setMenuPoint(null)
  }
  const currentAnchor = (anchor: ReviewCommentAnchor, line: number): ReviewCommentAnchor | null => {
    if (!reviewTarget) return null
    const candidates = index.lines.filter(item => item.line.newNumber === line)
    const ranges = candidates.map(start => {
      const end = index.lines.find(item => item.hunkIndex === start.hunkIndex && item.line.newNumber === line + (anchor.endLine ?? anchor.line ?? line) - (anchor.line ?? line))
      return end ? rangeReference(reviewTarget, index.lines, start, end, 'new', revision, `${identity}:hunk:${start.hunkIndex}`) : null
    }).filter(item => item?.quote === anchor.quote && item.before === anchor.before && item.after === anchor.after)
    return ranges.length === 1 ? ranges[0]! : null
  }
  if (!diffs.length) return null

  const maxNumber = hunks.reduce((max, hunk) => hunk.lines.reduce((current, line) => Math.max(current, line.oldNumber ?? 0, line.newNumber ?? 0), max), 1)
  const fonts = { mono: 'ui-monospace, SFMono-Regular, Consolas, monospace', consolas: 'Consolas, monospace', cascadia: '"Cascadia Code", Consolas, monospace', jetbrains: '"JetBrains Mono", Consolas, monospace' }
  const style = { '--diff-number-width': `${Math.max(4, String(maxNumber).length)}ch`, '--diff-font': fonts[preferences.fontFamily], '--diff-font-size': `${preferences.fontSize}px`, '--diff-row-height': `${preferences.fontSize * preferences.lineHeight}px`, '--diff-tab-size': preferences.tabSize, '--diff-add-strength': `${preferences.colorStrength}%`, '--diff-del-strength': `${preferences.colorStrength}%`,
    ...(preferences.colors === 'blue-orange' ? { '--diff-add': '#0969da', '--diff-del': '#bc4c00' } : {}) } as CSSProperties
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
      'data-reference-side': targetSide === 'unified' ? row.kind === 'del' ? 'old' : 'new' : targetSide,
      'data-reference-selected': reference && selected?.start.hunkIndex === location.hunkIndex && (reference.side === 'old' ? row.oldNumber : row.newNumber) !== null && (reference.side === 'old' ? row.oldNumber! : row.newNumber!) >= reference.line! && (reference.side === 'old' ? row.oldNumber! : row.newNumber!) <= reference.endLine && (targetSide === 'unified' || targetSide === reference.side) ? '' : undefined,
    }
  }
  const code = (row: UnifiedLine, targetSide: 'old' | 'new' | 'unified') => {
    const location = index.byLine.get(row)!
    const actualSide = targetSide === 'unified' ? row.newNumber === null ? 'old' : 'new' : targetSide
    const tokens = syntax.get(row)?.[actualSide === 'old' ? 'old' : 'next']
    const matches = matchesByLine.get(location.id)?.filter(match => targetSide === 'unified' || match.side === targetSide)
    return <DiffCode text={row.text} tokens={tokens} matches={matches} active={activeMatch?.id} />
  }
  const renderLine = (row: UnifiedLine, key: string, lines: readonly UnifiedLine[]) => <ReviewCommentLine key={key} anchor={rowAnchor(row, lines)}
    alternateAnchor={row.kind === 'context' ? rowAnchor(row, lines, 'old') : undefined}>
    {button => <div {...lineProps(row, 'unified')} className={`${css.unifiedLine} ${css[`unified_${row.kind}`] ?? ''}`} data-line-kind={row.kind} data-old-line={row.oldNumber ?? undefined} data-new-line={row.newNumber ?? undefined}>
      <span className={`${css.unifiedLineNumber} ${css.unifiedOldNumber}`}>{button}{numberButton(row, 'old')}</span>
      <span className={css.unifiedLineNumber}>{numberButton(row, 'new')}</span>
      <span className={css.unifiedSign}>{row.kind === 'del' ? '-' : row.kind === 'add' ? '+' : ' '}</span>
      <span className={css.unifiedText} data-diff-code="">{code(row, 'unified')}</span>
    </div>}
  </ReviewCommentLine>
  const renderSplitCell = (row: UnifiedLine | null, side: 'old' | 'new', key: number, lines: readonly UnifiedLine[]) => <div key={`${side}:${key}`}
    className={`${css.splitCell} ${row ? css[`unified_${row.kind}`] ?? '' : css.splitMissing}`}>
    {row && <ReviewCommentLine anchor={rowAnchor(row, lines, side)}>
      {button => <div {...lineProps(row, side)} className={`${css.splitLine} ${css[`unified_${row.kind}`] ?? ''}`} data-line-kind={row.kind} data-diff-side={side}
        data-old-line={side === 'old' ? row.oldNumber ?? undefined : undefined} data-new-line={side === 'new' ? row.newNumber ?? undefined : undefined}>
        <span className={`${css.unifiedLineNumber} ${css.unifiedOldNumber}`}>{button}{numberButton(row, side)}</span>
        <span className={css.unifiedSign}>{row.kind === 'del' ? '-' : row.kind === 'add' ? '+' : ' '}</span>
        <span className={css.unifiedText} data-diff-code="">{code(row, side)}</span>
      </div>}
    </ReviewCommentLine>}
  </div>
  let previousPath: string | undefined
  return <div ref={container} tabIndex={0} onKeyDown={onKeyDown} onMouseUp={event => { if (event.button === 0 && !(event.target instanceof Element && event.target.closest('[role="menu"]'))) selectedByDrag() }}
    onContextMenu={event => {
      const clicked = contextRow(event.target)
      if (clicked && showMenu(clicked.location, clicked.side, clicked.row, event.clientX, event.clientY)) event.preventDefault()
    }} className={`${css.unifiedBlock} ${showFileHeaders ? '' : css.unifiedEmbedded} ${reviewTarget ? css.commentEnabled : ''} ${preferences.wrap ? css.wrapLines : ''} ${className ?? ''}`} style={style} data-diff="" data-diff-layout={preferences.layout} data-diff-wrap={preferences.wrap}>
    <div className={css.unifiedToolbar}>
      <button ref={searchButton} type="button" className={css.toolButton} aria-label={t('diffSearch')} title={`${t('diffSearch')} (${preferences.searchShortcut.replace('mod', 'Ctrl/Cmd')})`} aria-expanded={searchOpen}
        onClick={() => { if (searchOpen) closeSearch(); else setSearchOpen(true) }}><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="6.5" cy="6.5" r="4" /><path d="m9.5 9.5 4 4" /></svg>{t('diffSearch')}</button>
      <button type="button" className={css.toolButton} aria-label={t('diffPreviousChange')} title={`${t('diffPreviousChange')} (${preferences.changeShortcut === 'mod+arrow' ? 'Ctrl/Cmd' : 'Alt'}+↑)`} disabled={!index.changes.length} onClick={() => moveChange(-1)}>↑</button>
      <select className={css.changeSelect} aria-label={t('diffChangeNavigation')} value={changeIndex} disabled={!index.changes.length} onChange={event => {
        const change = index.changes[Number(event.target.value)]
        if (change) locate(change.first, change.first.line.newNumber === null ? 'old' : 'new')
      }}>
        <option value={-1}>{t('diffChangeCount', { count: index.changes.length })}</option>
        {index.changes.map((change, number) => <option key={change.id} value={number}>{t('diffChangePosition', { current: number + 1, count: index.changes.length })}</option>)}
      </select>
      <button type="button" className={css.toolButton} aria-label={t('diffNextChange')} title={`${t('diffNextChange')} (${preferences.changeShortcut === 'mod+arrow' ? 'Ctrl/Cmd' : 'Alt'}+↓)`} disabled={!index.changes.length} onClick={() => moveChange(1)}>↓</button>
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
    {reference && <Menu open={menuPoint !== null} portal anchor={null} className={css.referenceMenuAnchor} listClassName={css.referenceMenu}
      getAnchorRect={() => menuPoint ? new DOMRect(menuPoint.x, menuPoint.y, 0, 0) : null} onClose={closeMenu}>
      <div ref={menuOwner} role="presentation" onContextMenu={event => event.preventDefault()}>
      <strong className={css.referenceMenuHeading}>{t('referenceRange', { side: t(reference.side === 'old' ? 'diffOld' : 'diffNew'), start: reference.line!, end: reference.endLine })}</strong>
      <MenuItemButton onSelect={() => void copyReference(false)}>{t('referenceCopy')}</MenuItemButton>
      <MenuItemButton onSelect={() => void copyReference(true)}>{t('referenceCopyPath')}</MenuItemButton>
      {interactions && <>
        <MenuItemButton disabled={interactions.snapshot.busy} onSelect={() => { setMenuPoint(null); interactions.start(reference, 'inline') }}>{t('referenceComment')}</MenuItemButton>
        <MenuItemButton disabled={editorBusy} onSelect={() => void openSelection()}>{t(editorBusy ? 'editorOpening' : 'editorOpenSelection')}</MenuItemButton>
      </>}
      <MenuItemButton separatorBefore onSelect={() => { closeMenu(); setSelection(null); setReferenceNotice(null); setEditorResult(null); window.getSelection()?.removeAllRanges() }}>{t('referenceClear')}</MenuItemButton>
    {referenceNotice && <p className={css.referenceNotice} role="status">{t(referenceNotice)}</p>}
    {editorResult && <div className={css.referenceNotice} role="status">
      {t(editorResult.reason === 'old' ? 'editorOld' : ({ exact: 'referenceExact', moved: 'editorMoved', ambiguous: 'editorAmbiguous', changed: 'editorChanged', missing: 'editorMissing', unsupported: 'editorUnsupported', started: 'editorStarted', 'editor-missing': 'editorUnavailable', error: 'editorFailed' } as const)[editorResult.state], { line: editorResult.line ?? '' })}
      {editorResult.state === 'moved' && <MenuItemButton disabled={editorBusy} onSelect={() => void openSelection(true)}>{t('editorConfirmMoved', { line: editorResult.line ?? '' })}</MenuItemButton>}
      {interactions && editorResult.state !== 'started' && editorResult.state !== 'missing' && <MenuItemButton onSelect={() => { if (openReviewFile(interactions.ctx, interactions.sessionId, reference.absolutePath)) closeMenu(); else setEditorResult({ state: 'error' }) }}>{t('editorOpenFile')}</MenuItemButton>}
    </div>}
      </div>
    </Menu>}
    {referenceNotice === 'referenceInvalid' && <p className={css.referenceNotice} role="status">{t(referenceNotice)}</p>}
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
            <VirtualDiffRows count={isSplit ? splitRows.length : block.lines.length} enabled={preferences.virtualize} estimate={preferences.fontSize * preferences.lineHeight}
              identity={`${identity}:${hunkIndex}:${block.gap?.id ?? blockIndex}:${block.lines.length}:${block.lines[0] ? index.byLine.get(block.lines[0])!.id : ''}:${preferences.layout}:${preferences.wrap}:${preferences.fontFamily}:${preferences.fontSize}:${preferences.lineHeight}:${preferences.tabSize}`}
              focusVersion={focused?.serial ?? 0}
              focusIndex={focused ? isSplit ? splitRows.findIndex(pair => (focused.side === 'old' ? pair.old : pair.next) === focused.location.line) : block.lines.indexOf(focused.location.line) : -1}
              keepIndices={interactions?.composer?.placement === 'inline' && interactions.composer.anchor.sourceKey === `${identity}:hunk:${hunkIndex}` ? (isSplit ? splitRows.map((pair, i) => ({ row: interactions.composer!.anchor.side === 'old' ? pair.old : pair.next, i })) : block.lines.map((row, i) => ({ row, i }))).filter(({ row }) => row && (interactions.composer!.anchor.side === 'old' ? row.oldNumber : row.newNumber) === interactions.composer!.anchor.line).map(item => item.i) : []}
              render={rowIndex => isSplit ? <div key={rowIndex} className={css.splitPair}>{renderSplitCell(splitRows[rowIndex]!.old, 'old', rowIndex, hunk.lines)}{renderSplitCell(splitRows[rowIndex]!.next, 'new', rowIndex, hunk.lines)}</div>
                : renderLine(block.lines[rowIndex]!, `${block.lines[rowIndex]!.kind}:${rowIndex}`, hunk.lines)} />
          </div>})}
        </div>
      </section>
    })}
    <ReviewOutdatedComments target={reviewTarget} revision={revision} currentAnchor={currentAnchor} />
  </div>
}
