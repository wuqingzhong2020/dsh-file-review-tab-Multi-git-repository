import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, realpath, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, relative, sep } from 'node:path'
import { buildUnifiedHunks } from '../src/client/unified-diff-model.ts'
import { indexDiff } from '../src/client/diff-navigation.ts'
import { rangeReference, formatReviewReference } from '../src/client/review-reference.ts'
import { contextSelection } from '../src/client/review-context-selection.ts'
import { locateReviewReference } from '../src/review-location.ts'
import { findVSCode, launchVSCode, vscodeArguments } from '../src/editor-launch.ts'
import { referenceRequest } from '../src/client/review-file-opener.ts'
import { ReviewDiscussionStore, reconcileDiscussions, parseReviewDiscussions } from '../src/client/review-discussions.ts'
import { ReviewCommentStore, commentAnchorKey } from '../src/client/review-comments.ts'
import { sendReviewComments, ReviewSendFailure } from '../src/client/review-comments-send.ts'
import { rowOffsets, virtualRange } from '../src/client/virtual-diff-model.ts'
import { DEFAULT_DIFF_VIEW, DiffViewStore, parseDiffViewPreferences } from '../src/client/diff-view-preferences.ts'
import { FileReviewService } from '../lib/index.js'
import { MultiGitRepoManager } from 'dsh-multi-git-repo-manager'
import { Context } from '@deepseek-ai/cordis'
import { FILE_REVIEW_INVOCATIONS } from '../src/typert-descriptors.ts'

const target = { scope: 'unstaged', repository: 'D:/core', repositoryName: 'core', path: 'file.py', absolutePath: 'D:/core/file.py' }
const diffs = [{ path: target.path, oldStart: 1, newStart: 1, oldText: 'before\nold\nafter\nend', newText: 'before\nnew\nextra\nafter\nend' }]
const index = indexDiff(buildUnifiedHunks(diffs, 3), 3)
const at = (number, side = 'new', hunk = 0) => index.lines.find(item => item.hunkIndex === hunk && (side === 'old' ? item.line.oldNumber : item.line.newNumber) === number)
const reference = rangeReference(target, index.lines, at(2), at(4), 'new', 'revision', 'source:hunk:0')
const request = referenceRequest(reference)
const disk = 'before\nnew\nextra\nafter\nend'
const storage = () => { const values = new Map(); return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) } }
const comment = { id: 'comment-one', anchor: reference, text: 'Handle this case' }
const discussion = { id: 'discussion-one', requestId: 'request-one', createdAt: 1, comments: [comment], state: 'queued', replies: [], readSeq: 0, resolved: [] }
const event = (type, seq, data) => ({ type: 'event', event: { type, seq, data } })
const user = (rpcId = 'request-one') => ({ id: 'message-one', source: { kind: 'user', rpcId }, content: [{ type: 'text', text: 'review' }] })
const answer = (turn, text, id = 'answer-one', interrupted = false) => ({ turn, message: { id, content: [{ type: 'text', text }, { type: 'reasoning', text: 'hidden reasoning' }] }, interrupted })
test('context actions preserve forward and reversed ranges only on the same side, hunk and file revision', () => {
  for (const [start, end] of [[at(2), at(4)], [at(4), at(2)]]) {
    const selected = { identity: 'file:revision', start, end, side: 'new' }
    assert.equal(contextSelection(selected, selected.identity, at(3), 'new'), selected)
    for (const [identity, location, side] of [['file:revision', at(1), 'new'], ['file:revision', at(2, 'old'), 'old'], ['file:revision', { ...at(3), hunkIndex: 1 }, 'new'], ['other-file:revision', at(3), 'new'], ['file:new-revision', at(3), 'new']]) {
      assert.deepEqual(contextSelection(selected, identity, location, side), { identity, start: location, end: location, side })
    }
  }
  assert.deepEqual(contextSelection(null, 'file:revision', at(2), 'new'), { identity: 'file:revision', start: at(2), end: at(2), side: 'new' })
})
const folder = await mkdtemp(join(tmpdir(), 'dsh-stage-b-'))
const root = await realpath(folder)
const file = join(root, '中文 空格 #%.py')
await writeFile(file, disk.replaceAll('\n', '\r\n'))
after(async () => { assert.ok(relative(tmpdir(), folder).startsWith('dsh-stage-b-') && !relative(tmpdir(), folder).includes(sep)); await rm(folder, { recursive: true, force: true }) })

