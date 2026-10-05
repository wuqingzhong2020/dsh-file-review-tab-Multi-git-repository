import { test } from 'node:test'
import { Context } from '@deepseek-ai/cordis'
import { parseReviewPacket } from '../src/client/review-comment-packet.ts'
import assert from 'node:assert/strict'
import { attachLocale, t } from '../src/client/locales.ts'
import { ReviewCommentStore, fileCommentAnchor } from '../src/client/review-comments.ts'
import { ReviewDiscussionStore } from '../src/client/review-discussions.ts'
import { ReviewSendFailure } from '../src/client/review-comments-send.ts'
import {
  formatReviewSubmission,
  submitReviewCommentBatch,
} from '../src/client/review-comment-submission.ts'

const anchor = fileCommentAnchor({
  scope: 'unstaged',
  repository: 'D:/core',
  repositoryName: 'core',
  path: 'example.py',
  absolutePath: 'D:/core/example.py',
})
const storage = () => {
  const values = new Map()
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
}
function stores() {
  const memory = storage()
  const drafts = new ReviewCommentStore(memory, 'drafts')
  const discussions = new ReviewDiscussionStore(memory, 'discussions')
  drafts.save(anchor, 'Please explain this file')
  return { memory, drafts, discussions }
}
function sessionContext({ prompt, send = async () => {}, abandon = () => {} }) {
  const scope = {
    get: name => name === 'conversation' ? { send } : undefined,
    get conversation() { throw new Error('cannot get property "conversation" without inject') },
  }
  const session = prompt
    ? {
        beginSubmission: () => ({ requestId: 'rpc-reviewed-batch', abandon }),
        prompt,
      }
    : undefined
  return { sessions: { scope: () => scope, sessionOf: () => session } }
}
function submit(drafts, discussions, ctx, discussionEnabled = true) {
  return drafts.submit(comments =>
    submitReviewCommentBatch({
      ctx,
      sessionId: 'review-session',
      comments,
      discussions: discussions.getSnapshot().records,
      discussionStore: discussions,
      discussionEnabled,
    }),
  )
}

test('follow-up formatting includes each parent once, keeps opinions, and bounds parent responses in both languages', () => {
  const parent = {
    id: 'parent',
    requestId: 'original',
    createdAt: 1,
    state: 'answered',
    readSeq: 0,
    resolved: [],
    comments: [{ id: 'old-opinion', anchor, text: 'Original opinion' }],
    replies: [
      { id: 'reply', seq: 3, text: 'R'.repeat(20_000) + 'TRUNCATED_TAIL', interrupted: false },
    ],
  }
  const comments = [
    { id: 'first', anchor, text: 'Follow-up one', discussionId: parent.id },
    { id: 'second', anchor, text: 'Follow-up two', discussionId: parent.id },
    { id: 'missing', anchor, text: 'Missing parent still submits', discussionId: 'missing-parent' },
  ]
  for (const active of ['zh', 'en']) {
    const dispose = attachLocale({ getSnapshot: () => ({ active }) })
    try {
      const message = formatReviewSubmission(comments, [parent])
      assert.ok(message.startsWith(t('commentPrompt')))
      assert.equal(message.split('Original opinion').length - 1, 1)
      assert.ok(message.includes('Follow-up one') && message.includes('Follow-up two'))
      assert.ok(message.includes('Missing parent still submits'))
      assert.ok(message.endsWith('R'.repeat(20_000)))
      assert.ok(!message.includes('TRUNCATED_TAIL'))
    } finally {
      dispose()
    }
  }
})

test('identified submission persists batch identity before prompting and clears only after acceptance', async () => {
  const { memory, drafts, discussions } = stores()
  const batch = drafts.getSnapshot().comments
  const ctx = sessionContext({
    prompt: async (content, mode, signal, requestId) => {
      const persisted = JSON.parse(memory.getItem('discussions')).records[0]
      assert.equal(persisted.requestId, requestId)
      assert.equal(persisted.state, 'submitting')
      assert.deepEqual(persisted.comments, batch)
      assert.equal(mode, 'queue')
      assert.equal(signal, undefined)
      assert.equal(content.length, 1)
      assert.equal(content[0].type, 'text')
      const packet = parseReviewPacket(content[0].text)
      assert.ok(packet)
      assert.equal(packet.packet.context, formatReviewSubmission(batch, []))
      assert.deepEqual(packet.packet.comments, batch)
      assert.equal(packet.packet.sessionId, 'review-session')
      assert.equal(drafts.getSnapshot().busy, true)
      assert.equal(drafts.getSnapshot().comments.length, 1)
      return { ok: true, value: { accepted: true } }
    },
  })
  assert.equal(await submit(drafts, discussions, ctx), true)
  assert.equal(drafts.getSnapshot().comments.length, 0)
  assert.equal(drafts.getSnapshot().busy, false)
  assert.equal(discussions.getSnapshot().records[0].state, 'queued')
  assert.equal(
    new ReviewDiscussionStore(memory, 'discussions').getSnapshot().records[0].requestId,
    'rpc-reviewed-batch',
  )
})

