/** Isolated browser capability fixture. It loads lib/client.js, never a copied plugin implementation. */
import * as React from 'react'
import * as jsx from 'react/jsx-runtime'
import { createRoot } from 'react-dom/client'
import * as primitives from '@deepseek-ai/dsh-client-ui-primitives'

const packageName = 'dsh-file-review-tab-multi-git-repository'
const sessionId = 'browser-fixture'
const cwd = 'D:/fixture'
const lang = new URLSearchParams(location.search).get('lang') || 'zh'
function observable<T>(initial: T) {
  let value = initial
  const listeners = new Set<() => void>()
  return { getSnapshot: () => value, subscribe: (fn: () => void) => { listeners.add(fn); return () => listeners.delete(fn) },
    set(next: T) { value = next; for (const fn of [...listeners]) fn() } }
}
const anchor = { scope: 'last-turn', repository: cwd + '/core', repositoryName: 'core', path: 'service.ts', absolutePath: cwd + '/core/service.ts', side: 'new', line: 2, endLine: 2, revision: 'fixture-revision', sourceKey: 'fixture-source', quote: 'return validate(input)', before: 'export function review(input) {', after: '}', turn: 1 }
const comments = [{ id: 'fixture-comment', anchor, text: lang === 'zh' ? '请先校验输入，再返回结果。' : 'Validate the input before returning the result.' }]
localStorage.setItem(`${packageName}:comments:${sessionId}`, JSON.stringify({ version: 1, comments }))
const packet = { package: packageName, version: 1, sessionId, batchId: 'e8f5ec8f-5f0d-4d83-939a-a362d1e9dd97', comments, context: lang === 'zh' ? '仓库 core · service.ts · 新版本 L2\n代码：return validate(input)\n意见：请先校验输入，再返回结果。' : 'Repository core · service.ts · new version L2\nCode: return validate(input)\nOpinion: Validate the input before returning the result.' }
const rawPacket = `<dsh_review package="${packageName}" version="1">\n${JSON.stringify(packet)}\n</dsh_review>\n\n${lang === 'zh' ? '请按这些意见修改。' : 'Please apply these comments.'}`
const oldText = 'export function review(input) {\n  return input\n}\n'
const newText = 'export function review(input) {\n  return validate(input)\n}\n'
const snapshot = observable({ nodes: ['core/service.ts', 'web/service.ts'].map((path, i) => ({ kind: 'tool-result', seq: i + 1, callId: `call-${i}`, isError: false, call: { callId: `call-${i}`, name: 'edit', argsRaw: JSON.stringify({ file_path: path, old_string: oldText, new_string: newText }) } })), turnEnds: new Map([[1, 4]]), partial: null, runningCalls: [] })
const events = observable({ entries: [] })
const inputState = observable({ draft: lang === 'zh' ? '请保持现有接口。' : 'Keep the existing interface.', draftRev: 1, phase: 'plain', occurrences: [], attachmentIds: ['image-fixture'] })
const pending = observable({ pendingSubmissions: [] })
const projects = ['core', 'web'].map(name => ({ name, path: cwd + '/' + name, source: 'manual', available: true, state: 'ready' }))
const remote = {
  workspace: async () => ({ ok: true, value: { project: null, repositories: projects, roots: [cwd], warnings: [] } }),
  recorded: async () => ({ ok: true, value: { mutations: [] } }),
  status: async (request) => ({ ok: true, value: { files: request.files.map(file => ({ path: file.path, state: 'applied', changed: false })) } }),
  userGuideDocument: async (language) => ({ ok: true, value: await (await fetch(`/guide/${language}`)).json() }),
  gitReview: async () => ({ ok: true, value: { repositories: projects, comparisons: ['HEAD -> working tree'], warnings: [], files: projects.map(repo => ({ repository: repo.path, path: 'service.ts', status: 'M', added: 1, removed: 1 })) } }),
  gitReviewDiff: async (request) => ({ ok: true, value: { ...request, diffs: [{ path: request.path, oldText, newText }] } }),
}
const effects: (() => void)[] = []
const seats = new Map<string, { options: any; component: React.ComponentType<any> }>()
const form = Object.assign(observable({ status: 'ready', writable: true, revision: 1, user: { reviewSettings: { layout: 'split', wrap: true, adaptive: true, dock: true, foldMessages: true } }, base: {}, value: { reviewSettings: { layout: 'split', wrap: true, adaptive: true, dock: true, foldMessages: true } } }), {
  async mutate(ops) {
    const next = structuredClone(form.getSnapshot())
    for (const op of ops) { next.value.reviewSettings[op.path[1]] = op.value; next.user.reviewSettings[op.path[1]] = op.value }
    next.revision++; form.set(next); return true
  },
})
const mirror = Object.assign(observable({ view: { namespaces: [{ ns: 'fixture-profile', value: { reviewSettingsOwner: packageName } }] } }), { ensure: async () => {} })
const scope = { get: () => remote, bail: (_ctx, _name, request) => {
  inputState.set({ ...inputState.getSnapshot(), draftRev: inputState.getSnapshot().draftRev + 1, occurrences: [{ ...request.reference, offset: 0, length: request.reference.clipboardText.length }] })
  return true
} }
const binding = { ctx: scope, eventSource: events }
const sessions = { list: observable({ byId: { [sessionId]: { cwd } } }), binding: () => binding, scope: () => scope, sessionOf: () => pending, retainInfo: () => observable({}) }
const Original = ({ node }) => <article data-host-message=""><primitives.MarkdownText text={node.data.content.filter(block => block.type === 'text').map(block => block.text).join('\n')} />
  {node.data.content.filter(block => block.type === 'image').map((_, i) => <span data-host-attachment="" key={i}>📎 image.png</span>)}<time>12:00</time><button data-host-edit="">Edit / resend</button></article>
