import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { rowOffsets, virtualRange } from './virtual-diff-model.ts'
import css from './VirtualDiffRows.module.css'
import { t } from './locales.ts'

const VIRTUAL_ROW_THRESHOLD = 400

interface VirtualDiffRowsProps {
  readonly count: number
  readonly enabled: boolean
  readonly estimate: number
  readonly identity: string
  readonly render: (index: number) => ReactNode
  readonly focusIndex?: number
  readonly focusVersion?: number
  readonly keepIndices?: readonly number[]
}

interface ViewportScroll {
  readonly top: number
  readonly height: number
}

function visibleRowIndices(
  start: number,
  end: number,
  count: number,
  keepIndices: readonly number[],
): number[] {
  const visible = Array.from({ length: end - start }, (_, index) => start + index)
  const pinned = keepIndices.filter(index => index >= 0 && index < count)
  return [...new Set([...visible, ...pinned])].sort((first, second) => first - second)
}

function viewportScroll(element: HTMLDivElement): ViewportScroll {
  return { top: element.scrollTop, height: element.clientHeight }
}

/** Variable-height rows include wrapping and complete comment threads. Both split cells are one measured row. */
export function VirtualDiffRows({
  count,
  enabled,
  estimate,
  identity,
  render,
  focusIndex = -1,
  focusVersion = 0,
  keepIndices = [],
}: VirtualDiffRowsProps) {
  const viewport = useRef<HTMLDivElement>(null)
  const measurements = useRef(new Map<number, number>())
  const [version, setVersion] = useState(0)
  const [scroll, setScroll] = useState<ViewportScroll>({ top: 0, height: 600 })
  const virtual = enabled && count > VIRTUAL_ROW_THRESHOLD
  useLayoutEffect(() => {
    measurements.current.clear()
    setVersion(value => value + 1)
  }, [identity, estimate])
  const offsets = useMemo(
    () => rowOffsets(count, estimate, measurements.current),
    [count, estimate, identity, version],
  )
  const { start, end } = virtualRange(offsets, scroll.top, scroll.height)
  const indices = virtual ? visibleRowIndices(start, end, count, keepIndices) : []
  const indexKey = indices.join(',')
  useLayoutEffect(() => {
    const element = viewport.current
    if (!virtual || !element || typeof ResizeObserver === 'undefined') return
    let scheduled = 0
    let pendingAdjustment = 0
    const updateMeasurements = () => {
      scheduled = 0
      // Preserve the viewport anchor when a pinned row above it changes height.
      element.scrollTop += pendingAdjustment
      pendingAdjustment = 0
      setVersion(value => value + 1)
      setScroll(viewportScroll(element))
    }
    const rowObserver = new ResizeObserver(entries => {
      let changed = false
      let adjustment = 0
      for (const entry of entries) {
        const row = Number((entry.target as HTMLElement).dataset.virtualRow)
        if (!Number.isSafeInteger(row)) continue
        const height = entry.target.getBoundingClientRect().height
        const previous = measurements.current.get(row) ?? estimate
        if (height > 0 && Math.abs(height - previous) > 0.5) {
          measurements.current.set(row, height)
          changed = true
          if (row < start) adjustment += height - previous
        }
      }
      pendingAdjustment += adjustment
      if (changed && !scheduled) scheduled = requestAnimationFrame(updateMeasurements)
    })
    for (const row of element.querySelectorAll<HTMLElement>('[data-virtual-row]'))
      rowObserver.observe(row)
    const viewportObserver = new ResizeObserver(() => setScroll(viewportScroll(element)))
    viewportObserver.observe(element)
    return () => {
      rowObserver.disconnect()
      viewportObserver.disconnect()
      if (scheduled) cancelAnimationFrame(scheduled)
    }
  }, [virtual, indexKey, identity, estimate, start])
  useEffect(() => {
    if (!virtual || focusIndex < 0 || focusIndex >= count || !viewport.current) return
    const element = viewport.current
    element.scrollTop = Math.max(0, offsets[focusIndex]! - element.clientHeight / 2)
    setScroll(viewportScroll(element))
    // Measurements must not repeatedly pull the user back after manual scrolling.
  }, [focusIndex, focusVersion, identity, virtual])
  useEffect(() => {
    if (virtual && focusIndex >= start && focusIndex < end) {
      viewport.current
        ?.querySelector<HTMLElement>('[data-navigation-target]')
        ?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    }
  }, [indexKey, focusIndex, virtual])
  if (!virtual) return <>{Array.from({ length: count }, (_, index) => render(index))}</>

  const children: ReactNode[] = []
  let previousEnd = 0
  for (const index of indices) {
    if (index > previousEnd) {
      children.push(
        <div
          key={`space:${previousEnd}`}
          className={css.spacer}
          style={{ height: offsets[index]! - offsets[previousEnd]! }}
          aria-hidden="true"
        />,
      )
    }
    children.push(
      <div key={index} data-virtual-row={index}>
        {render(index)}
      </div>,
    )
    previousEnd = index + 1
  }
  if (previousEnd < count) {
    children.push(
      <div
        key="space:end"
        className={css.spacer}
        style={{ height: offsets[count]! - offsets[previousEnd]! }}
        aria-hidden="true"
      />,
    )
  }
  return (
    <div
      ref={viewport}
      className={css.viewport}
      tabIndex={0}
      role="region"
      aria-label={t('diffVirtualize')}
      data-virtual-diff=""
      data-total-rows={count}
      onScroll={event => setScroll(viewportScroll(event.currentTarget))}
    >
      {children}
    </div>
  )
}
