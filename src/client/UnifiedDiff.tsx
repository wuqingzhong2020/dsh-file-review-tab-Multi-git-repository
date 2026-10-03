import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'
import type { ProducedFileDiff as DiffHunk } from '../change-types.ts'
import {
  buildUnifiedHunks,
  expandAllContextGap,
  expandContextGap,
  unifiedDiffText,
  unifiedVisibleBlocks,
  visibleHunkRows,
  type ContextExpansion,
  type UnifiedGap,
  type UnifiedLine,
} from './unified-diff-model.ts'
import css from './UnifiedDiff.module.css'
import {
  ReviewCommentLine,
  ReviewOutdatedComments,
  useReviewInteractions,
} from './ReviewComments.tsx'
import {
  commentFileKey,
  lineCommentAnchor,
  reviewDiffRevision,
  type ReviewCommentAnchor,
  type ReviewCommentTarget,
} from './review-comments.ts'
import { useDiffViewPreferences } from './DiffViewControls.tsx'
import { t } from './locales.ts'
import { useReviewLocale } from './use-review-locale.ts'
import { DiffCode } from './DiffCode.tsx'
import { diffLanguage, highlightDiff } from './diff-highlight.ts'
import {
  expandDiffGapSlice,
  indexDiff,
  nearestDiffChange,
  revealDiffLocation,
  stepDiffIndex,
  type DiffLocation,
} from './diff-navigation.ts'
import { searchDiff, type DiffSearchMatch, type DiffSearchSide } from './diff-search.ts'
import { rangeReference } from './review-reference.ts'
import { useDiffSelection } from './use-diff-selection.ts'
import { DiffReferenceMenu, DiffSearchControls, DiffToolbar } from './unified-diff-controls.tsx'
import { DiffBlock } from './unified-diff-block.tsx'

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

type DiffSide = 'old' | 'new'
type RenderedDiffSide = DiffSide | 'unified'

interface DiffFocus {
  readonly identity: string
  readonly location: DiffLocation
  readonly side: DiffSide
  /** Repeated navigation to the same row must still move the viewport. */
  readonly serial: number
}

interface ContextProgress {
  readonly revision: string
  readonly gaps: ReadonlyMap<string, ContextExpansion>
}

const DIFF_FONTS = {
  mono: 'ui-monospace, SFMono-Regular, Consolas, monospace',
  consolas: 'Consolas, monospace',
  cascadia: '"Cascadia Code", Consolas, monospace',
  jetbrains: '"JetBrains Mono", Consolas, monospace',
}

