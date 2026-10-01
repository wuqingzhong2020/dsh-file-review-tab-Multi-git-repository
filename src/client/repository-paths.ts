import type { ReviewRepository } from '../repository-types.ts'

/** Browser-side path labels; the Host independently enforces canonical roots. */
export function normalizeReviewPath(path: string): string {
  const slash = path.replace(/\\/g, '/')
  const prefix = slash.startsWith('//') ? '//' : slash.startsWith('/') ? '/' : ''
  const segments: string[] = []
  for (const segment of slash.slice(prefix.length).split('/')) {
    if (!segment || segment === '.') continue
    if (segment === '..' && segments.length > 0 && segments.at(-1) !== '..' && !segments.at(-1)?.endsWith(':')) segments.pop()
    else segments.push(segment)
  }
  return prefix + segments.join('/')
}

function key(path: string): string {
  const normalized = normalizeReviewPath(path)
  return /^[A-Za-z]:/.test(normalized) || normalized.startsWith('//') ? normalized.toLowerCase() : normalized
}

export function absoluteReviewPath(path: string): boolean {
  const normalized = normalizeReviewPath(path)
  return /^[A-Za-z]:(?:\/|$)/.test(normalized) || normalized.startsWith('//') || normalized.startsWith('/')
}

/** Return a portable path when both absolute paths share a volume/share. */
export function relativeProjectDirectory(root: string, selected: string): string | null {
  const parse = (value: string): { volume: string; parts: string[]; insensitive: boolean } | null => {
    const path = normalizeReviewPath(value)
    const drive = /^([A-Za-z]:)(?:\/|$)/.exec(path)
    if (drive !== null) return { volume: drive[1]!.toLowerCase(), parts: path.slice(drive[1]!.length).split('/').filter(Boolean), insensitive: true }
    const share = /^(\/\/[^/]+\/[^/]+)(?:\/|$)/.exec(path)
    if (share !== null) return { volume: share[1]!.toLowerCase(), parts: path.slice(share[1]!.length).split('/').filter(Boolean), insensitive: true }
    if (path.startsWith('/')) return { volume: '/', parts: path.slice(1).split('/').filter(Boolean), insensitive: false }
    return null
  }
  const from = parse(root)
  const to = parse(selected)
  if (from === null || to === null || from.volume !== to.volume) return null
  let shared = 0
  while (shared < from.parts.length && shared < to.parts.length && (
    from.insensitive ? from.parts[shared]!.toLowerCase() === to.parts[shared]!.toLowerCase() : from.parts[shared] === to.parts[shared]
  )) shared += 1
  return [...Array(from.parts.length - shared).fill('..'), ...to.parts.slice(shared)].join('/') || '.'
}

export function fileRepository(path: string, repositories: readonly ReviewRepository[]): ReviewRepository | undefined {
  const candidate = key(path)
  return [...repositories].sort((a, b) => b.path.length - a.path.length).find(repo => {
    if (repo.state !== 'ready' && repo.source !== 'project') return false
    const root = key(repo.path)
    return candidate === root || candidate.startsWith(`${root}/`)
  })
}

export function repositoryRelativePath(path: string, repo: ReviewRepository): string {
  return normalizeReviewPath(path).slice(normalizeReviewPath(repo.path).length).replace(/^\//, '') || repo.name
}
