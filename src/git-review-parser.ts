/** Pure decoders for the zero-delimited Git records and full-context patches. */
import { parsePatch } from 'diff'
import type { ProducedFileDiff } from './change-types.ts'
import type { GitReviewFile, GitReviewRepository } from './git-review-types.ts'

export function parseGitNames(output: string, repository: string): GitReviewFile[] {
  const fields = output.split('\0')
  const files: GitReviewFile[] = []
  for (let index = 0; index < fields.length - 1; ) {
    const status = fields[index++]!
    if (!status) continue
    const firstPath = fields[index++]!
    const renamedOrCopied = /^[RC]/.test(status)
    const path = renamedOrCopied ? fields[index++]! : firstPath
    if (!path) throw new Error('Incomplete Git name-status output')

    const existing = files.find(file => file.path === path)
    if (existing) {
      if (status[0] === 'U') existing.status = 'U'
      continue
    }
    files.push({
      repository,
      path,
      ...(renamedOrCopied ? { oldPath: firstPath } : {}),
      status: status[0]!,
      added: 0,
      removed: 0,
      binary: false,
      untracked: false,
    })
  }
  return files
}

export function applyGitNumstat(output: string, files: GitReviewFile[]): void {
  const fields = output.split('\0')
  for (let index = 0; index < fields.length - 1; ) {
    const record = fields[index++]!
    const match = /^([^\t]+)\t([^\t]+)\t(.*)$/s.exec(record)
    if (!match) continue
    let path = match[3]!
    if (path === '') {
      // Rename records carry their old and new paths as separate NUL fields.
      index++
      path = fields[index++]!
    }
    const file = files.find(item => item.path === path)
    if (file) {
      file.binary = match[1] === '-'
      file.added = Number(match[1]) || 0
      file.removed = Number(match[2]) || 0
    }
  }
}

export function parseGitCommits(output: string): GitReviewRepository['commits'] {
  const fields = output.split('\0')
  const commits: GitReviewRepository['commits'] = []
  for (let index = 0; index + 2 < fields.length; index += 3) {
    commits.push({
      oid: fields[index]!.trim(),
      subject: fields[index + 1]!,
      date: fields[index + 2]!,
    })
  }
  return commits
}

export function parseGitTextDiffs(patch: string, filename: string): ProducedFileDiff[] {
  return parsePatch(patch).flatMap(part =>
    part.hunks.map(hunk => {
      const oldLines: string[] = []
      const newLines: string[] = []
      let oldFinalNewline = true
      let newFinalNewline = true
      let previousPrefix = ''
      for (const line of hunk.lines) {
        if (line.startsWith('\\')) {
          if (previousPrefix !== '+') oldFinalNewline = false
          if (previousPrefix !== '-') newFinalNewline = false
          continue
        }
        if (line[0] !== '+') oldLines.push(line.slice(1))
        if (line[0] !== '-') newLines.push(line.slice(1))
        previousPrefix = line[0] || ''
      }
      return {
        path: filename,
        oldText: oldLines.join('\n') + (oldLines.length && oldFinalNewline ? '\n' : ''),
        newText: newLines.join('\n') + (newLines.length && newFinalNewline ? '\n' : ''),
        oldStart: Math.max(1, hunk.oldStart),
        newStart: Math.max(1, hunk.newStart),
      }
    }),
  )
}
