import type { DiffViewPreferences } from './diff-view-preferences.ts'
import { t } from './locales.ts'

const ENHANCEMENTS = [
  { key: 'dock', label: 'reviewDock' },
  { key: 'adaptive', label: 'reviewAdaptive' },
  { key: 'foldMessages', label: 'reviewFoldMessages' },
] as const
export type ReviewEnhancement = typeof ENHANCEMENTS[number]['key']

interface ReviewEnhancementControlsProps {
  value: Pick<DiffViewPreferences, ReviewEnhancement>
  onChange: (key: ReviewEnhancement, checked: boolean) => void
  disabled?: boolean
  className?: string | undefined
}

/** The dialog and official settings card expose the same portable enhancement fields. */
export function ReviewEnhancementControls({
  value,
  onChange,
  disabled = false,
  className,
}: ReviewEnhancementControlsProps) {
  return ENHANCEMENTS.map(({ key, label }) => (
    <label className={className} key={key}>
      <input
        type="checkbox"
        checked={value[key]}
        disabled={disabled}
        onChange={event => onChange(key, event.target.checked)}
      />
      {t(label)}
    </label>
  ))
}
