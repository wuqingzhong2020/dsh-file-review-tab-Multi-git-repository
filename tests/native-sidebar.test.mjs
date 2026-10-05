import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { runInNewContext } from 'node:vm'
import * as React from 'react'
import * as jsx from 'react/jsx-runtime'
import { renderToStaticMarkup } from 'react-dom/server'
import { parseFileAddress } from '@deepseek-ai/dsh-util-workspace-path'
import { openReviewTab, openReviewResource } from '../src/client/sidebar-navigation.ts'
import { registrationLifetime } from '../src/client/registration-lifetime.ts'
import { clearFileReviewSeeds, currentFileReviewSeed, discardFileReviewSeed, publishFileReviewSeed, subscribeFileReviewSeed } from '../src/client/deep-link.ts'
import { t } from '../src/client/locales.ts'

test('chat navigation isolates sessions, reveals existing pages and rolls back failed targets', () => {
  clearFileReviewSeeds()
  let current = 'A'
  const opened = []
  const sidebar = { mounted: { getSnapshot: () => current }, openTab: (...args) => opened.push(args) }
  for (const other of ['B', undefined]) {
    current = other
    assert.throws(() => openReviewTab(sidebar, 'A', ['same.py'], 2), { message: t('sidebarSessionNotVisible') })
    assert.equal(currentFileReviewSeed('A'), undefined)
  }
  current = 'A'
  openReviewTab(sidebar, 'A', ['same.py'], 2)
  const first = currentFileReviewSeed('A')
  openReviewTab(sidebar, 'A', ['same.py'], 3)
  const second = currentFileReviewSeed('A')
  assert.ok(second.nonce > first.nonce)
  assert.equal(second.turn, 3)
  assert.deepEqual(opened, [['file-review', { revealIfOpened: true }], ['file-review', { revealIfOpened: true }]])
  assert.throws(() => openReviewTab({ ...sidebar, openTab() { throw new Error('duplicate kind') } }, 'A', ['other.py']), /duplicate kind/)
  assert.equal(currentFileReviewSeed('A'), undefined)
  clearFileReviewSeeds()
})

test('file resource addresses preserve special names, UNC and cross-root paths through bound actions', () => {
  const calls = []
  const actions = { openResource: (...args) => calls.push(args) }
  const signal = new AbortController().signal
  for (const path of ['D:\\项目\\repo\\name #?.py', 'D:/outside/same.py', '\\\\server\\share\\中文 空格.py']) {
    openReviewResource(actions, 'session #1', 'D:/项目/repo', path, signal)
    const [address, options] = calls.at(-1)
    const decoded = parseFileAddress(address)
    assert.deepEqual(options, { revealIfOpened: true })
    const normal = path.replaceAll('\\', '/')
    assert.equal(decoded.path, normal.startsWith('D:/项目/repo/') ? 'name #?.py' : normal)
    assert.equal(decoded.scope, 'session', 'outside roots still retain the originating session authorization')
    if (decoded.scope === 'session') assert.equal(decoded.sessionId, 'session #1')
  }
  const controller = new AbortController(); controller.abort()
  assert.throws(() => openReviewResource(actions, 'A', 'D:/repo', 'x.py', controller.signal), /unavailable|不可用/)
  assert.throws(() => openReviewResource(actions, 'A', undefined, 'x.py', signal), /directory|工作目录/)
  assert.equal(calls.length, 3)
})

test('consuming an old deep link cannot discard a newer target; unloading releases listeners', () => {
  clearFileReviewSeeds()
  const received = []
  const stop = subscribeFileReviewSeed((id, seed) => received.push([id, seed.turn]))
  const first = publishFileReviewSeed('A', ['same.py'], 1)
  const next = publishFileReviewSeed('A', ['same.py'], 2)
  publishFileReviewSeed('B', ['same.py'], 3)
  discardFileReviewSeed('A', first.nonce)
  assert.equal(currentFileReviewSeed('A'), next)
  discardFileReviewSeed('A', next.nonce)
  assert.equal(currentFileReviewSeed('A'), undefined)
  assert.equal(currentFileReviewSeed('B').turn, 3)
  stop(); clearFileReviewSeeds(); publishFileReviewSeed('A', ['x.py'])
  assert.equal(received.length, 3)
  clearFileReviewSeeds()
})

test('partial registration rolls back in reverse order despite a throwing disposer', () => {
  const released = [], errors = []
  const lifetime = registrationLifetime(error => errors.push(error.message))
  lifetime.register(() => () => released.push('type'))
  lifetime.register(() => () => { released.push('body'); throw new Error('release error') })
  lifetime.register(() => { throw new Error('title registration error') })
  lifetime.register(() => { assert.fail('Failed units cannot acquire new resources') })
  lifetime.release(); lifetime.release()
  assert.deepEqual(released, ['body', 'type'])
  assert.deepEqual(errors, ['release error', 'title registration error'])
})

