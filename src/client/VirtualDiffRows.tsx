import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { rowOffsets, virtualRange } from './virtual-diff-model.ts'
import css from './VirtualDiffRows.module.css'
import { t } from './locales.ts'

/** Variable-height rows include wrapping and complete comment threads. Both split cells are one measured row. */
export function VirtualDiffRows({ count, enabled, estimate, identity, render, focusIndex = -1, focusVersion = 0, keepIndices = [] }: {
  count: number; enabled: boolean; estimate: number; identity: string; render: (index: number) => ReactNode; focusIndex?: number; focusVersion?: number; keepIndices?: readonly number[]
}) {
  const viewport = useRef<HTMLDivElement>(null)
  const measurements = useRef(new Map<number, number>())
  const [version, setVersion] = useState(0)
  const [scroll, setScroll] = useState({ top: 0, height: 600 })
  const virtual = enabled && count > 400
  useLayoutEffect(() => { measurements.current.clear(); setVersion(value => value + 1) }, [identity, estimate])
  const offsets = useMemo(() => rowOffsets(count, estimate, measurements.current), [count, estimate, identity, version])
  const { start, end } = virtualRange(offsets, scroll.top, scroll.height)
  const indices = virtual ? [...new Set([...Array.from({ length: end - start }, (_, index) => start + index), ...keepIndices.filter(index => index >= 0 && index < count)])].sort((a, b) => a - b) : []
  const indexKey = indices.join(',')
  useLayoutEffect(() => {
    const element = viewport.current
    if (!virtual || !element || typeof ResizeObserver === 'undefined') return
    let scheduled = 0, pendingAdjustment = 0
    const observer = new ResizeObserver(entries => {
      let changed = false, adjustment = 0
      for (const entry of entries) {
        const row = Number((entry.target as HTMLElement).dataset.virtualRow)
        if (!Number.isSafeInteger(row)) continue
        const height = entry.target.getBoundingClientRect().height
        const previous = measurements.current.get(row) ?? estimate
        if (height > 0 && Math.abs(height - previous) > .5) {
          measurements.current.set(row, height); changed = true
          if (row < start) adjustment += height - previous
        }
      }
      pendingAdjustment += adjustment
      if (changed && !scheduled) scheduled = requestAnimationFrame(() => {
        scheduled = 0; element.scrollTop += pendingAdjustment; pendingAdjustment = 0
        setVersion(value => value + 1); setScroll({ top: element.scrollTop, height: element.clientHeight })
      })
    })
    for (const row of element.querySelectorAll<HTMLElement>('[data-virtual-row]')) observer.observe(row)
    const resize = new ResizeObserver(() => setScroll({ top: element.scrollTop, height: element.clientHeight })); resize.observe(element)
    return () => { observer.disconnect(); resize.disconnect(); if (scheduled) cancelAnimationFrame(scheduled) }
  }, [virtual, indexKey, identity, estimate, start])
  useEffect(() => {
    if (!virtual || focusIndex < 0 || focusIndex >= count || !viewport.current) return
    const element = viewport.current
    element.scrollTop = Math.max(0, offsets[focusIndex]! - element.clientHeight / 2)
    setScroll({ top: element.scrollTop, height: element.clientHeight })
    // Measurements must not repeatedly pull the user back after manual scrolling.
  }, [focusIndex, focusVersion, identity, virtual])
  useEffect(() => {
    if (virtual && focusIndex >= start && focusIndex < end) viewport.current?.querySelector<HTMLElement>('[data-navigation-target]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [indexKey, focusIndex, virtual])
  if (!virtual) return <>{Array.from({ length: count }, (_, index) => render(index))}</>
  const children: ReactNode[] = []
  let previous = 0
  for (const index of indices) {
    if (index > previous) children.push(<div key={`space:${previous}`} className={css.spacer} style={{ height: offsets[index]! - offsets[previous]! }} aria-hidden="true" />)
    children.push(<div key={index} data-virtual-row={index}>{render(index)}</div>); previous = index + 1
  }
  if (previous < count) children.push(<div key="space:end" className={css.spacer} style={{ height: offsets[count]! - offsets[previous]! }} aria-hidden="true" />)
  return <div ref={viewport} className={css.viewport} tabIndex={0} role="region" aria-label={t('diffVirtualize')} data-virtual-diff="" data-total-rows={count} onScroll={event => {
    const element = event.currentTarget; setScroll({ top: element.scrollTop, height: element.clientHeight })
  }}>{children}</div>
}
