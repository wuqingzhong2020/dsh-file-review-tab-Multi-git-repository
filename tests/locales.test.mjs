import { test } from 'node:test'
import assert from 'node:assert/strict'
import { attachLocale, en, getLocaleSnapshot, subscribeLocale, t, zh } from '../src/client/locales.ts'
import { en as chatEn, zh as chatZh } from '../src/client/chat-locales.ts'
import { localizeReviewMessage } from '../src/client/message-locales.ts'
import { Config } from '../src/repository-config.ts'
import { followReviewTabTitle } from '../src/client/sidebar-title.ts'

function source(active) {
  return {
    active, listeners: new Set(),
    getSnapshot() { return { active: this.active } },
    subscribe(listener) { this.listeners.add(listener); return () => { this.listeners.delete(listener) } },
    set(active) { this.active = active; for (const listener of this.listeners) listener() },
  }
}

test('host General settings language overrides browser language and switches existing subscribers', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { language: 'zh-CN' } })
  const host = source('en')
  const detach = attachLocale(host)
  const seen = []
  const unsubscribe = subscribeLocale(() => { seen.push(t('diffSettings')) })
  try {
    assert.equal(getLocaleSnapshot(), 'en')
    assert.equal(t('tabTitle'), 'File Review')
    host.set('zh')
    assert.equal(t('diffSettings'), '设置')
    assert.equal(t('expandContext', { count: 7, remaining: 50 }), '展开 7 行未修改代码（剩余 50 行）')
    host.set('en')
    assert.equal(t('projectTab'), 'Multi-repository management')
    assert.deepEqual(seen, ['设置', 'Settings'])
    unsubscribe()
    host.set('zh')
    assert.equal(seen.length, 2)
  } finally {
    unsubscribe(); detach()
    if (original) Object.defineProperty(globalThis, 'navigator', original)
    else delete globalThis.navigator
  }
  assert.equal(host.listeners.size, 0)
})

test('locale attachment replacement and stale disposers do not leak or detach the current host', () => {
  const first = source('zh'); const second = source('en')
  const stopFirst = attachLocale(first)
  const stopSecond = attachLocale(second)
  assert.equal(first.listeners.size, 0)
  assert.equal(second.listeners.size, 1)
  stopFirst()
  assert.equal(t('diffSettings'), 'Settings')
  const stopReplacement = attachLocale(second)
  stopSecond()
  assert.equal(second.listeners.size, 1)
  second.set('zh-CN')
  assert.equal(t('diffSettings'), '设置')
  stopReplacement(); stopReplacement()
  assert.equal(second.listeners.size, 0)
})

test('standalone fallback supports Chinese variants and uses English for other languages', () => {
  for (const [language, expected] of [['ZH-cn', 'zh'], ['zh-TW', 'zh'], ['en-US', 'en'], ['fr', 'en']]) {
    const detach = attachLocale(source(language))
    assert.equal(getLocaleSnapshot(), expected)
    detach()
  }
  const original = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
  try {
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { language: 'zh-CN' } })
    assert.equal(t('diffSettings'), '设置')
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: undefined })
    assert.equal(t('diffSettings'), 'Settings')
  } finally {
    if (original) Object.defineProperty(globalThis, 'navigator', original)
    else delete globalThis.navigator
  }
})

test('both review dictionaries have complete matching keys and interpolation parameters', () => {
  const placeholders = text => [...new Set(text.match(/\{\w+\}/g) ?? [])].sort()
  for (const [english, chinese] of [[en, zh], [chatEn, chatZh]]) {
    assert.deepEqual(Object.keys(english).sort(), Object.keys(chinese).sort())
    for (const key of Object.keys(english)) {
      assert.ok(english[key].trim() && chinese[key].trim(), key)
      assert.deepEqual(placeholders(english[key]), placeholders(chinese[key]), key)
    }
  }
})

