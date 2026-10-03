import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { FileReviewService } from '../lib/index.js'
import { FILE_REVIEW_INVOCATIONS } from '../src/typert-descriptors.ts'
import { openUserGuide, loadUserGuide, guideImageResolver } from '../src/client/user-guide.ts'
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

test('clicks follow the current host language and target the originating session in the guide tab', async () => {
  let active = 'zh-CN'
  const detach = attachLocale({ getSnapshot: () => ({ active }) })
  const opened = [], requested = []
  const ctx = {
    sessions: { scope(id) {
      assert.equal(id, 'review-session')
      return { get(namespace) {
        assert.equal(namespace, 'remote.fileReview')
        return { async userGuide(language) {
          requested.push(language)
          const path = await FileReviewService.prototype.userGuide.call({}, {}, language)
          return { ok: true, value: path }
        } }
      } }
    } },
    betterSidebar: { openTab(...args) { opened.push(args) } },
  }
  try {
    await openUserGuide(ctx, 'review-session')
    active = 'en'
    await openUserGuide(ctx, 'review-session')
    assert.deepEqual(requested, ['zh', 'en'])
    assert.deepEqual(opened.map(args => args[1]), [{ sessionId: 'review-session' }, { sessionId: 'review-session' }])
    assert.equal(opened[0][0].type, 'file-review-guide')
    assert.equal(opened[1][0].type, 'file-review-guide')
    assert.match(opened[0][0].path, /[\\/]docs[\\/]USER_GUIDE\.md$/)
    assert.match(opened[1][0].path, /[\\/]docs[\\/]USER_GUIDE\.en\.md$/)
  } finally { detach() }
})

test('missing host service or viewer reports a localized error instead of silently opening a relative path', async () => {
  let active = 'zh'
  const detach = attachLocale({ getSnapshot: () => ({ active }) })
  const sidebar = { openTab() { assert.fail('No tab may be opened without the service') } }
  try {
    for (const language of ['zh', 'en']) {
      active = language
      await assert.rejects(openUserGuide({ sessions: { scope: () => undefined }, betterSidebar: sidebar }, 'session'), { message: t('userGuideServiceUnavailable') })
      await assert.rejects(openUserGuide({ sessions: { scope: () => ({ get: () => ({}) }) }, betterSidebar: sidebar }, 'session'), { message: t('userGuideServiceUnavailable') })
      await assert.rejects(openUserGuide({}, 'session'), { message: t('userGuideViewerUnavailable') })
    }
  } finally { detach() }
})

test('failed or disconnected manual RPC preserves the failure without calling the file viewer', async () => {
  for (const userGuide of [async () => ({ ok: false, error: { message: 'Manual is missing from the installed package' } }), async () => { throw new Error('Host disconnected') }]) {
    const ctx = {
      sessions: { scope: () => ({ get: () => ({ userGuide }) }) },
      betterSidebar: { openTab() { assert.fail('Failed requests must not open a tab') } },
    }
    await assert.rejects(openUserGuide(ctx, 'session'), /Manual is missing|Host disconnected/)
  }
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