/** Load the real distributable with host capabilities, rather than a duplicated test implementation. */
async function clientHarness({ delayed = false, failTitle = false } = {}) {
  let plugin
  const diagnostics = []
  runInNewContext(await readFile(new URL('../lib/client.js', import.meta.url), 'utf8'), {
    window: { __ModuleLoader__: { load: ({ factory }) => {
      plugin = factory(name => {
        if (name === 'react') return React
        if (name === 'react/jsx-runtime') return jsx
        if (name === '@deepseek-ai/dsh-client-ui-primitives') return {}
        assert.fail(`Unexpected browser runtime dependency: ${name}`)
      })
    } } }, console: { ...console, error: (...args) => diagnostics.push(args) }, Map, Set, WeakMap, AbortController,
  })
  const effects = [], types = new Map(), seats = new Map(), pending = [], listeners = new Set()
  const snapshots = new Map()
  const sessions = { list: { getSnapshot: () => ({ byId: {} }), subscribe: () => () => {} }, binding: id => id,
    retainInfo: id => ({ getSnapshot: () => id, subscribe: () => () => {} }) }
  const locale = { active: 'zh', getSnapshot() { return { active: this.active } },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) }, register: () => () => {},
    set(active) { this.active = active; for (const notify of [...listeners]) notify() } }
  const ctx = {
    get: name => name === 'sessions' ? sessions : undefined,
    locale, remote: { $mount: async () => async () => {} },
    effect(acquire) { const dispose = acquire(); effects.push(dispose); return dispose },
    inject() { return () => {} }, // Optional enhancement services absent in this core-only host.
    uiConversation: { events: { register: () => () => {} }, binding: id => ({ snapshot: {
      getSnapshot: () => snapshots.get(id) ?? null, subscribe: () => () => {},
    } }) },
    sidebarRight: { mounted: { getSnapshot: () => 'A' }, openTab() {} },
    sidebarRightTabs: { register(definition) {
      assert.ok(!types.has(definition.kind), 'one registration per kind')
      types.set(definition.kind, definition)
      return () => types.delete(definition.kind)
    } },
    slots: {
      entriesOfSlot() { return [] },
      inject(name, factory) {
        let release
        const start = () => { release = factory() }
        if (delayed) pending.push(start); else start()
        return () => { const index = pending.indexOf(start); if (index >= 0) pending.splice(index, 1); release?.() }
      },
      register(options, component) {
        if (failTitle && options.name === 'sidebar.right.pane.tab.title') throw new Error('title unavailable')
        const key = `${options.name}:${options.key ?? options.id}`
        seats.set(key, { options, component })
        return () => seats.delete(key)
      },
    },
  }
  plugin.apply(ctx)
  await Promise.resolve()
  return { plugin, ctx, types, seats, pending, locale, snapshots, diagnostics,
    release: () => { for (const dispose of effects.reverse()) dispose?.() },
  }
}

test('packaged client boots without a third-party sidebar and restores review plus hidden legacy-guide kinds', async () => {
  const h = await clientHarness({ delayed: true })
  assert.ok(!h.plugin.inject.includes('betterSidebar'))
  assert.equal(h.types.get('file-review').keepMounted, true)
  assert.equal(h.types.get('file-review').guide.length, 1)
  assert.equal(h.types.get('file-review-guide').guide, undefined)
  for (const start of [...h.pending]) start()
  assert.ok(!h.seats.has('conversation.view:repositories'), 'management tab belongs to the manager plugin')
  const title = h.seats.get('sidebar.right.pane.tab.title:dsh-file-review-tab-multi-git-repository:file-review')
  const props = title.options.inject('A')
  // No body is rendered: inactive labels still read the current host language.
  assert.match(renderToStaticMarkup(React.createElement(title.component, props)), /文件审查/)
  h.locale.set('en')
  assert.match(renderToStaticMarkup(React.createElement(title.component, props)), /File Review/)
  assert.doesNotMatch(renderToStaticMarkup(React.createElement(title.component, props)), /文件审查/)
  h.release()
  assert.equal(h.types.size, 0)
  assert.equal(h.seats.size, 0)
})

test('late slot failure rolls back native types and both body registrations', async () => {
  const h = await clientHarness({ delayed: true, failTitle: true })
  for (const start of [...h.pending]) start()
  assert.equal(h.types.size, 0)
  assert.equal([...h.seats.keys()].filter(key => key.startsWith('sidebar.right.')).length, 0)
  assert.match(String(h.diagnostics[0]?.[0]), /native title failed/)
  h.release()
})

test('inactive native title updates its badge when tool content changes without node-count changes', async () => {
  const h = await clientHarness()
  const title = h.seats.get('sidebar.right.pane.tab.title:dsh-file-review-tab-multi-git-repository:file-review')
  const props = title.options.inject('A')
  const node = { kind: 'tool-result', seq: 1, isError: true,
    call: { name: 'write', argsRaw: JSON.stringify({ file_path: 'same.py', content: 'print(1)' }) } }
  const before = { nodes: [node], turnEnds: new Map([[1, 2]]), partial: null, runningCalls: [] }
  h.snapshots.set('A', before)
  const render = () => renderToStaticMarkup(React.createElement(title.component, props))
  assert.doesNotMatch(render(), /<small/)
  h.snapshots.set('A', { ...before, nodes: [{ ...node, isError: false }] })
  assert.match(render(), /<small[^>]*>1<\/small>/)
  h.snapshots.set('B', before)
  assert.match(render(), /<small[^>]*>1<\/small>/, 'another session cannot alter the badge')
  h.snapshots.set('A', { nodes: Array.from({ length: 6 }, (_, i) => ({ ...node,
    seq: i + 1, isError: false,
    call: { name: 'write', argsRaw: JSON.stringify({ file_path: `${i}.py`, content: 'print(1)' }) },
  })), turnEnds: new Map(Array.from({ length: 6 }, (_, i) => [i + 1, i + 1])), partial: null, runningCalls: [] })
  assert.match(render(), /<small[^>]*>5<\/small>/, 'automatically archived turns remain excluded')
  h.release()
})
