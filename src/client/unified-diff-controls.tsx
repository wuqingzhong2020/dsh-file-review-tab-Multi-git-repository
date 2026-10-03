import type { RefObject } from 'react'
import { Menu, MenuItemButton } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ReviewLocationResult } from '../review-location.ts'
import type { DiffChangeBlock } from './diff-navigation.ts'
import type { DiffSearchMatch, DiffSearchSide } from './diff-search.ts'
import type { DiffViewPreferences } from './diff-view-preferences.ts'
import type { UnifiedDiffLabels } from './UnifiedDiff.tsx'
import { diffLanguage } from './diff-highlight.ts'
import { t } from './locales.ts'
import type { DiffSelectionController } from './use-diff-selection.ts'
import css from './UnifiedDiff.module.css'

interface DiffToolbarProps {
  readonly preferences: DiffViewPreferences
  readonly labels: UnifiedDiffLabels
  readonly searchButton: RefObject<HTMLButtonElement>
  readonly searchOpen: boolean
  readonly toggleSearch: () => void
  readonly changes: readonly DiffChangeBlock[]
  readonly changeIndex: number
  readonly moveChange: (direction: 1 | -1) => void
  readonly selectChange: (index: number) => void
  readonly path: string
  readonly contextExpanded: boolean
  readonly collapseContext: () => void
  readonly showCopyButton: boolean
  readonly copied: boolean
  readonly copyDiff: () => void
}

export function DiffToolbar({
  preferences,
  labels,
  searchButton,
  searchOpen,
  toggleSearch,
  changes,
  changeIndex,
  moveChange,
  selectChange,
  path,
  contextExpanded,
  collapseContext,
  showCopyButton,
  copied,
  copyDiff,
}: DiffToolbarProps) {
  const changeShortcut = preferences.changeShortcut === 'mod+arrow' ? 'Ctrl/Cmd' : 'Alt'
  const language = {
    cpp: 'C/C++',
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python 3',
    json: 'JSON',
    markdown: 'Markdown',
    text: t('diffPlainText'),
  }[diffLanguage(path)]
  return (
    <div className={css.unifiedToolbar}>
      <button
        ref={searchButton}
        type="button"
        className={css.toolButton}
        aria-label={t('diffSearch')}
        aria-expanded={searchOpen}
        title={`${t('diffSearch')} (${preferences.searchShortcut.replace('mod', 'Ctrl/Cmd')})`}
        onClick={toggleSearch}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="6.5" cy="6.5" r="4" />
          <path d="m9.5 9.5 4 4" />
        </svg>
        {t('diffSearch')}
      </button>
      <button
        type="button"
        className={css.toolButton}
        aria-label={t('diffPreviousChange')}
        title={`${t('diffPreviousChange')} (${changeShortcut}+↑)`}
        disabled={!changes.length}
        onClick={() => moveChange(-1)}
      >
        ↑
      </button>
      <select
        className={css.changeSelect}
        aria-label={t('diffChangeNavigation')}
        value={changeIndex}
        disabled={!changes.length}
        onChange={event => selectChange(Number(event.target.value))}
      >
        <option value={-1}>{t('diffChangeCount', { count: changes.length })}</option>
        {changes.map((change, number) => (
          <option key={change.id} value={number}>
            {t('diffChangePosition', { current: number + 1, count: changes.length })}
          </option>
        ))}
      </select>
      <button
        type="button"
        className={css.toolButton}
        aria-label={t('diffNextChange')}
        title={`${t('diffNextChange')} (${changeShortcut}+↓)`}
        disabled={!changes.length}
        onClick={() => moveChange(1)}
      >
        ↓
      </button>
      <span className={css.languageLabel} title={t('diffSyntaxLanguage')}>
        {language}
      </span>
      {contextExpanded && (
        <button type="button" onClick={collapseContext}>
          {labels.collapseContext}
        </button>
      )}
      {showCopyButton && (
        <button type="button" className={css.unifiedCopyButton} onClick={copyDiff}>
          {copied ? labels.copied : labels.copy}
        </button>
      )}
    </div>
  )
}

interface DiffSearchControlsProps {
  readonly input: RefObject<HTMLInputElement>
  readonly query: string
  readonly setQuery: (query: string) => void
  readonly side: DiffSearchSide
  readonly setSide: (side: DiffSearchSide) => void
  readonly caseSensitive: boolean
  readonly toggleCase: () => void
  readonly wholeWord: boolean
  readonly toggleWholeWord: () => void
  readonly matches: readonly DiffSearchMatch[]
  readonly truncated: boolean
  readonly matchIndex: number
  readonly activeMatch: DiffSearchMatch | undefined
  readonly moveMatch: (direction: 1 | -1) => void
  readonly closeSearch: () => void
}

