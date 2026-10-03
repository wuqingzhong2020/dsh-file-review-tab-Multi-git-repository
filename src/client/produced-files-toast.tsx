/** Feedback for a completed undo/redo request, including skipped-file actions. */
import { useEffect } from 'react'
import { basename } from './turn-deliverables.ts'
import type { DeliverablesKey } from './chat-locales.ts'
import css from './ProducedFiles.module.css'

const SUCCESS_NOTICE_DURATION = 2000
const ERROR_NOTICE_DURATION = 5000

export interface NoticeFile {
  readonly path: string
}

export interface ToggleNotice {
  readonly seq: number
  readonly tone: 'success' | 'error'
  readonly title: DeliverablesKey
  readonly description?: string | undefined
  readonly descriptionKey?: DeliverablesKey | undefined
  readonly files: readonly NoticeFile[]
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={css.closeIcon}>
      <path d="m5.5 5.5 9 9m0-9-9 9" />
    </svg>
  )
}

function SuccessIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={css.noticeIconSvg}>
      <path d="m5 10 3.25 3.25L15 6.5" />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={css.noticeIconSvg}>
      <circle cx="10" cy="10" r="6.5" />
      <path d="m7.5 7.5 5 5m0-5-5 5" />
    </svg>
  )
}

export function ResultToast({
  notice,
  closeLabel,
  dismissLabel,
  fileListLabel,
  fileOpenLabel,
  openFile,
  onDone,
}: {
  readonly notice: Omit<ToggleNotice, 'title'> & { readonly title: string }
  readonly closeLabel: string
  readonly dismissLabel: string
  readonly fileListLabel: string
  readonly fileOpenLabel: (path: string) => string
  readonly openFile: (path: string) => void
  readonly onDone: () => void
}) {
  useEffect(() => {
    const duration = notice.tone === 'success' ? SUCCESS_NOTICE_DURATION : ERROR_NOTICE_DURATION
    const timer = window.setTimeout(onDone, duration)
    return () => {
      window.clearTimeout(timer)
    }
  }, [notice.tone, onDone])
  return (
    <div
      className={`${css.toast} ${notice.tone === 'success' ? css.toastSuccess : css.toastError}`}
      role="alert"
    >
      <div className={css.toastHeader}>
        <span className={css.noticeIcon}>
          {notice.tone === 'success' ? <SuccessIcon /> : <ErrorIcon />}
        </span>
        <div className={css.toastCopy}>
          <strong className={css.toastTitle}>{notice.title}</strong>
          {notice.description !== undefined && (
            <span className={css.toastDescription}>{notice.description}</span>
          )}
        </div>
        <button
          type="button"
          className={css.toastCloseButton}
          aria-label={closeLabel}
          onClick={onDone}
        >
          <CloseIcon />
        </button>
      </div>
      {notice.files.length > 0 && (
        <div className={css.noticeFiles}>
          <span className={css.noticeFileListLabel}>{fileListLabel}</span>
          <ul className={css.noticeFileList}>
            {notice.files.map(file => (
              <li key={file.path}>
                <button
                  type="button"
                  className={css.noticeFileButton}
                  aria-label={fileOpenLabel(file.path)}
                  onClick={() => {
                    openFile(file.path)
                  }}
                >
                  <span className={css.noticeFilePath}>{basename(file.path)}</span>
                  <span className={css.noticeFileArrow} aria-hidden="true">
                    ↗
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {notice.tone === 'error' && (
        <button type="button" className={css.noticeDismissButton} onClick={onDone}>
          {dismissLabel}
        </button>
      )}
    </div>
  )
}
