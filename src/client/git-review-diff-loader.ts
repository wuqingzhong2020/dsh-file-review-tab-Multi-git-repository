const REVIEW_DIFF_CONCURRENCY = 4

/** Deduplicate queued/in-flight diffs and bound a bulk expansion to four requests. */
export class ReviewDiffQueue<T> {
  private active = 0
  private readonly waiting: (() => void)[] = []
  private readonly requests = new Map<string, Promise<T>>()

  load(key: string, fetch: () => Promise<T>): Promise<T> {
    const existing = this.requests.get(key)
    if (existing) return existing
    const request = new Promise<T>((resolve, reject) => {
      const run = () => {
        this.active++
        void Promise.resolve()
          .then(fetch)
          .then(resolve, error => {
            // An aborted bulk copy must not poison a later file expansion.
            this.requests.delete(key)
            reject(error)
          })
          .finally(() => {
            this.active--
            this.waiting.shift()?.()
          })
      }
      if (this.active < REVIEW_DIFF_CONCURRENCY) run()
      else this.waiting.push(run)
    })
    this.requests.set(key, request)
    return request
  }
}

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
  let failed = false
  const run = async () => {
    while (!failed && cursor < pending.length) {
      try {
        await load(pending[cursor++]!)
      } catch (error) {
        // Active requests can finish, but a failed/cancelled report starts no more work.
        failed = true
        throw error
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(REVIEW_DIFF_CONCURRENCY, pending.length) }, run))
}
