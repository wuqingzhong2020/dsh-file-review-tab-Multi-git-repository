import type { DiffLocation } from './diff-navigation.ts'

export interface DiffReferenceSelection {
  readonly identity: string
  readonly start: DiffLocation
  readonly end: DiffLocation
  readonly side: 'old' | 'new'
}

/** Right-clicking inside a range preserves it; other rows start a single-line reference. */
export function contextSelection(current: DiffReferenceSelection | null, identity: string, location: DiffLocation, side: 'old' | 'new'): DiffReferenceSelection {
  return current?.identity === identity && current.side === side && current.start.hunkIndex === location.hunkIndex
    && location.lineIndex >= Math.min(current.start.lineIndex, current.end.lineIndex)
    && location.lineIndex <= Math.max(current.start.lineIndex, current.end.lineIndex)
    ? current : { identity, start: location, end: location, side }
}
