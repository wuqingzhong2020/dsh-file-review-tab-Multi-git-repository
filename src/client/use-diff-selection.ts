import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import type { ProducedFileDiff } from '../change-types.ts'
import type { ReviewLocationResult } from '../review-location.ts'
import type { useReviewInteractions } from './ReviewComments.tsx'
import type { DiffIndex, DiffLocation } from './diff-navigation.ts'
import type { CopyKey } from './locales.ts'
import { contextSelection, type DiffReferenceSelection } from './review-context-selection.ts'
import type { ReviewCommentTarget } from './review-comments.ts'
import { formatReviewReference, rangeReference } from './review-reference.ts'
import { referenceRequest, reviewLocation } from './review-file-opener.ts'
import { useReviewFileOpener } from './review-navigation.tsx'
import type { UnifiedLine } from './unified-diff-model.ts'

type ReferenceSide = 'old' | 'new'

interface DiffSelectionOptions {
  readonly diffs: readonly ProducedFileDiff[]
  readonly identity: string
  readonly revision: string
  readonly index: DiffIndex
  readonly reviewTarget: ReviewCommentTarget | undefined
  readonly isSplit: boolean
  readonly editorPath: string
  readonly interactions: ReturnType<typeof useReviewInteractions>
  readonly container: RefObject<HTMLDivElement>
  readonly lineElements: RefObject<Map<string, HTMLDivElement>>
}

