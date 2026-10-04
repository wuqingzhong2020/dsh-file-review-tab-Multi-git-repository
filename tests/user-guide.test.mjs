import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { FileReviewService } from '../lib/index.js'
import { FILE_REVIEW_INVOCATIONS } from '../src/typert-descriptors.ts'
import { loadUserGuide, guideImageResolver } from '../src/client/user-guide.ts'
import { attachLocale, t } from '../src/client/locales.ts'

test('Host opens shipped manuals outside the active project and never accepts a caller file path', async () => {
  const agent = { session: { header: { cwd: 'Z:/an-unrelated-project' } } }
  for (const language of ['zh', 'en']) {
    const expected = new URL(`../docs/USER_GUIDE${language === 'en' ? '.en' : ''}.md`, import.meta.url)
    const actual = await FileReviewService.prototype.userGuide.call({}, agent, language)
    assert.equal(actual, fileURLToPath(expected))
    assert.match(await readFile(actual, 'utf8'), language === 'zh' ? /^# 文件审查插件使用手册/m : /^# File Review Plugin User Guide/m)
  }
  for (const invalid of ['', 'en-US', '../README', '../../secrets', undefined]) {
    await assert.rejects(FileReviewService.prototype.userGuide.call({}, agent, invalid), /Unsupported user guide language/)
  }
})

test('manual RPC requires an agent scope and validates the language and result on the wire', () => {
  const descriptor = FILE_REVIEW_INVOCATIONS.find(item => item.method === 'userGuide')
  assert.deepEqual(descriptor.scope, { context: 'agent', wire: 'agentId' })
  assert.equal(descriptor.parameters[0].lookup, 'agent')
  const language = descriptor.parameters.find(item => item.name === 'language').codec.create()
  assert.equal(language.parse('zh'), 'zh')
  assert.equal(language.parse('en'), 'en')
  for (const invalid of [null, 1, 'en-US', '../USER_GUIDE.md']) assert.equal(language.safeParse(invalid).success, false)
  assert.equal(descriptor.result.create().safeParse('').success, false)
})

test('guide requests use the selected language and originating session without a sidebar service', async () => {
  const requested = []
  const ctx = { sessions: { scope(id) {
    assert.equal(id, 'review-session')
    return { get(namespace) {
      assert.equal(namespace, 'remote.fileReview')
      return { async userGuideDocument(language) {
        requested.push(language)
        return { ok: true, value: { path: language, markdown: '# Guide', images: {} } }
      } }
    } }
  } } }
  for (const language of ['zh', 'en']) assert.equal((await loadUserGuide(ctx, 'review-session', language)).path, language)
  assert.deepEqual(requested, ['zh', 'en'])
})

test('missing guide service and failed or disconnected requests preserve localized failures', async () => {
  let active = 'zh'
  const detach = attachLocale({ getSnapshot: () => ({ active }) })
  try {
    for (const language of ['zh', 'en']) {
      active = language
      await assert.rejects(loadUserGuide({ sessions: { scope: () => undefined } }, 'session', language), { message: t('userGuideServiceUnavailable') })
      await assert.rejects(loadUserGuide({ sessions: { scope: () => ({ get: () => ({}) }) } }, 'session', language), { message: t('userGuideServiceUnavailable') })
    }
    for (const userGuideDocument of [async () => ({ ok: false, error: { message: 'Manual is missing' } }), async () => { throw new Error('Host disconnected') }]) {
      await assert.rejects(loadUserGuide({ sessions: { scope: () => ({ get: () => ({ userGuideDocument }) }) } }, 'session', 'en'), /Manual is missing|Host disconnected/)
    }
  } finally { detach() }
})

test('both shipped guides include their original Markdown and exactly the packaged JPEG bytes', async () => {
  const service = Object.create(FileReviewService.prototype)
  const codec = FILE_REVIEW_INVOCATIONS.find(item => item.method === 'userGuideDocument').result.create()
  for (const language of ['zh', 'en']) {
    const document = await service.userGuideDocument({}, language)
    assert.equal(document.markdown, await readFile(document.path, 'utf8'))
    assert.equal(Object.keys(document.images).length, 12)
    assert.equal(codec.safeParse(document).success, true)
    for (const [destination, data] of Object.entries(document.images)) {
      const original = await readFile(new URL(`../docs/${destination}`, import.meta.url))
      assert.deepEqual(Buffer.from(data.split(',')[1], 'base64'), original)
      assert.equal(original.subarray(0, 2).toString('hex'), 'ffd8')
    }
    await assert.rejects(service.userGuideDocument({}, '../README'), /Unsupported user guide language/)
  }
})

test('manual image vocabulary works without a Web origin and refuses unshipped file destinations', () => {
  const data = 'data:image/jpeg;base64,/9j/2Q=='
  const resolve = guideImageResolver({ path: 'C:/plugin/docs/USER_GUIDE.md', markdown: '', images: { 'image/01-file-review-overview.jpg': data } })
  for (const path of ['image/01-file-review-overview.jpg', './image/01-file-review-overview.jpg']) assert.equal(resolve(path), data)
  for (const path of ['../secrets.png', '/private.jpg', 'C:/private.jpg', 'image/missing.jpg', 'constructor', '__proto__', 'dsh-app://app/sidebar/file?path=C:/private.jpg', 'https://example.com/image.jpg']) assert.equal(resolve(path), undefined)
})

test('guide document RPC rejects arbitrary image paths or executable media protocols', () => {
  const descriptor = FILE_REVIEW_INVOCATIONS.find(item => item.method === 'userGuideDocument')
  assert.deepEqual(descriptor.scope, { context: 'agent', wire: 'agentId' })
  const codec = descriptor.result.create()
  const valid = { path: '/plugin/docs/USER_GUIDE.md', markdown: '# Guide', images: { 'image/01-file-review-overview.jpg': 'data:image/jpeg;base64,/9j/2Q==' } }
  assert.equal(codec.safeParse(valid).success, true)
  for (const images of [{ '../secret.jpg': 'data:image/jpeg;base64,/9j/2Q==' }, { 'image/01-file-review-overview.jpg': 'javascript:alert(1)' }, { 'image/01-file-review-overview.jpg': 'data:text/html;base64,c2NyaXB0' }]) {
    assert.equal(codec.safeParse({ ...valid, images }).success, false)
  }
})

test('guide loading uses the scoped document API and preserves service failures for the preview', async () => {
  const document = { path: '/plugin/docs/USER_GUIDE.en.md', markdown: '# Guide', images: {} }
  const scope = remote => ({ sessions: { scope: id => { assert.equal(id, 'session'); return { get: () => remote } } } })
  assert.equal(await loadUserGuide(scope({ userGuideDocument: async language => { assert.equal(language, 'en'); return { ok: true, value: document } } }), 'session', 'en'), document)
  await assert.rejects(loadUserGuide(scope({}), 'session', 'en'), /service|服务/)
  await assert.rejects(loadUserGuide(scope({ userGuideDocument: async () => ({ ok: false, error: { message: 'Image unavailable' } }) }), 'session', 'en'), /Image unavailable/)
})
