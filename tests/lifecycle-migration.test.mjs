import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile, rm, realpath, symlink, lstat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, relative, sep } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import { Session } from '@deepseek-ai/dsh-session'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'
import Tools, { defineTool } from '@deepseek-ai/dsh-tools'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import * as repositoryManager from 'dsh-multi-git-repo-manager'
import { apply, inject, FileReviewService } from '../lib/index.js'
import { lifecycleFromContent, boundedLifecycle, MARKER_MAX_BYTES } from '../src/lifecycle-record.ts'
import { applyLifecycle, captureImage } from '../src/file-lifecycle.ts'
import { inspectReviewFile } from '../src/file-review-files.ts'
const require = createRequire(import.meta.url)
const toolRequire = createRequire(require.resolve('@deepseek-ai/dsh-tools'))
const { createToolResultMessage } = await import(pathToFileURL(toolRequire.resolve('@deepseek-ai/dsh-llm')))

async function fixture(run, { ptc = false, programFail = false } = {}) {
  const folder = await mkdtemp(join(tmpdir(), 'dsh-lifecycle-migration-'))
  const root = await realpath(folder)
  const ctx = new Context()
  try {
    await ctx.plugin(SystemPrompt, { persona: '' })
    if (ptc) ctx.provide('ptcRuntime', {
      language: 'typescript', isolation: 'test-fixture', resolve: request => request,
      // The substrate is isolated here; dispatch, acceptance and persistence use the real Tools bridge.
      async run(spec) {
        const results = []
        for (const args of JSON.parse(spec.program)) {
          try { results.push(await spec.bindings[0].functions.fixture_write(args)) }
          catch (error) { results.push(String(error)) }
        }
        return programFail ? { logs: [], error: { kind: 'runtime', message: 'fixture program failure' } } : { logs: [], value: results }
      },
    })
    await ctx.plugin(Tools, { mode: ptc ? 'both' : 'native' })
    await ctx.plugin(repositoryManager, { projects: [] }).await()
    const mounted = ctx.plugin({ apply, inject }, { projects: [] })
    await mounted.await()
    const session = Session.create('fixture-session', [], { ...Session.create('fixture-session').header, cwd: root })
    const agent = { id: 'fixture-session', session, runMaintenance: fn => fn() }
    ctx.tools.register(defineTool({
      name: 'fixture_write', description: 'isolated file write',
      parameters: { path: { type: 'string', required: true }, text: { type: 'string', required: true } },
      output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] },
      presentCall: args => ({ card: 'diff', title: 'Write', diffs: [{ path: args.path, oldText: null, newText: args.text }] }),
      execute: async args => {
        await writeFile(join(root, args.path), args.text)
        if (args.text === 'FAIL') throw new Error('Fixture failure after writing')
        return args.path
      },
    }))
    let seq = 0
    const mutate = async (path, text) => {
      const callId = `call-${seq++}`, rootCallId = callId
      session.append('tool/call', { turn: 1, step: 1, callId, name: 'fixture_write', arguments: { path, text } })
      const result = await ctx.tools.execute({ name: 'fixture_write', callId, rootCallId, arguments: { path, text }, agent, signal: new AbortController().signal })
      assert.equal(result.isError, false, JSON.stringify(result))
      const records = lifecycleFromContent(result.content)
      assert.equal(records.length, 1)
      session.append('tool/result', { turn: 1, step: 1, message: createToolResultMessage({ callId, content: result.content, isError: false }) }, { surfaceOp: 'append' })
      return records[0]
    }
    await run({ ctx, root, agent, events: session.snapshotEvents(), mutate })
  } finally {
    await ctx.fiber.dispose()
    const child = relative(tmpdir(), folder)
    assert.ok(child.startsWith('dsh-lifecycle-migration-') && !child.includes(sep))
    await rm(folder, { recursive: true, force: true })
  }
}

for (const text of ['', 'hello\r\nworld\r\n', 'hello\nworld']) {
  test(`trusted creation supports exact bytes, empty files and idempotent undo/redo: ${JSON.stringify(text)}`, () => fixture(async ({ root, mutate }) => {
    const record = await mutate('new.txt', text)
    assert.equal(record.before, null); assert.equal(record.after.text, text)
    const identities = new Map()
    assert.equal((await applyLifecycle(root, 'new.txt', [root], [record], 'undo', identities)).changed, true)
    assert.equal((await applyLifecycle(root, 'new.txt', [root], [record], 'undo', identities)).changed, false)
    assert.equal((await applyLifecycle(root, 'new.txt', [root], [record], 'redo', identities)).changed, true)
    assert.equal(await readFile(join(root, 'new.txt'), 'utf8'), text)
    assert.equal((await applyLifecycle(root, 'new.txt', [root], [record], 'redo', identities)).changed, false)
    assert.equal((await applyLifecycle(root, 'new.txt', [root], [record], 'undo', identities)).changed, true)
  }))
}