/** Own one file's reference, menu focus and asynchronous editor feedback. */
export function useDiffSelection({
  diffs,
  identity,
  revision,
  index,
  reviewTarget,
  isSplit,
  editorPath,
  interactions,
  container,
  lineElements,
}: DiffSelectionOptions) {
  const openFile = useReviewFileOpener()
  const [selection, setSelection] = useState<DiffReferenceSelection | null>(null)
  const selected = selection?.identity === identity ? selection : null
  const reference = useMemo(() => {
    if (!selected || !reviewTarget) return null
    return rangeReference(
      reviewTarget,
      index.lines,
      selected.start,
      selected.end,
      selected.side,
      revision,
      `${identity}:hunk:${selected.start.hunkIndex}`,
    )
  }, [selected, reviewTarget, index, revision, identity])

  const [referenceNotice, setReferenceNotice] = useState<CopyKey | null>(null)
  const [editorResult, setEditorResult] = useState<ReviewLocationResult | null>(null)
  const [editorBusy, setEditorBusy] = useState(false)
  const [menuPoint, setMenuPoint] = useState<{ x: number; y: number } | null>(null)
  const menuOrigin = useRef<HTMLElement | null>(null)
  const menuOwner = useRef<HTMLDivElement>(null)

  const referenceKey = reference
    ? JSON.stringify([
        identity,
        reference.side,
        reference.line,
        reference.endLine,
        reference.sourceKey,
      ])
    : ''
  const latestReferenceKey = useRef(referenceKey)
  latestReferenceKey.current = referenceKey
  const latestIdentity = useRef(identity)
  latestIdentity.current = identity

  const clearFeedback = () => {
    setReferenceNotice(null)
    setEditorResult(null)
  }
  const invalidateSelection = () => {
    setSelection(null)
    setReferenceNotice('referenceInvalid')
    setEditorResult(null)
  }

  useEffect(() => {
    setSelection(null)
    setReferenceNotice(null)
    setEditorResult(null)
    setMenuPoint(null)
  }, [identity])
  useEffect(() => {
    setMenuPoint(null)
  }, [isSplit])

  const closeMenu = useCallback(() => {
    const active = document.activeElement
    const menuHasFocus = active instanceof Element && menuOwner.current?.contains(active)
    setMenuPoint(null)
    if (!menuHasFocus) return
    queueMicrotask(() => {
      if (document.activeElement === document.body || document.activeElement === active) {
        menuOrigin.current?.focus({ preventScroll: true })
      }
    })
  }, [])

  useEffect(() => {
    if (!menuPoint) return
    // Wait for the native right-button focus without scrolling the file.
    const frame = requestAnimationFrame(() => {
      menuOwner.current
        ?.querySelector<HTMLButtonElement>('button:not(:disabled)')
        ?.focus({ preventScroll: true })
    })
    const dismiss = (event: Event) => {
      // The menu may scroll long feedback; scrolling the diff closes it.
      const scrollingMenu =
        event.type === 'scroll' &&
        event.target instanceof Element &&
        menuOwner.current &&
        event.target.closest('[role="menu"]')?.contains(menuOwner.current)
      if (!scrollingMenu) closeMenu()
    }
    window.addEventListener('scroll', dismiss, true)
    window.addEventListener('resize', dismiss)
    window.addEventListener('blur', dismiss)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', dismiss, true)
      window.removeEventListener('resize', dismiss)
      window.removeEventListener('blur', dismiss)
    }
  }, [menuPoint, closeMenu])

  const contextRow = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return null
    if (
      target.closest(
        'input, textarea, select, [contenteditable="true"], button:not([data-reference-number-side])',
      )
    )
      return null
    const row = target.closest<HTMLElement>('[data-diff-line-id]')
    if (!row || row.closest('[data-diff]') !== container.current) return null
    const location = index.lines.find(item => item.id === row.dataset.diffLineId)
    const side =
      target.closest<HTMLElement>('[data-reference-number-side]')?.dataset.referenceNumberSide ??
      row.dataset.referenceSide
    return location && (side === 'old' || side === 'new')
      ? { row, location, side: side as ReferenceSide }
      : null
  }

  const showMenu = (
    location: DiffLocation,
    side: ReferenceSide,
    row: HTMLElement,
    x: number,
    y: number,
  ) => {
    if (!reviewTarget) return false
    const next = contextSelection(selected, identity, location, side)
    if (!rangeReference(reviewTarget, index.lines, next.start, next.end, side, revision, identity))
      return false
    menuOrigin.current =
      row.querySelector<HTMLElement>(`[data-reference-number-side="${side}"]`) ?? container.current
    setSelection(next)
    clearFeedback()
    setMenuPoint({ x, y })
    return true
  }

  const showKeyboardMenu = (target: EventTarget | null) => {
    const clicked = contextRow(target)
    const location = clicked?.location ?? selected?.end
    const side = clicked?.side ?? selected?.side
    const row =
      clicked?.row ??
      (location
        ? lineElements.current?.get(`${location.id}:${isSplit ? side : 'unified'}`)
        : undefined)
    if (!location || !side || !row) return false
    const rect = row.getBoundingClientRect()
    const x = Math.max(12, rect.left + 40)
    const y = Math.min(window.innerHeight - 12, Math.max(12, rect.bottom))
    return showMenu(location, side, row, x, y)
  }

  const selectLine = (row: UnifiedLine, side: ReferenceSide, extend: boolean) => {
    setMenuPoint(null)
    const location = index.byLine.get(row)!
    if (extend && selected && selected.side !== side) {
      invalidateSelection()
      return
    }
    const start = extend && selected?.side === side ? selected.start : location
    if (
      !reviewTarget ||
      !rangeReference(reviewTarget, index.lines, start, location, side, revision, identity)
    ) {
      invalidateSelection()
      return
    }
    setSelection({ identity, start, end: location, side })
    clearFeedback()
  }

  const selectedByDrag = () => {
    const native = window.getSelection()
    if (!native || native.isCollapsed) return
    const selectedCell = (node: Node | null) => {
      const element = node instanceof Element ? node : node?.parentElement
      if (!element?.closest('[data-diff-code]')) return null
      const row = element.closest<HTMLElement>('[data-diff-line-id]')
      return row?.closest('[data-diff]') === container.current ? row : null
    }
    const from = selectedCell(native.anchorNode)
    const to = selectedCell(native.focusNode)
    if (!from || !to) return
    const start = index.lines.find(item => item.id === from.dataset.diffLineId)
    const end = index.lines.find(item => item.id === to.dataset.diffLineId)
    const side = from.dataset.referenceSide as ReferenceSide
    const crossesOtherSide =
      !isSplit &&
      start &&
      end &&
      index.lines.some(item => {
        const withinSelection =
          item.hunkIndex === start.hunkIndex &&
          item.lineIndex >= Math.min(start.lineIndex, end.lineIndex) &&
          item.lineIndex <= Math.max(start.lineIndex, end.lineIndex)
        const absentOnSide =
          side === 'new' ? item.line.newNumber === null : item.line.oldNumber === null
        return withinSelection && absentOnSide
      })
    if (
      !reviewTarget ||
      !start ||
      !end ||
      crossesOtherSide ||
      side !== to.dataset.referenceSide ||
      !rangeReference(reviewTarget, index.lines, start, end, side, revision, identity)
    ) {
      invalidateSelection()
      return
    }
    setSelection({ identity, start, end, side })
    clearFeedback()
    setMenuPoint(null)
  }

  const openSelection = async (allowRelocate = false) => {
    if (!reference || !interactions || editorBusy) return
    if (reference.side !== 'new') {
      setEditorResult({ state: 'unsupported', reason: 'old' })
      return
    }
    setEditorBusy(true)
    const requestedIdentity = identity
    const requestedReference = referenceKey
    const selectedDiff = diffs[selected!.start.hunkIndex]
    const fullText = selectedDiff?.newStart === 1 ? selectedDiff.newText : undefined
    const isCurrentRequest = () =>
      requestedIdentity === latestIdentity.current &&
      requestedReference === latestReferenceKey.current
    try {
      const result = await reviewLocation(interactions.ctx, interactions.sessionId, {
        ...referenceRequest(reference, editorPath, fullText),
        allowRelocate,
      })
      if (isCurrentRequest()) setEditorResult(result)
    } catch {
      if (isCurrentRequest()) setEditorResult({ state: 'error' })
    } finally {
      setEditorBusy(false)
    }
  }

  const copyReference = async (pathOnly: boolean) => {
    if (!reference) return
    const requestedReference = referenceKey
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable')
      const text = pathOnly
        ? `${reference.absolutePath}:${reference.line}-${reference.endLine} (${reference.side})`
        : formatReviewReference(reference)
      await navigator.clipboard.writeText(text)
      if (requestedReference === latestReferenceKey.current) setReferenceNotice('referenceCopied')
    } catch {
      if (requestedReference === latestReferenceKey.current)
        setReferenceNotice('referenceCopyFailed')
    }
  }

  const clearSelection = () => {
    closeMenu()
    setSelection(null)
    clearFeedback()
    window.getSelection()?.removeAllRanges()
  }
  const commentSelection = () => {
    if (!reference || !interactions) return
    setMenuPoint(null)
    interactions.start(reference, 'inline')
  }
  const openInternalFile = () => {
    if (!reference || !interactions) return
    try { openFile(reference.absolutePath); closeMenu() }
    catch { setEditorResult({ state: 'error' }) }
  }
  const rowSelected = (row: UnifiedLine, targetSide: ReferenceSide | 'unified') => {
    if (!reference) return false
    const location = index.byLine.get(row)!
    const number = reference.side === 'old' ? row.oldNumber : row.newNumber
    return (
      selected?.start.hunkIndex === location.hunkIndex &&
      number !== null &&
      number >= reference.line! &&
      number <= reference.endLine &&
      (targetSide === 'unified' || targetSide === reference.side)
    )
  }

  return {
    reference,
    referenceNotice,
    editorResult,
    editorBusy,
    menuPoint,
    menuOwner,
    closeMenu,
    contextRow,
    showMenu,
    showKeyboardMenu,
    selectLine,
    selectedByDrag,
    openSelection,
    copyReference,
    clearSelection,
    commentSelection,
    openInternalFile,
    rowSelected,
  }
}

export type DiffSelectionController = ReturnType<typeof useDiffSelection>