test('existing diagnostics switch language at render and preserve paths and unknown Git details', () => {
  const host = source('zh'); const detach = attachLocale(host)
  try {
    assert.equal(localizeReviewMessage('core: This repository has no commits'), 'core: 此仓库尚无提交')
    assert.equal(localizeReviewMessage('D:/项目/config.json: Project configuration file changed; reload before saving'), 'D:/项目/config.json: 工程配置文件已发生变化，请重新加载后再保存')
    assert.equal(localizeReviewMessage('Review exceeds 10000 files; select a smaller scope'), '审查文件数超过 10000，请选择更小的范围')
    assert.equal(localizeReviewMessage('repository 3 has no path'), '第 3 个仓库没有路径')
    assert.equal(localizeReviewMessage('dsh-file-review-repositories.json must be a regular file'), 'dsh-file-review-repositories.json 必须为普通文件')
    assert.equal(localizeReviewMessage('fatal: custom Git diagnostic'), 'fatal: custom Git diagnostic')
    assert.equal(localizeReviewMessage('File review service is unavailable'), t('remoteUnavailable'))
    host.set('en')
    assert.equal(localizeReviewMessage('core: This repository has no commits'), 'core: This repository has no commits')
    assert.equal(localizeReviewMessage('文件审查服务不可用'), 'File review service is unavailable')
    assert.equal(localizeReviewMessage('此仓库尚无提交'), 'This repository has no commits')
  } finally { detach() }
})

test('Host configuration descriptions provide both Chinese and English metadata', () => {
  assert.deepEqual(Config.dict.enabled.meta.description, { zh: '是否启用多代码仓管理', en: 'Enable multi-repository management' })
  assert.deepEqual(Config.dict.projects.inner.dict.enabled.meta.description, { zh: '是否启用该项目的多代码仓管理', en: 'Enable multi-repository management for this project' })
})

test('restored native sidebar chips follow language without replacing tabs or their state', () => {
  const host = source('en'); const detach = attachLocale(host)
  const meta = { expandPaths: ['D:/demo/file.ts'], draft: '评论草稿' }
  const tabs = new Map([
    ['native-review-1', { id: 'native-review-1', title: '文件审查', meta }],
    ['native-review-2', { id: 'native-review-2', title: 'File Review', meta: { scope: 'staged' } }],
    ['editor', { id: 'editor', title: '中文文件.ts' }],
  ])
  const calls = []
  const sidebar = {
    updateTab(id, patch) {
      assert.equal(this, sidebar)
      calls.push({ id, patch })
      Object.assign(tabs.get(id), patch)
    },
  }
  const firstTab = tabs.get('native-review-1')
  const stopFirst = followReviewTabTitle(sidebar, firstTab)
  const stopSecond = followReviewTabTitle(sidebar, tabs.get('native-review-2'))
  try {
    assert.equal(firstTab.title, 'File Review', 'a restored Chinese title is corrected on mount')
    assert.equal(calls.length, 1, 'an already-correct title needs no update')
    host.set('zh'); host.set('zh-CN')
    assert.equal(firstTab.title, '文件审查')
    assert.equal(tabs.get('native-review-2').title, '文件审查')
    assert.equal(calls.length, 3, 'equivalent Chinese locales do not write again')
    host.set('en')
    assert.equal(firstTab.title, 'File Review')
    assert.equal(tabs.get('native-review-2').title, 'File Review')
    assert.equal(tabs.get('editor').title, '中文文件.ts')
    assert.equal(tabs.get('native-review-1'), firstTab)
    assert.equal(firstTab.meta, meta)
    assert.ok(calls.every(call => Object.keys(call.patch).join() === 'title'))
    stopFirst(); stopSecond()
    const count = calls.length
    host.set('zh')
    assert.equal(calls.length, count, 'closed tabs unsubscribe from language changes')
  } finally { stopFirst(); stopSecond(); detach() }
})