test('a batch shares one durable replay for status and one for apply', () => fixture(async ({ ctx, agent, mutate }) => {
  const records = [await mutate('a.txt', 'a'), await mutate('b.txt', 'b')]
  const request = {
    action: 'undo',
    files: records.map(record => ({
      path: record.path,
      diffs: [{ path: record.path, recordId: record.recordId, oldText: null, newText: record.after.text }],
    })),
  }
  const snapshotEvents = agent.session.snapshotEvents.bind(agent.session)
  let replays = 0
  agent.session.snapshotEvents = () => { replays++; return snapshotEvents() }
  const status = await ctx.fileReview.status(agent, request)
  assert.deepEqual(status.files.map(file => file.state), ['applied', 'applied'])
  assert.equal(replays, 1)
  const applied = await ctx.fileReview.apply(agent, request)
  assert.deepEqual(applied.files.map(file => file.state), ['undone', 'undone'])
  assert.equal(replays, 2)
}))

test('creation followed by editing reverses the entire verified sequence and detects outside changes', () => fixture(async ({ root, mutate }) => {
  const create = await mutate('file.txt', 'one\r\n'), edit = await mutate('file.txt', 'two\r\n')
  const records = [create, edit]
  assert.equal((await applyLifecycle(root, 'file.txt', [root], records)).state, 'applied')
  await writeFile(join(root, 'file.txt'), 'external')
  assert.equal((await applyLifecycle(root, 'file.txt', [root], records, 'undo')).state, 'conflict')
  assert.equal(await readFile(join(root, 'file.txt'), 'utf8'), 'external')
  await writeFile(join(root, 'file.txt'), 'two\r\n')
  assert.equal((await applyLifecycle(root, 'file.txt', [], records, 'undo')).state, 'error')
  assert.equal((await applyLifecycle(root, 'file.txt', [root], records, 'undo')).state, 'undone')
  await writeFile(join(root, 'file.txt'), 'occupied')
  assert.equal((await applyLifecycle(root, 'file.txt', [root], records, 'redo')).state, 'conflict')
}))

test('real official run_code bridge persists accepted nested identities and excludes failed dispatches', () => fixture(async ({ ctx, agent, root }) => {
  const callId = 'ptc-root'
  const arguments_ = { description: 'Fixture nested changes', code: JSON.stringify([
    { path: 'nested.txt', text: 'one' }, { path: 'nested.txt', text: 'two' }, { path: 'failed.txt', text: 'FAIL' },
  ]) }
  agent.session.append('tool/call', { turn: 1, step: 1, callId, name: 'run_code', arguments: arguments_ })
  const result = await ctx.tools.execute({ name: 'run_code', callId, arguments: arguments_, agent, signal: new AbortController().signal })
  assert.equal(result.isError, false, JSON.stringify(result))
  agent.session.append('tool/result', { turn: 1, step: 1, message: createToolResultMessage({ callId, content: result.content, isError: false }) }, { surfaceOp: 'append' })
  const events = agent.session.snapshotEvents().filter(event => event.type === 'tool/ptc-dispatch')
  assert.equal(events.length, 3)
  assert.equal(lifecycleFromContent(events[0].data.content).length, 1)
  assert.equal(lifecycleFromContent(events[2].data.content).length, 0)
  assert.equal(events[2].data.isError, true)
  const durable = JSON.parse(JSON.stringify(agent.session.snapshotEvents()))
  const restored = { ...agent, session: Session.create(agent.session.id, durable, agent.session.header) }
  const other = new Context(), replay = new FileReviewService(other, new repositoryManager.MultiGitRepoManager(other))
  try {
    const mutations = (await replay.recorded(restored, { rootCallIds: [callId] })).mutations
    assert.equal(mutations.length, 2)
    assert.notEqual(mutations[0].recordId, mutations[1].recordId)
    assert.equal(mutations[1].before, 'one'); assert.equal(mutations[1].after, 'two')
    const files = [{ path: 'nested.txt', diffs: mutations.map(item => ({ path: item.path, oldText: item.before, newText: item.after, recordId: item.recordId })) }]
    assert.equal((await replay.apply(restored, { action: 'undo', files })).files[0].state, 'undone')
    assert.equal(await readFile(join(root, 'failed.txt'), 'utf8'), 'FAIL')
  } finally { await other.fiber.dispose() }
}, { ptc: true }))

test('failed, aborted and post-policy replaced tool results cannot authorize lifecycle writes', () => fixture(async ({ ctx, agent }) => {
  const execute = (text, signal = new AbortController().signal) => ctx.tools.execute({ name: 'fixture_write', callId: text, arguments: { path: 'policy.txt', text }, agent, signal })
  const failed = await execute('FAIL')
  assert.equal(failed.isError, true); assert.deepEqual(lifecycleFromContent(failed.content), [])
  const controller = new AbortController(); controller.abort('fixture cancel')
  const aborted = await execute('ABORT', controller.signal)
  assert.equal(aborted.isError, true); assert.deepEqual(lifecycleFromContent(aborted.content), [])
  const off = ctx.on('tools/post-execute', async (exec, result, next) => exec.callId === 'REPLACED' ? { kind: 'accept', value: 'replacement' } : next())
  const replaced = await execute('REPLACED')
  assert.deepEqual(lifecycleFromContent(replaced.content), [])
  assert.deepEqual(ctx.fileReview.lifecycleRecords(agent), [])
  off()
}))

