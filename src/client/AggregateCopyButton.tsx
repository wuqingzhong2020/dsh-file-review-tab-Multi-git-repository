import { useEffect, useRef, useState } from 'react'
import { aggregateDiffText, type AggregateDiffFile } from './aggregate-diff.ts'
import { t } from './locales.ts'
import css from './FileReviewTab.module.css'

interface AggregateCopyButtonProps {
  load: (signal: AbortSignal) => Promise<readonly AggregateDiffFile[]>
}

export function AggregateCopyButton({ load }: AggregateCopyButtonProps) {
  const controller = useRef<AbortController>()
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  useEffect(() => () => controller.current?.abort(), [])

  const copy = async () => {
    if (controller.current) {
      controller.current.abort()
      return
    }
    const current = new AbortController()
    controller.current = current
    setBusy(true)
    setNotice('')
    try {
      const files = await load(current.signal)
      current.signal.throwIfAborted()
      const text = aggregateDiffText(files)
      if (!navigator.clipboard) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(text)
      if (!current.signal.aborted) setNotice(t('copied'))
    } catch (error) {
      if (!current.signal.aborted) setNotice(`${t('reviewCopyFailed')}: ${String(error)}`)
    } finally {
      if (controller.current === current) {
        controller.current = undefined
        setBusy(false)
      }
    }
  }
  return (
    <span>
      <button type="button" className={css.actionButton} onClick={() => { void copy() }}>
        {t(busy ? 'reviewCancelCopy' : 'reviewCopyGroup')}
      </button>
      {notice && <small role="status">{notice}</small>}
    </span>
  )
}
