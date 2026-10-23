import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { Menu, MenuItemButton } from '@deepseek-ai/dsh-client-ui-primitives'
import { t } from './locales.ts'
import css from './FileReviewTab.module.css'

function isAbsolutePath(path: string): boolean {
  return path.startsWith('/') || path.startsWith('\\\\') || /^[A-Za-z]:[\\/]/.test(path)
}

/** File-header actions stay separate from the diff's code-selection menu. */
export function useFilePathMenu(absolutePath: string, relativePath: string) {
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null)
  const [notice, setNotice] = useState<'copied' | 'referenceCopyFailed' | null>(null)
  const trigger = useRef<HTMLElement | null>(null)

  useEffect(() => {
    setPoint(null)
    setNotice(null)
  }, [absolutePath, relativePath])

  const close = () => {
    setPoint(null)
    if (document.activeElement?.closest('[role="menu"]')) {
      trigger.current?.focus({ preventScroll: true })
    }
  }
  const show = (element: HTMLElement, x: number, y: number) => {
    trigger.current = element.matches('button, [role="button"]')
      ? element
      : element.querySelector<HTMLElement>('button, [role="button"]')
    setNotice(null)
    setPoint({ x, y })
  }
  const onContextMenu = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
    show(event.currentTarget, event.clientX, event.clientY)
  }
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.defaultPrevented || event.target !== event.currentTarget) return
    if (event.key !== 'ContextMenu' &&
      !(event.key === 'F10' && event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey)) return
    event.preventDefault()
    event.stopPropagation()
    const rect = event.currentTarget.getBoundingClientRect()
    show(event.currentTarget, rect.left, rect.bottom)
  }
  const copy = async (path: string) => {
    close()
    try {
      await navigator.clipboard.writeText(path)
      setNotice('copied')
    } catch {
      setNotice('referenceCopyFailed')
    }
  }

  return {
    onContextMenu,
    onKeyDown,
    menu: <>
      <Menu
        open={point !== null}
        anchor={null}
        portal
        autoFocus
        className={css.filePathMenuAnchor}
        listClassName={css.filePathMenu}
        getAnchorRect={() => point ? new DOMRect(point.x, point.y, 0, 0) : null}
        onClose={close}
      >
        <MenuItemButton disabled={!isAbsolutePath(absolutePath)} onSelect={() => void copy(absolutePath)}>
          {t('copyAbsolutePath')}
        </MenuItemButton>
        <MenuItemButton disabled={!relativePath || isAbsolutePath(relativePath)} onSelect={() => void copy(relativePath)}>
          {t('copyRelativePath')}
        </MenuItemButton>
      </Menu>
      {notice && <p className={css.filePathNotice} role={notice === 'copied' ? 'status' : 'alert'}>{t(notice)}</p>}
    </>,
  }
}