export function DiffSearchControls({
  input,
  query,
  setQuery,
  side,
  setSide,
  caseSensitive,
  toggleCase,
  wholeWord,
  toggleWholeWord,
  matches,
  truncated,
  matchIndex,
  activeMatch,
  moveMatch,
  closeSearch,
}: DiffSearchControlsProps) {
  const status = !query
    ? t('diffSearchRecorded')
    : truncated
      ? t('diffSearchLimited', { count: matches.length })
      : t('diffSearchCount', { current: matchIndex + 1, count: matches.length })
  const activeLine =
    activeMatch?.side === 'old'
      ? activeMatch.location.line.oldNumber
      : activeMatch?.location.line.newNumber
  return (
    <div className={css.searchToolbar} role="search" aria-label={t('diffSearch')}>
      <input
        ref={input}
        type="search"
        maxLength={256}
        aria-label={t('diffSearchQuery')}
        placeholder={t('diffSearchQuery')}
        value={query}
        onChange={event => setQuery(event.target.value)}
      />
      <select
        aria-label={t('diffSearchSide')}
        value={side}
        onChange={event => setSide(event.target.value as DiffSearchSide)}
      >
        <option value="both">{t('diffSearchBoth')}</option>
        <option value="old">{t('diffOld')}</option>
        <option value="new">{t('diffNew')}</option>
      </select>
      <button
        type="button"
        title={t('diffSearchCase')}
        aria-label={t('diffSearchCase')}
        aria-pressed={caseSensitive}
        onClick={toggleCase}
      >
        Aa
      </button>
      <button
        type="button"
        title={t('diffSearchWord')}
        aria-label={t('diffSearchWord')}
        aria-pressed={wholeWord}
        onClick={toggleWholeWord}
      >
        {t('diffSearchWord')}
      </button>
      <span className={css.searchStatus} role="status">
        {status}
      </span>
      <button
        type="button"
        aria-label={t('diffSearchPrevious')}
        title={t('diffSearchPrevious')}
        disabled={!matches.length}
        onClick={() => moveMatch(-1)}
      >
        ↑
      </button>
      <button
        type="button"
        aria-label={t('diffSearchNext')}
        title={t('diffSearchNext')}
        disabled={!matches.length}
        onClick={() => moveMatch(1)}
      >
        ↓
      </button>
      <button
        type="button"
        aria-label={t('diffSearchClose')}
        title={t('diffSearchClose')}
        onClick={closeSearch}
      >
        ×
      </button>
      {activeMatch && (
        <small>
          {t(activeMatch.side === 'old' ? 'commentOldLine' : 'commentNewLine', {
            line: activeLine ?? '',
          })}
        </small>
      )}
    </div>
  )
}

interface DiffReferenceMenuProps {
  readonly selection: DiffSelectionController
  readonly commentEnabled: boolean
  readonly commentsBusy: boolean
}

function editorResultText(result: ReviewLocationResult): string {
  const messages = {
    exact: 'referenceExact',
    moved: 'editorMoved',
    ambiguous: 'editorAmbiguous',
    changed: 'editorChanged',
    missing: 'editorMissing',
    unsupported: 'editorUnsupported',
    started: 'editorStarted',
    'editor-missing': 'editorUnavailable',
    error: 'editorFailed',
  } as const
  return t(result.reason === 'old' ? 'editorOld' : messages[result.state], {
    line: result.line ?? '',
  })
}

/** Display actions without owning selection or request state. */
export function DiffReferenceMenu({
  selection,
  commentEnabled,
  commentsBusy,
}: DiffReferenceMenuProps) {
  const { reference, referenceNotice, editorResult, editorBusy, menuPoint, menuOwner } = selection
  return (
    <>
      {reference && (
        <Menu
          open={menuPoint !== null}
          portal
          anchor={null}
          className={css.referenceMenuAnchor}
          listClassName={css.referenceMenu}
          getAnchorRect={() => (menuPoint ? new DOMRect(menuPoint.x, menuPoint.y, 0, 0) : null)}
          onClose={selection.closeMenu}
        >
          <div ref={menuOwner} role="presentation" onContextMenu={event => event.preventDefault()}>
            <strong className={css.referenceMenuHeading}>
              {t('referenceRange', {
                side: t(reference.side === 'old' ? 'diffOld' : 'diffNew'),
                start: reference.line!,
                end: reference.endLine,
              })}
            </strong>
            <MenuItemButton onSelect={() => void selection.copyReference(false)}>
              {t('referenceCopy')}
            </MenuItemButton>
            <MenuItemButton onSelect={() => void selection.copyReference(true)}>
              {t('referenceCopyPath')}
            </MenuItemButton>
            {commentEnabled && (
              <>
                <MenuItemButton disabled={commentsBusy} onSelect={selection.commentSelection}>
                  {t('referenceComment')}
                </MenuItemButton>
                <MenuItemButton
                  disabled={editorBusy}
                  onSelect={() => void selection.openSelection()}
                >
                  {t(editorBusy ? 'editorOpening' : 'editorOpenSelection')}
                </MenuItemButton>
              </>
            )}
            <MenuItemButton separatorBefore onSelect={selection.clearSelection}>
              {t('referenceClear')}
            </MenuItemButton>
            {referenceNotice && (
              <p className={css.referenceNotice} role="status">
                {t(referenceNotice)}
              </p>
            )}
            {editorResult && (
              <div className={css.referenceNotice} role="status">
                {editorResultText(editorResult)}
                {editorResult.state === 'moved' && (
                  <MenuItemButton
                    disabled={editorBusy}
                    onSelect={() => void selection.openSelection(true)}
                  >
                    {t('editorConfirmMoved', { line: editorResult.line ?? '' })}
                  </MenuItemButton>
                )}
                {commentEnabled &&
                  editorResult.state !== 'started' &&
                  editorResult.state !== 'missing' && (
                    <MenuItemButton onSelect={selection.openInternalFile}>
                      {t('editorOpenFile')}
                    </MenuItemButton>
                  )}
              </div>
            )}
          </div>
        </Menu>
      )}
      {referenceNotice === 'referenceInvalid' && (
        <p className={css.referenceNotice} role="status">
          {t(referenceNotice)}
        </p>
      )}
    </>
  )
}