/** Two presentations share the original rows, context expansion, and anchors. */
export function UnifiedDiff({
  diffs,
  contextLines,
  labels,
  className,
  showCopyButton = true,
  showFileHeaders = true,
  reviewTarget,
  sourceKey,
}: UnifiedDiffProps) {
  useReviewLocale()
  const preferences = useDiffViewPreferences()
  const interactions = useReviewInteractions()
  const isSplit = preferences.layout === 'split'
  const hunks = useMemo(() => buildUnifiedHunks(diffs, contextLines), [contextLines, diffs])
  const revision = useMemo(() => reviewDiffRevision(diffs), [diffs])
  const identity = `${sourceKey ?? (reviewTarget ? commentFileKey(reviewTarget) : '')}:${revision}`
  const index = useMemo(() => indexDiff(hunks, contextLines), [hunks, contextLines])
  const container = useRef<HTMLDivElement>(null)
  const lineElements = useRef(new Map<string, HTMLDivElement>())
  const selection = useDiffSelection({
    diffs,
    identity,
    revision,
    index,
    reviewTarget,
    isSplit,
    editorPath: preferences.editorPath,
    interactions,
    container,
    lineElements,
  })
  const syntax = useMemo(() => highlightDiff(diffs, hunks), [diffs, hunks])
  const input = useRef<HTMLInputElement>(null)
  const searchButton = useRef<HTMLButtonElement>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [side, setSide] = useState<DiffSearchSide>('both')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const result = useMemo(
    () => searchDiff(index.lines, searchOpen ? query : '', { side, caseSensitive, wholeWord }),
    [index, searchOpen, query, side, caseSensitive, wholeWord],
  )
  const searchKey = JSON.stringify([identity, searchOpen, query, side, caseSensitive, wholeWord])
  const [selectedMatch, setSelectedMatch] = useState({ key: '', index: -1 })
  const matchIndex =
    selectedMatch.key === searchKey ? selectedMatch.index : result.matches.length ? 0 : -1
  const activeMatch = result.matches[matchIndex]
  const matchesByLine = useMemo(() => {
    const matches = new Map<string, DiffSearchMatch[]>()
    for (const match of result.matches) {
      const group = matches.get(match.location.id) ?? []
      group.push(match)
      matches.set(match.location.id, group)
    }
    return matches
  }, [result])
  const [selectedChange, setSelectedChange] = useState({ identity: '', index: -1 })
  const changeIndex = selectedChange.identity === identity ? selectedChange.index : -1
  const [focus, setFocus] = useState<DiffFocus | null>(null)
  const focused = useMemo(() => {
    if (focus?.identity !== identity) return null
    const row = hunks[focus.location.hunkIndex]?.lines[focus.location.lineIndex]
    const location = row ? index.byLine.get(row) : undefined
    return location ? { ...focus, location } : null
  }, [focus, identity, hunks, index])
  const [progress, setProgress] = useState<ContextProgress>(() => ({
    revision: identity,
    gaps: new Map(),
  }))
  const expansions = useMemo(() => {
    const base =
      progress.revision === identity ? progress.gaps : new Map<string, ContextExpansion>()
    return focused ? revealDiffLocation(hunks, base, focused.location) : base
  }, [progress, identity, hunks, focused])
  const locate = useCallback(
    (location: DiffLocation, targetSide: DiffSide) => {
      setSelectedChange({ identity, index: nearestDiffChange(index.changes, location) })
      setFocus(current => ({
        identity,
        location,
        side: targetSide,
        serial: (current?.serial ?? 0) + 1,
      }))
    },
    [identity, index],
  )
  const lastSearchKey = useRef('')
  useEffect(() => {
    if (lastSearchKey.current === searchKey) return
    lastSearchKey.current = searchKey
    setSelectedMatch({ key: searchKey, index: result.matches.length ? 0 : -1 })
    const first = result.matches[0]
    if (first) locate(first.location, first.side)
    else setFocus(null)
  }, [searchKey, result, locate])
  useEffect(() => {
    if (searchOpen) input.current?.focus()
  }, [searchOpen])
  useEffect(() => {
    if (!focused) return
    const target = lineElements.current.get(
      `${focused.location.id}:${isSplit ? focused.side : 'unified'}`,
    )
    target?.scrollIntoView({ block: 'center', inline: 'nearest' })
  }, [focused, isSplit])
  const moveMatch = (direction: 1 | -1) => {
    const next = stepDiffIndex(matchIndex, direction, result.matches.length)
    const match = result.matches[next]
    if (!match) return
    setSelectedMatch({ key: searchKey, index: next })
    locate(match.location, match.side)
  }
  const moveChange = (direction: 1 | -1) => {
    const next = stepDiffIndex(changeIndex, direction, index.changes.length)
    const change = index.changes[next]
    if (change) locate(change.first, change.first.line.newNumber === null ? 'old' : 'new')
  }
  const closeSearch = () => {
    setSearchOpen(false)
    setFocus(null)
    searchButton.current?.focus()
  }
  const selectChange = (number: number) => {
    const change = index.changes[number]
    if (change) locate(change.first, change.first.line.newNumber === null ? 'old' : 'new')
  }
  const collapseAllContext = () => {
    setFocus(null)
    setProgress({ revision: identity, gaps: new Map() })
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.nativeEvent.isComposing) return
    if (event.target instanceof Element && event.target.closest('[role="menu"]')) return
    const editable =
      event.target instanceof Element &&
      event.target.closest('input, textarea, select, [contenteditable="true"]')
    if (editable && event.target !== input.current) return
    const contextMenuShortcut =
      event.key === 'ContextMenu' ||
      (event.key === 'F10' && event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey)
    if (!editable && contextMenuShortcut) {
      if (selection.showKeyboardMenu(event.target)) event.preventDefault()
      return
    }
    const shortcut = preferences.searchShortcut
    const searchShortcut =
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === 'f' &&
      event.altKey === shortcut.includes('alt') &&
      event.shiftKey === shortcut.includes('shift')
    const matchShortcut =
      searchOpen &&
      (event.key === 'F3' || (event.target === input.current && event.key === 'Enter'))
    const changeModifier =
      preferences.changeShortcut === 'mod+arrow'
        ? (event.ctrlKey || event.metaKey) && !event.altKey
        : event.altKey && !event.ctrlKey && !event.metaKey
    const changeShortcut =
      !editable &&
      !event.shiftKey &&
      changeModifier &&
      (event.key === 'ArrowDown' || event.key === 'ArrowUp')
    if (searchShortcut) {
      event.preventDefault()
      setSearchOpen(true)
      input.current?.focus()
      input.current?.select()
    } else if (matchShortcut) {
      event.preventDefault()
      moveMatch(event.shiftKey ? -1 : 1)
    } else if (searchOpen && event.key === 'Escape') {
      event.preventDefault()
      closeSearch()
    } else if (changeShortcut) {
      event.preventDefault()
      moveChange(event.key === 'ArrowDown' ? 1 : -1)
    }
  }
  const [copied, setCopied] = useState(false)
  const expand = (gap: UnifiedGap, direction?: 'up' | 'down') => {
    const originId = gap.originId ?? gap.id
    setProgress(current => {
      const gaps = new Map(current.revision === identity ? current.gaps : [])
      // The control holds remaining lines; its id addresses the full gap.
      const original = hunks
        .flatMap(hunk => hunk.rows)
        .find((row): row is UnifiedGap => row.kind === 'gap' && row.id === originId)
      const previous = expansions.get(originId)
      if (original) {
        let next: ContextExpansion
        if (previous?.revealed?.length) {
          // Search may expose the middle of a gap; expand only this remaining slice.
          const count = direction ? gap.lines.length : preferences.contextExpansionLines
          next = expandDiffGapSlice(gap, previous, count, direction)
        } else if (direction) {
          next = expandAllContextGap(original, direction, gaps.get(originId))
        } else {
          next = expandContextGap(original, gaps.get(originId), preferences.contextExpansionLines)
        }
        gaps.set(originId, next)
      }
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
    void navigator.clipboard
      ?.writeText(unifiedDiffText(diffs))
      .then(() => {
        setCopied(true)
        window.setTimeout(() => {
          setCopied(false)
        }, 1000)
      })
      .catch(() => {})
  }, [copied, diffs])
  const rowAnchor = (row: UnifiedLine, lines: readonly UnifiedLine[], side: DiffSide = 'new') => {
    if (!reviewTarget) return undefined
    const hunkIndex = index.byLine.get(row)!.hunkIndex
    return {
      ...lineCommentAnchor(reviewTarget, row, lines, revision, side),
      sourceKey: `${identity}:hunk:${hunkIndex}`,
    }
  }
  const numberButton = (row: UnifiedLine, side: DiffSide) => {
    const number = side === 'old' ? row.oldNumber : row.newNumber
    if (!reviewTarget) return number
    if (number === null) return null
    return (
      <button
        type="button"
        className={css.lineSelect}
        data-reference-number-side={side}
        aria-haspopup="menu"
        title={t('referenceHint')}
        aria-label={`${t('referenceSelect')} · ${t(side === 'old' ? 'commentOldLine' : 'commentNewLine', { line: number })}`}
        onClick={event => {
          event.stopPropagation()
          selection.selectLine(row, side, event.shiftKey)
        }}
      >
        {number}
      </button>
    )
  }
  const currentAnchor = (anchor: ReviewCommentAnchor, line: number): ReviewCommentAnchor | null => {
    if (!reviewTarget) return null
    const endLine = line + (anchor.endLine ?? anchor.line ?? line) - (anchor.line ?? line)
    const candidates = index.lines.filter(item => item.line.newNumber === line)
    const ranges = candidates
      .map(start => {
        const end = index.lines.find(
          item => item.hunkIndex === start.hunkIndex && item.line.newNumber === endLine,
        )
        return end
          ? rangeReference(
              reviewTarget,
              index.lines,
              start,
              end,
              'new',
              revision,
              `${identity}:hunk:${start.hunkIndex}`,
            )
          : null
      })
      .filter(
        item =>
          item?.quote === anchor.quote &&
          item.before === anchor.before &&
          item.after === anchor.after,
      )
    return ranges.length === 1 ? ranges[0]! : null
  }
  if (!diffs.length) return null

  const maxNumber = hunks.reduce(
    (max, hunk) =>
      hunk.lines.reduce(
        (current, line) => Math.max(current, line.oldNumber ?? 0, line.newNumber ?? 0),
        max,
      ),
    1,
  )
  const style = {
    '--diff-number-width': `${Math.max(4, String(maxNumber).length)}ch`,
    '--diff-font': DIFF_FONTS[preferences.fontFamily],
    '--diff-font-size': `${preferences.fontSize}px`,
    '--diff-row-height': `${preferences.fontSize * preferences.lineHeight}px`,
    '--diff-tab-size': preferences.tabSize,
    '--diff-add-strength': `${preferences.colorStrength}%`,
    '--diff-del-strength': `${preferences.colorStrength}%`,
    ...(preferences.colors === 'blue-orange'
      ? { '--diff-add': '#0969da', '--diff-del': '#bc4c00' }
      : {}),
  } as CSSProperties
  const totals = new Map<string, { added: number; removed: number }>()
  diffs.forEach((diff, index) => {
    const total = totals.get(diff.path) ?? { added: 0, removed: 0 }
    totals.set(diff.path, {
      added: total.added + (hunks[index]?.added ?? 0),
      removed: total.removed + (hunks[index]?.removed ?? 0),
    })
  })
  const lineProps = (row: UnifiedLine, targetSide: RenderedDiffSide) => {
    const location = index.byLine.get(row)!
    const key = `${location.id}:${targetSide}`
    return {
      ref: (element: HTMLDivElement | null) => {
        if (element) lineElements.current.set(key, element)
        else lineElements.current.delete(key)
      },
      'data-diff-line-id': location.id,
      'data-navigation-target': focused?.location.id === location.id ? '' : undefined,
      'data-reference-side':
        targetSide === 'unified' ? (row.kind === 'del' ? 'old' : 'new') : targetSide,
      'data-reference-selected': selection.rowSelected(row, targetSide) ? '' : undefined,
    }
  }
  const code = (row: UnifiedLine, targetSide: RenderedDiffSide) => {
    const location = index.byLine.get(row)!
    const actualSide =
      targetSide === 'unified' ? (row.newNumber === null ? 'old' : 'new') : targetSide
    const tokens = syntax.get(row)?.[actualSide === 'old' ? 'old' : 'next']
    const matches = matchesByLine
      .get(location.id)
      ?.filter(match => targetSide === 'unified' || match.side === targetSide)
    return <DiffCode text={row.text} tokens={tokens} matches={matches} active={activeMatch?.id} />
  }
  const renderLine = (row: UnifiedLine, key: string, lines: readonly UnifiedLine[]) => (
    <ReviewCommentLine
      key={key}
      anchor={rowAnchor(row, lines)}
      alternateAnchor={row.kind === 'context' ? rowAnchor(row, lines, 'old') : undefined}
    >
      {button => (
        <div
          {...lineProps(row, 'unified')}
          className={`${css.unifiedLine} ${css[`unified_${row.kind}`] ?? ''}`}
          data-line-kind={row.kind}
          data-old-line={row.oldNumber ?? undefined}
          data-new-line={row.newNumber ?? undefined}
        >
          <span className={`${css.unifiedLineNumber} ${css.unifiedOldNumber}`}>
            {button}
            {numberButton(row, 'old')}
          </span>
          <span className={css.unifiedLineNumber}>{numberButton(row, 'new')}</span>
          <span className={css.unifiedSign}>
            {row.kind === 'del' ? '-' : row.kind === 'add' ? '+' : ' '}
          </span>
          <span className={css.unifiedText} data-diff-code="">
            {code(row, 'unified')}
          </span>
        </div>
      )}
    </ReviewCommentLine>
  )
  const renderSplitCell = (
    row: UnifiedLine | null,
    side: DiffSide,
    key: number,
    lines: readonly UnifiedLine[],
  ) => (
    <div
      key={`${side}:${key}`}
      className={`${css.splitCell} ${row ? (css[`unified_${row.kind}`] ?? '') : css.splitMissing}`}
    >
      {row && (
        <ReviewCommentLine anchor={rowAnchor(row, lines, side)}>
          {button => (
            <div
              {...lineProps(row, side)}
              className={`${css.splitLine} ${css[`unified_${row.kind}`] ?? ''}`}
              data-line-kind={row.kind}
              data-diff-side={side}
              data-old-line={side === 'old' ? (row.oldNumber ?? undefined) : undefined}
              data-new-line={side === 'new' ? (row.newNumber ?? undefined) : undefined}
            >
              <span className={`${css.unifiedLineNumber} ${css.unifiedOldNumber}`}>
                {button}
                {numberButton(row, side)}
              </span>
              <span className={css.unifiedSign}>
                {row.kind === 'del' ? '-' : row.kind === 'add' ? '+' : ' '}
              </span>
              <span className={css.unifiedText} data-diff-code="">
                {code(row, side)}
              </span>
            </div>
          )}
        </ReviewCommentLine>
      )}
    </div>
  )
  let previousPath: string | undefined
  return (
    <div
      ref={container}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseUp={event => {
        const insideMenu = event.target instanceof Element && event.target.closest('[role="menu"]')
        if (event.button === 0 && !insideMenu) selection.selectedByDrag()
      }}
      onContextMenu={event => {
        const clicked = selection.contextRow(event.target)
        if (
          clicked &&
          selection.showMenu(
            clicked.location,
            clicked.side,
            clicked.row,
            event.clientX,
            event.clientY,
          )
        )
          event.preventDefault()
      }}
      className={`${css.unifiedBlock} ${showFileHeaders ? '' : css.unifiedEmbedded} ${reviewTarget ? css.commentEnabled : ''} ${preferences.wrap ? css.wrapLines : ''} ${className ?? ''}`}
      style={style}
      data-diff=""
      data-diff-layout={preferences.layout}
      data-diff-wrap={preferences.wrap}
    >
      <DiffToolbar
        preferences={preferences}
        labels={labels}
        searchButton={searchButton}
        searchOpen={searchOpen}
        toggleSearch={() => {
          if (searchOpen) closeSearch()
          else setSearchOpen(true)
        }}
        changes={index.changes}
        changeIndex={changeIndex}
        moveChange={moveChange}
        selectChange={selectChange}
        path={diffs[0]!.path}
        contextExpanded={expansions.size > 0}
        collapseContext={collapseAllContext}
        showCopyButton={showCopyButton}
        copied={copied}
        copyDiff={onCopy}
      />
      {searchOpen && (
        <DiffSearchControls
          input={input}
          query={query}
          setQuery={setQuery}
          side={side}
          setSide={setSide}
          caseSensitive={caseSensitive}
          toggleCase={() => setCaseSensitive(!caseSensitive)}
          wholeWord={wholeWord}
          toggleWholeWord={() => setWholeWord(!wholeWord)}
          matches={result.matches}
          truncated={result.truncated}
          matchIndex={matchIndex}
          activeMatch={activeMatch}
          moveMatch={moveMatch}
          closeSearch={closeSearch}
        />
      )}
      <DiffReferenceMenu
        selection={selection}
        commentEnabled={interactions !== null}
        commentsBusy={interactions?.snapshot.busy ?? false}
      />
      {diffs.map((diff, hunkIndex) => {
        const firstForPath = diff.path !== previousPath
        previousPath = diff.path
        const hunk = hunks[hunkIndex]!
        const total = totals.get(diff.path)!
        const visibleRows = visibleHunkRows(hunk, expansions, true)
        const blocks = unifiedVisibleBlocks(visibleRows)
        const hiddenCounts = new Map<string, number>()
        for (const row of visibleRows) {
          if (row.kind !== 'gap') continue
          const key = row.originId ?? row.id
          hiddenCounts.set(key, (hiddenCounts.get(key) ?? 0) + row.lines.length)
        }
        const expandedCounts = new Map<string, number>()
        for (const row of hunk.rows) {
          if (row.kind === 'gap')
            expandedCounts.set(row.id, row.lines.length - (hiddenCounts.get(row.id) ?? 0))
        }
        return (
          <section
            key={`${diff.path}:${hunkIndex}`}
            className={css.unifiedFile}
            data-syntax-language={diffLanguage(diff.path)}
          >
            {showFileHeaders && firstForPath && (
              <header className={css.unifiedHeader}>
                <span className={css.unifiedStatus}>M</span>
                <span className={css.unifiedPath}>{diff.path}</span>
                <span className={css.unifiedAdded}>+{total.added}</span>
                <span className={css.unifiedRemoved}>-{total.removed}</span>
              </header>
            )}
            {hunk.unchangedBefore > 0 && (
              <div
                className={css.unifiedUnavailable}
                title={labels.unavailableContext(hunk.unchangedBefore)}
              >
                {labels.unavailableContext(hunk.unchangedBefore)}
              </div>
            )}
            {isSplit && (
              <div className={css.splitLegend}>
                <span>{t('diffOld')}</span>
                <span>{t('diffNew')}</span>
              </div>
            )}
            <div className={`${css.unifiedBody} ${isSplit ? css.splitBody : ''}`}>
              {blocks.map((block, blockIndex) => {
                const originalId = block.gap?.originId ?? block.gap?.id
                const expandedLines = originalId ? (expandedCounts.get(originalId) ?? 0) : 0
                return (
                  <DiffBlock
                    key={block.gap?.id ?? `block:${blockIndex}`}
                    diff={diff}
                    block={block}
                    blockIndex={blockIndex}
                    hunkIndex={hunkIndex}
                    hunkLines={hunk.lines}
                    identity={identity}
                    index={index}
                    preferences={preferences}
                    labels={labels}
                    expandedLines={expandedLines}
                    focused={focused}
                    commentAnchor={
                      interactions?.composer?.placement === 'inline'
                        ? interactions.composer.anchor
                        : undefined
                    }
                    expand={expand}
                    collapse={collapseGap}
                    renderLine={renderLine}
                    renderSplitCell={renderSplitCell}
                  />
                )
              })}
            </div>
          </section>
        )
      })}
      <ReviewOutdatedComments
        target={reviewTarget}
        revision={revision}
        currentAnchor={currentAnchor}
      />
    </div>
  )
}
