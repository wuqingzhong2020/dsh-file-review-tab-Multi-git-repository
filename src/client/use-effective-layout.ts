import { useEffect, useState, type RefObject } from 'react'
import type { DiffLayout } from './diff-view-preferences.ts'

export function effectiveDiffLayout(preferred: DiffLayout, width: number, adaptive: boolean): DiffLayout {
  return adaptive && preferred === 'split' && width > 0 && width < 480 ? 'unified' : preferred
}
/** Hidden containers keep their last measured width; observers die with the diff. */
export function useEffectiveLayout(container: RefObject<HTMLElement>, preferred: DiffLayout, adaptive: boolean): DiffLayout {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const element = container.current
    if (!element || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(entries => {
      const measured = entries[0]?.contentRect.width ?? 0
      if (measured > 0) setWidth(measured)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [container])
  return effectiveDiffLayout(preferred, width, adaptive)
}
