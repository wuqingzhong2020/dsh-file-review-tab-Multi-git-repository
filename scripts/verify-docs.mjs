import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import { USER_GUIDE_IMAGES } from '../src/user-guide.ts'
import { FileReviewService } from '../lib/index.js'
import { FILE_REVIEW_INVOCATIONS } from '../src/typert-descriptors.ts'

const manuals = await Promise.all(['docs/USER_GUIDE.md', 'docs/USER_GUIDE.en.md'].map(path => readFile(path, 'utf8')))
for (const markdown of manuals) {
  for (const chapter of [17, 18, 19, 20]) assert.match(markdown, new RegExp(`^## ${chapter}\\. `, 'm'))
  for (const image of USER_GUIDE_IMAGES) {
    assert.ok(markdown.includes(image), `Missing bilingual image reference: ${image}`)
    const bytes = await readFile(`docs/image/${image}`)
    assert.equal(bytes.readUInt16BE(0), 0xffd8)
    assert.ok((await stat(`docs/image/${image}`)).size <= 1024 * 1024, `Oversized image: ${image}`)
  }
  for (const match of markdown.matchAll(/!\[[^\]]*\]\((image\/[^)]+)\)/g)) assert.ok(USER_GUIDE_IMAGES.includes(match[1].slice(6)), `Unwhitelisted image: ${match[1]}`)
}
const service = Object.create(FileReviewService.prototype)
const codec = FILE_REVIEW_INVOCATIONS.find(item => item.method === 'userGuideDocument').result.create()
for (const lang of ['zh', 'en']) assert.ok(codec.safeParse(await service.userGuideDocument({}, lang)).success)
console.log(`Bilingual chapters 17–20, ${USER_GUIDE_IMAGES.length} JPEG resources, Host document and wire codec: PASS`)