test('range references select complete continuous rows on one side, including unequal replacements and reversed selections', () => {
  assert.equal(reference.line, 2); assert.equal(reference.endLine, 4); assert.equal(reference.quote, 'new\nextra\nafter')
  assert.equal(reference.before, 'before'); assert.equal(reference.after, 'end')
  assert.deepEqual(rangeReference(target, index.lines, at(4), at(2), 'new', 'revision', 'source:hunk:0'), reference)
  const old = rangeReference(target, index.lines, at(1, 'old'), at(3, 'old'), 'old', 'revision', 'source:hunk:0')
  assert.equal(old.quote, 'before\nold\nafter'); assert.equal(old.endLine, 3)
  assert.equal(rangeReference(target, index.lines, at(2, 'old'), at(3), 'new', 'revision', 'source'), null)
})
test('ranges cannot cross hunks, missing coordinates or the reference size limit', () => {
  const repeated = indexDiff(buildUnifiedHunks([...diffs, ...diffs], 3), 3)
  assert.equal(rangeReference(target, repeated.lines, repeated.lines[0], repeated.lines.at(-1), 'new', 'revision', 'source'), null)
  const broken = index.lines.map(item => item === at(3) ? { ...item, line: { ...item.line, newNumber: 100 } } : item)
  assert.equal(rangeReference(target, broken, broken[0], broken.at(-1), 'new', 'revision', 'source'), null)
  const huge = { ...index.lines[0], line: { ...index.lines[0].line, text: 'x'.repeat(65537) } }
  assert.equal(rangeReference(target, [huge], huge, huge, 'new', 'revision', 'source'), null)
})
test('copies carry exact path, side, provenance and safe fences without writing the composer', () => {
  const output = formatReviewReference({ ...reference, quote: '```\n<script>x</script>' })
  assert.match(output, /D:\/core\/file.py:2-4/); assert.match(output, /unstaged · new · revision/)
  assert.match(output, /````text/); assert.match(output, /<script>x<\/script>/)
  assert.match(formatReviewReference({ ...reference, scope: 'commit', ref: 'abc123 (HEAD)' }), /commit · abc123 \(HEAD\)/)
  assert.notEqual(commentAnchorKey(reference), commentAnchorKey({ ...reference, sourceKey: 'other-hunk' }))
  assert.notEqual(commentAnchorKey(reference), commentAnchorKey({ ...reference, endLine: 5 }))
  assert.notEqual(commentAnchorKey({ ...reference, scope: 'branch', ref: 'main' }), commentAnchorKey({ ...reference, scope: 'branch', ref: 'release' }))
})
test('disk location checks full versions or unique quote plus adjacent context, preserving CRLF coordinates', () => {
  assert.deepEqual(locateReviewReference(disk, request), { state: 'exact', line: 2, endLine: 4 })
  assert.equal(locateReviewReference(disk.replaceAll('\n', '\r\n'), request).state, 'exact')
  assert.deepEqual(locateReviewReference('inserted\n' + disk, request), { state: 'moved', line: 3, endLine: 5 })
  assert.equal(locateReviewReference(disk.replace('extra', 'changed'), request).state, 'changed')
  assert.equal(locateReviewReference(disk + '\n' + disk, request).state, 'ambiguous')
  assert.equal(locateReviewReference(disk + '\n' + disk, { ...request, fullText: disk + '\n' + disk }).state, 'exact')
  assert.equal(locateReviewReference('different\nnew\nextra\nafter\nend', request).state, 'changed')
})
test('invalid ranges, incomplete quotes and unidentified empty lines are rejected', () => {
  for (const patch of [{ line: 0 }, { endLine: 1 }, { line: 1.5 }, { quote: 'one line' }, { quote: 'x'.repeat(65537) }]) assert.equal(locateReviewReference(disk, { ...request, ...patch }).state, 'unsupported')
  assert.equal(locateReviewReference('\n\n', { ...request, line: 1, endLine: 1, quote: '', before: '', after: '' }).state, 'ambiguous')
  assert.equal(locateReviewReference('中'.repeat(30000), { ...request, line: 1, endLine: 1, quote: '中'.repeat(30000) }).state, 'unsupported')
})
test('VS Code launch arguments keep special-character paths as one argv value and reject invalid positions', () => {
  const path = join(tmpdir(), '中文 spaces & # %.py')
  assert.deepEqual(vscodeArguments(path, 12), ['--reuse-window', '--goto', `${path}:12:1`])
  assert.throws(() => vscodeArguments('relative.py', 1)); assert.throws(() => vscodeArguments(path, 0))
})
test('missing or arbitrary executables do not start another application; OS spawn failures reject', async () => {
  assert.equal(await findVSCode(join(tmpdir(), 'cmd.exe')), null)
  assert.equal(await findVSCode('Code.exe'), null)
  const missing = join(tmpdir(), 'dsh-missing-editor', 'Code.exe')
  assert.equal(await findVSCode(missing), null)
  await assert.rejects(launchVSCode(missing, ['--goto', 'file.py:1:1']))
})
test('configured Antigravity IDE is accepted as a VS Code-compatible file; directories and shell scripts are rejected', async () => {
  const executable = join(root, process.platform === 'win32' ? 'Antigravity IDE.exe' : 'code')
  await writeFile(executable, '')
  assert.equal(await findVSCode(executable), executable)
  assert.equal(await findVSCode(join(root, 'antigravity-ide.cmd')), null)
  const directory = join(root, process.platform === 'win32' ? 'Code.exe' : 'Visual Studio Code')
  await mkdir(directory)
  assert.equal(await findVSCode(directory), null)
})
const managerContext = new Context(); after(() => managerContext.fiber.dispose())
const manager = new MultiGitRepoManager(managerContext)
const service = Object.assign(Object.create(FileReviewService.prototype), { repositoryManager: manager })
const agent = { session: { header: { cwd: root } } }
const hostRequest = { ...request, repository: root, path: file }
test('Host line validation handles real files, repository boundaries, missing paths and old-side launch rejection', async () => {
  assert.equal((await service.locateReference(agent, hostRequest)).state, 'exact')
  assert.equal((await service.locateReference(agent, { ...hostRequest, repository: tmpdir() })).state, 'unsupported')
  assert.equal((await service.locateReference(agent, { ...hostRequest, path: join(tmpdir(), 'outside.py') })).state, 'unsupported')
  assert.equal((await service.locateReference(agent, { ...hostRequest, path: join(root, 'deleted.py') })).state, 'missing')
  assert.equal((await service.openEditor(agent, { ...hostRequest, side: 'old' })).reason, 'old')
  assert.equal((await service.openEditor(agent, { ...hostRequest, editorPath: join(root, 'missing', 'Code.exe') })).state, 'editor-missing')
  assert.equal(await import('node:fs/promises').then(fs => fs.readFile(file, 'utf8')), disk.replaceAll('\n', '\r\n'))
})
test('Host rejects invalid UTF-8, folders and references that changed on disk', async () => {
  const binary = join(root, 'binary.py'); await writeFile(binary, Buffer.from([0xff, 0xfe]))
  assert.equal((await service.locateReference(agent, { ...hostRequest, path: binary })).state, 'unsupported')
  assert.equal((await service.locateReference(agent, { ...hostRequest, path: root })).state, 'unsupported')
  assert.equal((await service.locateReference(agent, { ...hostRequest, quote: 'other\nextra\nafter' })).state, 'changed')
  const nul = join(root, 'nul.py'); await writeFile(nul, disk + '\0')
  assert.equal((await service.locateReference(agent, { ...hostRequest, path: nul })).state, 'unsupported')
})
test('carrier failures remain uncertain instead of claiming the host rejected feedback', () => {
  assert.equal(new ReviewSendFailure('gateway/internal').uncertain, true)
  assert.equal(new ReviewSendFailure('gateway/cancelled').uncertain, true)
  assert.equal(new ReviewSendFailure('gateway/bad-request').uncertain, false)
  assert.equal(new ReviewSendFailure('agent/prompt-rejected').uncertain, false)
})
test('external location codecs reject oversized/malformed wire inputs and preserve optional fields', () => {
  const codec = FILE_REVIEW_INVOCATIONS.find(item => item.method === 'openEditor').parameters[1].codec.create()
  assert.equal(codec.parse(hostRequest).side, 'new')
  for (const patch of [{ line: -1 }, { side: 'file' }, { quote: 'x'.repeat(65537) }, { editorPath: 123 }]) assert.equal(codec.safeParse({ ...hostRequest, ...patch }).success, false)
})
test('discussion responses correlate to the exact admitted request and turn, excluding unrelated later messages', () => {
  const events = [event('turn/start', 1, { turn: 1 }), event('user/message', 2, user('unrelated')), event('assistant/message', 3, answer(1, 'not our answer')), event('turn/end', 4, { turn: 1, reason: { kind: 'success' } }), event('turn/start', 5, { turn: 2 }), event('user/message', 6, user()), event('assistant/message', 7, answer(2, 'our answer')), event('turn/end', 8, { turn: 2, reason: { kind: 'success' } }), event('turn/start', 9, { turn: 3 }), event('user/message', 10, user('other')), event('assistant/message', 11, answer(3, 'later unrelated answer'))]
  const own = reconcileDiscussions([discussion], events)[0]
  assert.equal(own.turn, 2); assert.equal(own.userSeq, 6); assert.equal(own.state, 'answered')
  assert.deepEqual(own.replies.map(item => item.text), ['our answer']); assert.doesNotMatch(own.replies[0].text, /reasoning/)
  assert.equal(reconcileDiscussions([discussion], [event('turn/start', 1, { turn: 2 }), event('user/message', 2, { ...user(), source: { kind: 'system', rpcId: discussion.requestId } }), event('assistant/message', 3, answer(2, 'wrong'))])[0].replies.length, 0)
})
test('queued cancellations and interrupted/failed turns have distinct durable outcomes', () => {
  const queued = event('agent/inbox/spliced', 1, { target: 'next-turn', start: 0, inserted: [user()] })
  assert.equal(reconcileDiscussions([{ ...discussion, state: 'unknown' }], [queued])[0].state, 'queued')
  const cancel = event('agent/inbox/spliced', 2, { target: 'next-turn', start: 0, removedCount: 1, inserted: [], outcome: 'canceled' })
  assert.equal(reconcileDiscussions([discussion], [queued, cancel])[0].state, 'cancelled')
  for (const [kind, state] of [['aborted', 'cancelled'], ['interrupted', 'cancelled'], ['error', 'failed'], ['success', 'completed']]) {
    assert.equal(reconcileDiscussions([discussion], [event('turn/start', 3, { turn: 4 }), event('user/message', 4, user()), event('turn/end', 5, { turn: 4, reason: { kind } })])[0].state, state)
  }
  const stopped = reconcileDiscussions([discussion], [event('turn/start', 3, { turn: 4 }), event('user/message', 4, user()), event('assistant/message', 5, answer(4, 'partial', 'partial', true)), event('turn/end', 6, { turn: 4, reason: { kind: 'aborted' } })])[0]
  assert.equal(stopped.replies[0].interrupted, true); assert.equal(stopped.replies[0].text, 'partial')
})
test('discussion storage preserves opinions, answers, read/resolved states and isolates session keys', () => {
  const disk = storage(), store = new ReviewDiscussionStore(disk, 'a')
  const id = store.begin([comment], 'request-one'); store.settle(id, 'queued')
  store.reconcile([event('turn/start', 1, { turn: 1 }), event('user/message', 2, user()), event('assistant/message', 3, answer(1, 'response'))])
  store.read(id); store.resolve(id, comment.id, true)
  const reopened = new ReviewDiscussionStore(disk, 'a').getSnapshot().records[0]
  assert.equal(reopened.readSeq, 3); assert.deepEqual(reopened.resolved, [comment.id]); assert.equal(reopened.replies[0].text, 'response')
  assert.equal(new ReviewDiscussionStore(disk, 'b').getSnapshot().records.length, 0)
  store.resolve(id, comment.id, false); assert.deepEqual(store.getSnapshot().records[0].resolved, [])
})
test('restart does not resend uncertain submissions; history cuts keep established identities and replies', () => {
  const disk = storage(), store = new ReviewDiscussionStore(disk, 'a'); store.begin([comment], 'request-one')
  assert.equal(new ReviewDiscussionStore(disk, 'a').getSnapshot().records[0].state, 'unknown')
  const old = { ...discussion, state: 'running', turn: 7, userSeq: 5 }
  const known = reconcileDiscussions([old], [event('assistant/message', 10, answer(7, 'recovered')), event('assistant/message', 11, answer(8, 'unrelated'))])[0]
  assert.deepEqual(known.replies.map(item => item.text), ['recovered'])
  assert.equal(reconcileDiscussions([discussion], [event('assistant/message', 10, answer(7, 'no admission'))])[0].replies.length, 0)
})
test('bad storage and malformed ranges produce visible storage errors while keeping records usable', () => {
  const store = new ReviewDiscussionStore({ getItem: () => '{bad', setItem: () => { throw new Error('quota') } }, 'a')
  assert.equal(store.getSnapshot().storageError, true); store.begin([comment], 'request-one'); assert.equal(store.getSnapshot().records.length, 1)
  assert.throws(() => parseReviewDiscussions(JSON.stringify({ version: 1, records: [{ ...discussion, comments: [{ ...comment, anchor: { ...reference, endLine: 1 } }] }] })))
})
test('identified review submission persists request identity before sending and leaves the composer alone', async () => {
  const calls = [], scope = { conversation: { send: async () => { throw new Error('unidentified fallback') } } }
  const session = { beginSubmission: () => ({ requestId: 'rpc-exact', abandon: () => calls.push('abandon') }), prompt: async (content, mode, _signal, id) => { calls.push({ content, mode, id }); return { ok: true, value: { accepted: true } } } }
  const ctx = { sessions: { scope: () => scope, sessionOf: () => session } }
  await sendReviewComments(ctx, 's', 'feedback', id => calls.push({ prepared: id }))
  assert.deepEqual(calls, [{ prepared: 'rpc-exact' }, { content: [{ type: 'text', text: 'feedback' }], mode: 'queue', id: 'rpc-exact' }])
  session.prompt = async () => ({ ok: false, error: { code: 'denied' } })
  await assert.rejects(sendReviewComments(ctx, 's', 'feedback', () => {}), /denied/); assert.equal(calls.at(-1), 'abandon')
})
test('late durable admission removes only exactly accepted drafts and preserves subsequently edited feedback', () => {
  const store = new ReviewCommentStore(storage(), 'a'); store.save(reference, 'original')
  const batch = store.getSnapshot().comments
  store.save(reference, 'edited', batch[0].id); store.acknowledge(batch)
  assert.equal(store.getSnapshot().comments[0].text, 'edited')
  store.acknowledge(store.getSnapshot().comments); assert.equal(store.getSnapshot().comments.length, 0)
})
test('variable-height virtual windows cover measured comments and bound rendering across 20,000 rows', () => {
  const offsets = rowOffsets(20000, 22, new Map([[0, 300], [40, 120]]))
  assert.equal(offsets[1], 300); assert.equal(offsets[41] - offsets[40], 120)
  for (const top of [0, 400, 220000, offsets.at(-1) - 600]) {
    const range = virtualRange(offsets, top, 600)
    assert.ok(range.end - range.start < 60); assert.ok(offsets[range.start] <= top)
    assert.ok(offsets[range.end] >= Math.min(top + 600, offsets.at(-1)))
  }
  assert.deepEqual(virtualRange([0], 0, 600), { start: 0, end: 0 })
})
test('appearance and shortcut settings migrate, validate and survive reopening without losing previous display choices', () => {
  const disk = storage(), store = new DiffViewStore(disk)
  store.set({ fontSize: 18, lineHeight: 2, tabSize: 2, fontFamily: 'cascadia', colors: 'blue-orange', colorStrength: 30, editorPath: ' D:/Apps/VS Code/Code.exe ', searchShortcut: 'mod+shift+f', changeShortcut: 'alt+arrow', virtualize: false, discussionEnabled: false })
  assert.deepEqual(new DiffViewStore(disk).getSnapshot(), store.getSnapshot()); assert.equal(store.getSnapshot().editorPath, 'D:/Apps/VS Code/Code.exe')
  const malformed = parseDiffViewPreferences(JSON.stringify({ ...DEFAULT_DIFF_VIEW, fontSize: 500, lineHeight: -1, tabSize: 0, colorStrength: 90, fontFamily: 'url(evil)', colors: 'invalid', searchShortcut: 'f', changeShortcut: 'enter' }))
  assert.deepEqual(malformed, DEFAULT_DIFF_VIEW)
  assert.deepEqual(parseDiffViewPreferences('{"layout":"split","wrap":false}'), { ...DEFAULT_DIFF_VIEW, layout: 'split', wrap: false })
})