let source: any
const ctx = {
  get: name => name === 'sessions' ? sessions : name === 'uiConversation' ? ctx.uiConversation : name === 'inputTriggers' ? ctx.inputTriggers : undefined,
  sessions, conversation: { input: { for: () => ({ state: inputState }) } },
  locale: { getSnapshot: () => ({ active: lang }), subscribe: () => () => {}, register: () => () => {} },
  remote: { $mount: async () => () => {} },
  effect: acquire => { const dispose = acquire(); effects.push(dispose); return dispose },
  inject: (_services, apply) => { apply(ctx); return () => {} },
  uiConversation: { events: { register: () => () => {} }, binding: () => ({ snapshot }) },
  sidebarRight: { mounted: { getSnapshot: () => sessionId }, openTab: () => {} },
  sidebarRightTabs: { register: () => () => {} },
  inputTriggers: { registerSource: value => { source = value; return () => { source = undefined } } },
  configForms: { describe: () => mirror, get: () => form },
  slots: {
    entriesOfSlot: () => ['user', 'steering'].map(key => ({ options: { key }, component: Original })),
    inject: (_name, start) => start(),
    register: (options, component) => { const key = `${options.name}:${options.key ?? options.id}`; seats.set(key, { options, component }); return () => seats.delete(key) },
  },
}
const inputActions = { captureInsertion: () => ({ start: 0, end: 0, draftRev: inputState.getSnapshot().draftRev }), insertText: (_text, span) => {
  if (span.end > span.start) inputState.set({ ...inputState.getSnapshot(), occurrences: [] })
  return true
} }
const tab = { visible: true, signal: new AbortController().signal, navigation: { params: {} }, actions: { openResource: () => {} } }
function Fixture() {
  const input = React.useSyncExternalStore(inputState.subscribe, inputState.getSnapshot)
  const formState = React.useSyncExternalStore(form.subscribe, form.getSnapshot)
  const [width, setWidth] = React.useState(820)
  const [page, setPage] = React.useState('review')
  const [folded, setFolded] = React.useState(true)
  const body = seats.get(`sidebar.right.pane.tab:${packageName}:file-review`)!
  const dock = seats.get(`conversation.input.dock:${packageName}:comments`)!
  const setting = seats.get(`plugins.row.config:${packageName}#file-review-tab-multi-git-repository`)!
  const message = seats.get('conversation.chat.node:user')!
  const steering = seats.get('conversation.chat.node:steering')!
  return <>
    <header className="fixture-bar"><strong>{lang === 'zh' ? '插件隔离浏览器验证' : 'Isolated plugin browser verification'}</strong><span>DSH API 0.2.0-rc.2 · Chromium · lib/client.js</span>
      <button onClick={() => setWidth(400)}>400px</button><button onClick={() => setWidth(820)}>820px</button>
      <button onClick={() => setPage('settings')}>Profile</button><button onClick={() => setPage('review')}>Review</button><button onClick={() => setPage('messages')}>Messages</button></header>
    {page === 'review' && <main style={{ width }} id="review-surface"><body.component {...body.options.inject(sessionId)} useTabInfo={() => ({ tab })} /></main>}
    {page === 'settings' && <main id="settings-surface"><setting.component view="page" form={{ ...form, state: formState }} /></main>}
    {page === 'messages' && <main id="messages-surface"><message.component node={{ data: { content: [{ type: 'text', text: folded ? rawPacket : 'An ordinary **Markdown** message.' }, { type: 'image', data: 'fixture' }] } }} />
      <steering.component node={{ data: { content: [{ type: 'text', text: 'Ordinary steering message' }] } }} /><button onClick={() => setFolded(!folded)}>Toggle fixture message</button></main>}
    <footer id="input-surface"><dock.component {...dock.options.inject(sessionId)} inputActions={inputActions} />
      {input.occurrences.map(item => <span data-input-reference="" key={item.ref}>{item.label}</span>)}
      <p data-input-prose="">{input.draft}</p><span data-input-attachment="">📎 image.png</span></footer>
  </>
}
Object.assign(window, { fixture: { form, inputState, seats, effects, source: () => source,
  unmount: () => { root.unmount(); for (const dispose of effects.reverse()) dispose?.() },
} })
let plugin: any
Object.assign(window, { __ModuleLoader__: { load: ({ factory }) => { plugin = factory(name => {
  if (name === 'react') return React
  if (name === 'react/jsx-runtime') return jsx
  if (name === '@deepseek-ai/dsh-client-ui-primitives') return primitives
  throw new Error(`Unexpected runtime import ${name}`)
}) } } })
const script = document.createElement('script'); script.src = '/client.js'; document.head.append(script)
await new Promise<void>((resolve, reject) => { script.onload = () => resolve(); script.onerror = () => reject(new Error('Client load failed')) })
plugin.apply(ctx)
const root = createRoot(document.getElementById('root')!)
root.render(<Fixture />)
