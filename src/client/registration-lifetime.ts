type Disposer = () => void

/** Roll back partial registrations and release everything even if one disposer fails. */
export function registrationLifetime(report: (error: unknown) => void) {
  const disposers: Disposer[] = []
  let disposed = false
  const release = () => {
    if (disposed) return
    disposed = true
    for (const dispose of disposers.reverse()) {
      try { dispose() } catch (error) { report(error) }
    }
    disposers.length = 0
  }
  const register = (acquire: () => Disposer): Disposer => {
    if (disposed) return () => {}
    try {
      const dispose = acquire()
      if (disposed) dispose()
      else disposers.push(dispose)
      return dispose
    } catch (error) {
      release()
      report(error)
      return () => {}
    }
  }
  return { register, release }
}
