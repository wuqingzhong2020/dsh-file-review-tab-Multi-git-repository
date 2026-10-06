/** Isolated browser capability fixture. It loads lib/client.js, never a copied plugin implementation. */
import * as React from 'react'
import * as jsx from 'react/jsx-runtime'
import { createRoot } from 'react-dom/client'
import * as primitives from '@deepseek-ai/dsh-client-ui-primitives'

const packageName = 'dsh-file-review-tab-multi-git-repository'
const managerPackage = 'dsh-multi-git-repo-manager'
const sessionId = 'browser-fixture'
const cwd = 'D:/fixture'
const lang = new URLSearchParams(location.search).get('lang') || 'zh'
const managed = new URLSearchParams(location.search).get('managed') === '1'
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
const snapshot = observable({ nodes: [...['core/service.ts', 'web/service.ts'], ...(managed ? ['local/plain.ts', 'unknown/unmanaged.ts'] : [])].map((path, i) => ({ kind: 'tool-result', seq: i + 1, callId: `call-${i}`, isError: false, call: { callId: `call-${i}`, name: 'edit', argsRaw: JSON.stringify({ file_path: path, old_string: oldText, new_string: newText }) } })), turnEnds: new Map([[1, 4]]), partial: null, runningCalls: [] })
const events = observable({ entries: [] })
const inputState = observable({ draft: lang === 'zh' ? '请保持现有接口。' : 'Keep the existing interface.', draftRev: 1, phase: 'plain', occurrences: [], attachmentIds: ['image-fixture'] })
const pending = observable({ pendingSubmissions: [] })
const projects = ['core', 'web'].map(name => ({ name, relativePath: name, path: cwd + '/' + name, source: 'manual', available: true, state: 'ready' }))
let savedProject = { name: 'fixture', root: cwd, enabled: true, includeProjectRoot: false,
  repositories: projects.map(repo => ({ name: repo.name, path: repo.relativePath })),
  directories: managed ? [{ name: 'Local', path: 'local' }] : [], discovery: { containers: [] } }
let temporaryTargets = []
let applyPaths: string[] = []
let workspaceReads = 0
let fileRevision = 'fixture-file-revision'
const managerWorkspace = () => {
  const targets = [
    ...savedProject.repositories.map(entry => ({ ...entry, path: cwd + '/' + entry.path, relativePath: entry.path, source: 'config', state: 'ready', kind: 'git', capabilities: { git: true } })),
    ...savedProject.directories.map(entry => ({ ...entry, path: cwd + '/' + entry.path, relativePath: entry.path, source: 'config', state: 'ready', kind: 'directory', capabilities: { git: false } })),
    ...temporaryTargets.map(entry => ({ ...entry, relativePath: entry.path, source: 'temporary', state: 'ready', capabilities: { git: entry.kind === 'git' } })),
  ].map(target => ({ ...target, id: target.path }))
  return { project: savedProject, targets, repositories: targets.filter(target => target.kind === 'git'),
    roots: targets.map(target => target.path), warnings: [], boundaries: [], workspaceRevision: JSON.stringify(targets) }
}
const projectPage = () => ({ project: structuredClone(savedProject), revision: 1, configured: true,
  workspace: managerWorkspace(), fileRevision, temporaryTargets: structuredClone(temporaryTargets) })
