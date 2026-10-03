export function rowOffsets(count: number, estimate: number, measured: ReadonlyMap<number, number>): number[] {
  const offsets = [0]
  for (let index = 0; index < count; index++) offsets.push(offsets[index]! + Math.max(1, measured.get(index) ?? estimate))
  return offsets
}
export function virtualRange(offsets: readonly number[], top: number, height: number, overscan = 250): { start: number; end: number } {
  const count = Math.max(0, offsets.length - 1)
  const at = (value: number) => {
    let low = 0, high = count
    while (low < high) { const middle = (low + high) >>> 1; if (offsets[middle + 1]! < value) low = middle + 1; else high = middle }
    return low
  }
  return { start: Math.min(count, at(Math.max(0, top - overscan))), end: Math.min(count, at(top + height + overscan) + 1) }
}
