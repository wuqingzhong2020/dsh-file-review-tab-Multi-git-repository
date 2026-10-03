/** Fixed, packaged manual assets; callers cannot select arbitrary file paths. */
import { lstat, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { USER_GUIDE_IMAGES, type UserGuideDocument } from './user-guide.ts'

const MAX_SCREENSHOT_BYTES = 1024 * 1024

export async function userGuidePath(language: 'zh' | 'en'): Promise<string> {
  if (language !== 'zh' && language !== 'en') {
    throw new Error('Unsupported user guide language')
  }
  // Source modules and the bundled Host entry both live one level below docs.
  const suffix = language === 'en' ? '.en' : ''
  const document = new URL(`../docs/USER_GUIDE${suffix}.md`, import.meta.url)
  if (!(await lstat(document)).isFile()) {
    throw new Error('User guide is not a regular file')
  }
  return fileURLToPath(document)
}

async function readScreenshot(name: string): Promise<readonly [string, string]> {
  const image = new URL(`../docs/image/${name}`, import.meta.url)
  const info = await lstat(image)
  if (!info.isFile() || info.isSymbolicLink() || info.size > MAX_SCREENSHOT_BYTES) {
    throw new Error('Invalid user guide screenshot')
  }
  const bytes = await readFile(image)
  return [`image/${name}`, `data:image/jpeg;base64,${bytes.toString('base64')}`]
}

export async function readUserGuideDocument(path: string): Promise<UserGuideDocument> {
  const markdown = await readFile(path, 'utf8')
  const images = await Promise.all(USER_GUIDE_IMAGES.map(readScreenshot))
  return { path, markdown, images: Object.fromEntries(images) }
}