test('a failing PTC program retains previously accepted nested file records', () => fixture(async ({ ctx, agent }) => {
  const callId = 'failed-program'
  const arguments_ = { description: 'Program fails after accepted write', code: JSON.stringify([{ path: 'accepted.txt', text: 'accepted' }]) }
  agent.session.append('tool/call', { turn: 1, step: 1, callId, name: 'run_code', arguments: arguments_ })
  const result = await ctx.tools.execute({ name: 'run_code', callId, arguments: arguments_, agent, signal: new AbortController().signal })
  assert.equal(result.isError, true)
  agent.session.append('tool/result', { turn: 1, step: 1, message: createToolResultMessage({ callId, content: result.content, isError: true }) }, { surfaceOp: 'append' })
  assert.equal((await ctx.fileReview.recorded(agent, { rootCallIds: [callId] })).mutations[0].after, 'accepted')
}, { ptc: true, programFail: true }))

test('only complete Host-owned identities authorize lifecycle writes, including after durable JSON replay', () => fixture(async ({ root, agent, mutate }) => {
  const record = await mutate('replay.txt', 'persisted')
  const replayContext = new Context()
  const replay = new FileReviewService(replayContext, new repositoryManager.MultiGitRepoManager(replayContext))
  const durable = JSON.parse(JSON.stringify(agent.session.snapshotEvents()))
  agent.session = Session.create(agent.session.id, durable, agent.session.header)
  const file = { path: record.path, diffs: [{ path: record.path, oldText: null, newText: record.after.text, recordId: record.recordId }] }
  const request = { action: 'undo', files: [file] }
  assert.equal((await replay.recorded(agent, { rootCallIds: [record.rootCallId] })).mutations.length, 1)
  assert.equal((await replay.apply(agent, request)).files[0].state, 'undone')
  assert.equal((await replay.apply(agent, { ...request, action: 'redo' })).files[0].state, 'applied')
  assert.equal((await replay.apply(agent, { ...request, files: [{ ...file, diffs: [{ ...file.diffs[0], newText: 'forged' }] }] })).files[0].state, 'unsupported')
  assert.equal((await inspectReviewFile(root, { path: 'replay.txt', diffs: [{ path: 'replay.txt', oldText: null, newText: 'persisted' }] }, [root])).state, 'unsupported')
  await replayContext.fiber.dispose()
}))

test('marker budgets retain an explicit incomplete path and unknown schemas are ignored', () => fixture(async ({ root, mutate }) => {
  const record = await mutate('large.txt', 'x'.repeat(MARKER_MAX_BYTES))
  assert.equal(record.complete, false); assert.equal(record.after, null)
  assert.equal((await applyLifecycle(root, 'large.txt', [root], [record], 'undo')).state, 'unsupported')
  assert.equal((await lstat(join(root, 'large.txt'))).size, MARKER_MAX_BYTES)
  assert.deepEqual(lifecycleFromContent([{ type: 'text', text: '', dshFileReviewMultiRepository: { ...record, schemaVersion: 99 } }]), [])
  assert.equal(boundedLifecycle(record).recordId, record.recordId)
}))

test('durable native records survive a fresh Node process with no in-memory recorder', () => fixture(async ({ root, agent, mutate }) => {
  const record = await mutate('fresh-process.txt', 'exact\r\n')
  const file = { path: record.path, diffs: [{ path: record.path, oldText: null, newText: record.after.text, recordId: record.recordId }] }
  for (const action of ['undo', 'redo']) {
    const child = spawnSync(process.execPath, ['tests/fixtures/replay-lifecycle.mjs'], { cwd: process.cwd(), input: JSON.stringify({ header: agent.session.header, events: agent.session.snapshotEvents(), request: { action, files: [file] } }), encoding: 'utf8' })
    assert.equal(child.status, 0, child.stderr)
    assert.equal(JSON.parse(child.stdout).files[0].state, action === 'undo' ? 'undone' : 'applied')
  }
  assert.equal(await readFile(join(root, record.path), 'utf8'), 'exact\r\n')
}))

test('filesystem links, missing parents and non-UTF8 contents cannot become trusted images', () => fixture(async ({ root, mutate }) => {
  const record = await mutate('target.txt', 'safe')
  await symlink(root, join(root, 'link.txt'), 'junction')
  assert.equal((await applyLifecycle(root, 'link.txt', [root], [record], 'undo')).state, 'unsupported')
  await assert.rejects(captureImage(join(root, 'link.txt')), /symbolic/)
  await writeFile(join(root, 'binary'), Buffer.from([0xff, 0]))
  await assert.rejects(captureImage(join(root, 'binary')), /UTF-8/)
  assert.equal((await applyLifecycle(root, 'missing/path', [root], [record], 'redo')).state, 'error')
}))