const managerRemote = {
  workspace: async () => { workspaceReads++; return { ok: true, value: managerWorkspace() } },
  project: async () => ({ ok: true, value: projectPage() }),
  saveProject: async request => {
    savedProject = { ...request.project,
      repositories: request.project.repositories.filter(entry => !entry.path.includes(':')),
      directories: request.project.directories.filter(entry => !entry.path.includes(':')) }
    fileRevision += '-saved'
    return { ok: true, value: projectPage() }
  },
  resolveTargetPaths: async paths => ({ ok: true, value: paths.map(input => {
    const target = [...managerWorkspace().targets].sort((a, b) => b.path.length - a.path.length).find(target => input.startsWith(target.path + '/'))
    return { input, path: input, state: target ? 'managed' : 'unmanaged', ...(target ? { target } : {}) }
  }) }),
  discoverTargets: async () => ({ ok: true, value: { candidates: [{ id: 'discovered', name: 'Discovered', kind: 'directory', path: cwd + '/project/ordinary', relativePath: 'project/ordinary', source: 'discovery', state: 'ready', capabilities: { git: false } }], warnings: [] } }),
  setTemporaryTargets: async entries => { temporaryTargets = entries; return { ok: true, value: managerWorkspace() } },
  directoryStart: async path => ({ ok: true, value: path ? cwd + '/' + path : cwd }),
}
const remote = {
  apply: async request => { applyPaths = request.files.map(file => file.path); return { ok: true, value: { files: request.files.map(file => ({ path: file.path, state: request.action === 'undo' ? 'undone' : 'applied', changed: true })) } } },
  recorded: async () => ({ ok: true, value: { mutations: [] } }),
  status: async (request) => ({ ok: true, value: { files: request.files.map(file => ({ path: file.path, state: 'applied', changed: false })) } }),
  userGuideDocument: async (language) => ({ ok: true, value: await (await fetch(`/guide/${language}`)).json() }),
  gitReview: async () => ({ ok: true, value: { repositories: projects, comparisons: ['HEAD -> working tree'], warnings: [], files: projects.map(repo => ({ repository: repo.path, path: 'service.ts', status: 'M', added: 1, removed: 1 })) } }),
  gitReviewDiff: async (request) => ({ ok: true, value: { ...request, diffs: [{ path: request.path, oldText, newText }] } }),
}
const effects: (() => void)[] = []
const seats = new Map<string, { options: any; component: React.ComponentType<any> }>()
const tabTypes = new Map<string, any>()
let openNativeTab: ((kind: string) => void) | undefined
const form = Object.assign(observable({ status: 'ready', writable: true, revision: 1, user: { reviewSettings: { layout: 'split', wrap: true, adaptive: true, dock: true, foldMessages: true } }, base: {}, value: { reviewSettings: { layout: 'split', wrap: true, adaptive: true, dock: true, foldMessages: true } } }), {
  async mutate(ops) {
    const next = structuredClone(form.getSnapshot())
    for (const op of ops) { next.value.reviewSettings[op.path[1]] = op.value; next.user.reviewSettings[op.path[1]] = op.value }
    next.revision++; form.set(next); return true
  },
})
const mirror = Object.assign(observable({ view: { namespaces: [{ ns: 'fixture-profile', value: { reviewSettingsOwner: packageName } }] } }), { ensure: async () => {} })
const scope = { get: name => name === 'remote.multiGitFileReviewByWqz' ? remote : name === 'remote.multiGitRepoManagerByWqz' ? managerRemote : undefined, bail: (_ctx, _name, request) => {
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
  sidebarRight: { mounted: { getSnapshot: () => sessionId }, openTab: kind => openNativeTab?.(kind) },
  sidebarRightTabs: { register: definition => { tabTypes.set(definition.kind, definition); return () => tabTypes.delete(definition.kind) } },
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
  const [visitedRepositories, setVisitedRepositories] = React.useState(false)
  const [folded, setFolded] = React.useState(true)
  const body = seats.get(`sidebar.right.pane.tab:${packageName}:file-review`)!
  const dock = seats.get(`conversation.input.dock:${packageName}:comments`)!
  const setting = seats.get(`plugins.row.config:${packageName}#file-review-tab-multi-git-repository`)!
  const message = seats.get('conversation.chat.node:user')!
  const steering = seats.get('conversation.chat.node:steering')!
  const managerType = tabTypes.get('multi-git-repo-manager')!
  const repositories = seats.get(`sidebar.right.pane.tab:${managerType.id}`)!
  const repositoryTitle = seats.get(`sidebar.right.pane.tab.title:${managerType.id}`)!
  React.useEffect(() => {
    openNativeTab = kind => {
      if (kind === managerType.kind) { setVisitedRepositories(true); setPage('repositories') }
      else if (kind === 'file-review') setPage('review')
    }
    return () => { openNativeTab = undefined }
  }, [managerType.kind])
  return <>
    <header className="fixture-bar"><strong>{lang === 'zh' ? '插件隔离浏览器验证' : 'Isolated plugin browser verification'}</strong><span>DSH API 0.2.0-rc.2 · Chromium · lib/client.js</span>
      <button onClick={() => setWidth(400)}>400px</button><button onClick={() => setWidth(820)}>820px</button>
      <button onClick={() => setPage('settings')}>Profile</button><button onClick={() => setPage('review')}>Review</button><button onClick={() => setPage('messages')}>Messages</button>
      <span id="start-guides">{managerType.guide.map(entry => <button key={entry.id}
        onClick={() => ctx.sidebarRight.openTab(managerType.kind)} title={entry.description()}>{entry.title()}</button>)}</span></header>
    {page === 'review' && <main style={{ width }} id="review-surface"><body.component {...body.options.inject(sessionId)} useTabInfo={() => ({ tab })} /></main>}
    {page === 'settings' && <main id="settings-surface"><setting.component view="page" form={{ ...form, state: formState }} /></main>}
    {visitedRepositories && <main id="repositories-pane" style={{ width, height: 660, display: page === 'repositories' ? 'block' : 'none' }}>
      <div role="tablist"><button role="tab" aria-selected={page === 'repositories'}><repositoryTitle.component /></button></div>
      <div id="repositories-surface" style={{ height: 624 }}><repositories.component {...repositories.options.inject(sessionId)} useTabInfo={() => ({ tab })} /></div>
    </main>}
    {page === 'messages' && <main id="messages-surface"><message.component node={{ data: { content: [{ type: 'text', text: folded ? rawPacket : 'An ordinary **Markdown** message.' }, { type: 'image', data: 'fixture' }] } }} />
      <steering.component node={{ data: { content: [{ type: 'text', text: 'Ordinary steering message' }] } }} /><button onClick={() => setFolded(!folded)}>Toggle fixture message</button></main>}
    <footer id="input-surface"><dock.component {...dock.options.inject(sessionId)} inputActions={inputActions} />
      {input.occurrences.map(item => <span data-input-reference="" key={item.ref}>{item.label}</span>)}
      <p data-input-prose="">{input.draft}</p><span data-input-attachment="">📎 image.png</span></footer>
  </>
}
Object.assign(window, { fixture: { form, inputState, seats, tabTypes, effects, source: () => source,
  workspaceReads: () => workspaceReads, projectPage, applyPaths: () => applyPaths, temporaryTargets: () => temporaryTargets,
  unmount: () => { root.unmount(); for (const dispose of effects.reverse()) dispose?.() },
} })
const plugins = new Map<string, any>()
Object.assign(window, { __ModuleLoader__: { load: ({ id, factory }) => { plugins.set(id, factory(name => {
  if (name === 'react') return React
  if (name === 'react/jsx-runtime') return jsx
  if (name === '@deepseek-ai/dsh-client-ui-primitives') return primitives
  throw new Error(`Unexpected runtime import ${name}`)
})) } } })
for (const url of ['/manager-client.js', '/client.js']) {
  const script = document.createElement('script'); script.src = url; document.head.append(script)
  await new Promise<void>((resolve, reject) => { script.onload = () => resolve(); script.onerror = () => reject(new Error('Client load failed')) })
}
plugins.get(managerPackage).apply(ctx)
plugins.get(packageName).apply(ctx)
Object.assign(window.fixture, { managerPlugin: plugins.get(managerPackage) })
const root = createRoot(document.getElementById('root')!)
root.render(<Fixture />)
