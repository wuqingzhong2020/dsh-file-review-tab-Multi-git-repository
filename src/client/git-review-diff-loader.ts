/** Deduplicate queued/in-flight diffs and bound a bulk expansion to four requests. */
export async function loadMissingReviewDiffs<T>(
  files: readonly T[],
  keyOf: (file: T) => string,
  requested: Set<string>,
  load: (file: T) => Promise<void>,
): Promise<void> {
  const pending = files.filter(file => {
    const key = keyOf(file)
    if (requested.has(key)) return false
    requested.add(key)
    return true
  })
  let cursor = 0
  await Promise.all(Array.from({ length: Math.min(4, pending.length) }, async () => {
    while (cursor < pending.length) {
      const file = pending[cursor++]!
      await load(file)
    }
  }))
}
