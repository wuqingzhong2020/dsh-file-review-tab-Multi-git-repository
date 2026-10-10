import { useRef, useState, useEffect } from 'react'
import { Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import { t } from './locales.ts'
import css from './FileReviewTab.module.css'

export function ReviewResetDialog({ onClose, onConfirm }: {
  readonly onClose: () => void
  readonly onConfirm: () => Promise<void>
}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mounted = useRef(true)
  const submitting = useRef(false)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  const confirm = async () => {
    if (submitting.current) return
    submitting.current = true
    setPending(true)
    setError(null)
    try { await onConfirm() }
    catch (cause) { if (mounted.current) setError(cause instanceof Error ? cause.message : String(cause)) }
    finally {
      submitting.current = false
      if (mounted.current) setPending(false)
    }
  }
  return <Modal open title={t('reviewResetTitle')} closeLabel={t('reviewResetCancel')}
    onClose={() => { if (!submitting.current) onClose() }}
    footer={<>
      <button type="button" className={css.button} disabled={pending} data-modal-autofocus onClick={onClose}>
        {t('reviewResetCancel')}
      </button>
      <button type="button" className={css.button} disabled={pending} onClick={() => { void confirm() }}>
        {t('reviewResetConfirm')}
      </button>
    </>}>
    <p>{t('reviewResetBody')}</p>
    {error && <p role="alert">{t('reviewResetFailed')}: {error}</p>}
  </Modal>
}
