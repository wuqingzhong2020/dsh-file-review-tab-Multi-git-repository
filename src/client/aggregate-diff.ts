/** Multi-repository review report, deliberately distinct from an applicable Git patch. */
import type { ProducedFileDiff } from '../change-types.ts'
import { unifiedDiffText } from './unified-diff-model.ts'

export const COPY_FILE_LIMIT = 256
export const COPY_BYTE_LIMIT = 2 * 1024 * 1024
export interface AggregateDiffFile {
  repository: string
  path: string
  source: string
  diffs: readonly ProducedFileDiff[]
  note?: string
}

function fileSection(file: AggregateDiffFile): string {
  const header = [
    `Repository: ${JSON.stringify(file.repository)}`,
    `Source: ${JSON.stringify(file.source)}`,
    `File: ${JSON.stringify(file.path)}`,
  ].join('\n')
  const body = file.diffs.length
    ? file.diffs.map((diff, index) => `Operation ${index + 1}:\n${unifiedDiffText([diff])}`).join('\n\n')
    : '(No text diff recorded)'
  return `${header}\n${body}${file.note ? `\nNote: ${file.note}` : ''}`
}

export function aggregateDiffText(files: readonly AggregateDiffFile[]): string {
  if (files.length > COPY_FILE_LIMIT) throw new Error('Copy exceeds the 256-file budget')
  const sections = ['Multi-repository review report (operation fragments; not a single applicable patch).']
  const encoder = new TextEncoder()
  let bytes = encoder.encode(sections[0]).length
  for (const file of files) {
    const section = fileSection(file)
    bytes += encoder.encode(section).length + 2
    if (bytes > COPY_BYTE_LIMIT) throw new Error('Copy exceeds the 2 MiB budget')
    sections.push(section)
  }
  return sections.join('\n\n')
}
