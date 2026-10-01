/** Portable repository configuration owned by each project directory. */
import { createHash } from 'node:crypto'
import { lstat, readFile, realpath } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { writeFileAtomic } from '@deepseek-ai/dsh-atomic-write'
import { z } from 'zod'
import type { ReviewProject } from './repository-types.ts'

export const PROJECT_FILE_NAME = 'dsh-file-review-repositories.json'

const fileSchema = z.object({
  version: z.literal(1),
  enabled: z.boolean().optional(),
  includeProjectRoot: z.boolean(),
  repositories: z.array(z.object({
    name: z.string().trim().min(1).max(120),
    path: z.string().trim().min(1).max(4096),
  })).max(512),
})

function revision(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex')
}

export async function readProjectFile(root: string): Promise<{ project: ReviewProject; revision: string } | null> {
  const filename = join(root, PROJECT_FILE_NAME)
  const marker = await lstat(filename).catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'ENOENT') return null
    throw error
  })
  if (marker === null) return null
  if (!marker.isFile() || marker.isSymbolicLink()) throw new Error(`${PROJECT_FILE_NAME} must be a regular file`)
  if (marker.size > 1024 * 1024) throw new Error(`${PROJECT_FILE_NAME} exceeds 1 MiB`)
  const bytes = await readFile(filename)
  const data = fileSchema.parse(JSON.parse(bytes.toString('utf8')))
  return {
    project: {
      name: basename(root), root,
      enabled: data.enabled ?? true,
      includeProjectRoot: data.includeProjectRoot,
      configFiles: [], repositories: [], namedRepositories: data.repositories,
    },
    revision: revision(bytes),
  }
}

export async function findProjectFile(cwd: string): Promise<{ project: ReviewProject; revision: string } | null> {
  let directory = await realpath(cwd)
  while (true) {
    const found = await readProjectFile(directory)
    if (found !== null) return found
    const parent = dirname(directory)
    if (parent === directory) return null
    directory = parent
  }
}

export async function writeProjectFile(project: ReviewProject, expectedRevision: string): Promise<string> {
  const current = await readProjectFile(project.root)
  if ((current?.revision ?? '') !== expectedRevision) throw new Error('Project configuration file changed; reload before saving')
  const data = fileSchema.parse({
    version: 1,
    enabled: project.enabled ?? true,
    includeProjectRoot: project.includeProjectRoot,
    repositories: project.namedRepositories ?? [],
  })
  const filename = join(project.root, PROJECT_FILE_NAME)
  const bytes = Buffer.from(`${JSON.stringify(data, null, 2)}\n`, 'utf8')
  await writeFileAtomic(filename, bytes.toString('utf8'), { mode: 0o644 })
  return revision(bytes)
}