test('legacy send retains an explicitly unlinked discussion without fabricating a request ID', async () => {
  const { drafts, discussions } = stores()
  let sent = 0
  const ctx = sessionContext({
    send: async text => {
      sent++
      assert.ok(text.includes('Please explain this file'))
      assert.equal(discussions.getSnapshot().records[0].requestId, '')
    },
  })
  assert.equal(await submit(drafts, discussions, ctx), true)
  assert.equal(sent, 1)
  assert.equal(discussions.getSnapshot().records[0].state, 'unlinked')
})

test('Cordis session scopes resolve conversation without property injection', async () => {
  const ctx = new Context()
  const { drafts, discussions } = stores()
  let sent = 0
  await ctx.plugin(provider => {
    provider.provide('conversation', { send: async () => { sent++ } })
  }).await()
  // Official createScope uses a no-op fiber with no conversation injection.
  const fiber = ctx.plugin(() => {})
  await fiber.await()
  const scope = fiber.ctx
  try {
    assert.throws(() => scope.conversation, /without inject/)
    assert.equal(await submit(drafts, discussions, { sessions: { scope: () => scope } }), true)
    assert.equal(sent, 1)
    assert.equal(drafts.getSnapshot().comments.length, 0)
  } finally {
    await ctx.fiber.dispose()
  }
})

test('disabling discussion history continues through the legacy send and creates no record', async () => {
  const { drafts, discussions } = stores()
  let sent = 0
  const ctx = sessionContext({
    prompt: async () => {
      assert.fail('disabled history must use conversation.send')
    },
    send: async () => {
      sent++
    },
  })
  assert.equal(await submit(drafts, discussions, ctx, false), true)
  assert.equal(sent, 1)
  assert.equal(discussions.getSnapshot().records.length, 0)
})

for (const [code, state] of [
  ['gateway/forbidden', 'failed'],
  ['gateway/internal', 'unknown'],
  ['gateway/cancelled', 'unknown'],
]) {
  test(`submission ${code} retains drafts and records ${state}`, async () => {
    const { drafts, discussions } = stores()
    const batch = drafts.getSnapshot().comments
    let abandoned = 0
    const ctx = sessionContext({
      prompt: async () => ({ ok: false, error: { code } }),
      abandon: () => {
        abandoned++
      },
    })
    await assert.rejects(
      submit(drafts, discussions, ctx),
      cause => cause instanceof ReviewSendFailure && cause.code === code,
    )
    assert.deepEqual(drafts.getSnapshot().comments, batch)
    assert.equal(drafts.getSnapshot().busy, false)
    assert.equal(discussions.getSnapshot().records[0].state, state)
    assert.equal(abandoned, 1)
  })
}

test('durable admission before a transport failure acknowledges the accepted batch', async () => {
  const { drafts, discussions } = stores()
  const ctx = sessionContext({
    prompt: async () => {
      discussions.reconcile([
        { event: { type: 'turn/start', seq: 1, data: { turn: 7 } } },
        {
          event: {
            type: 'user/message',
            seq: 2,
            data: { source: { kind: 'user', rpcId: 'rpc-reviewed-batch' } },
          },
        },
        {
          event: {
            type: 'assistant/message',
            seq: 3,
            data: {
              turn: 7,
              message: { id: 'answer', content: [{ type: 'text', text: 'Explained' }] },
            },
          },
        },
      ])
      throw new Error('connection lost after admission')
    },
  })
  assert.equal(await submit(drafts, discussions, ctx), true)
  assert.equal(drafts.getSnapshot().comments.length, 0)
  const discussion = discussions.getSnapshot().records[0]
  assert.equal(discussion.state, 'answered')
  assert.equal(discussion.userSeq, 2)
  assert.equal(discussion.turn, 7)
  assert.equal(discussion.replies[0].text, 'Explained')
})

test('late admission of an uncertain submission preserves a subsequently edited opinion', async () => {
  const { drafts, discussions } = stores()
  const original = drafts.getSnapshot().comments[0]
  const ctx = sessionContext({
    prompt: async () => ({ ok: false, error: { code: 'gateway/internal' } }),
  })
  await assert.rejects(submit(drafts, discussions, ctx), ReviewSendFailure)
  drafts.save(anchor, 'A newer opinion', original.id)
  discussions.reconcile([
    { event: { type: 'turn/start', seq: 4, data: { turn: 8 } } },
    {
      event: {
        type: 'user/message',
        seq: 5,
        data: { source: { kind: 'user', rpcId: 'rpc-reviewed-batch' } },
      },
    },
  ])
  const accepted = discussions.getSnapshot().records[0]
  drafts.acknowledge(accepted.comments)
  assert.equal(accepted.state, 'running')
  assert.equal(drafts.getSnapshot().comments[0].text, 'A newer opinion')
  assert.equal(drafts.getSnapshot().comments[0].id, original.id)
})
