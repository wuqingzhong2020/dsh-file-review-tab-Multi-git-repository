import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  GIT_REVIEW_MODES, REVIEW_MODES, REVIEW_SCOPES,
  isGitReviewMode, isReviewMode, isSessionReviewMode, usesWorkingTree,
} from '../src/review-scopes.ts'
import { gitReviewRequestSchema } from '../src/git-review-schemas.ts'
import { gitReferenceSelector, sessionScopeBehavior } from '../src/client/review-scope-model.ts'
import { commentFileKey, fileCommentAnchor, parseReviewComments } from '../src/client/review-comments.ts'
import { commentScopeLabel } from '../src/client/review-comment-labels.ts'
import { turnConfirmationRevision } from '../src/client/review-confirmations.ts'
import { attachLocale, en, zh } from '../src/client/locales.ts'

test('review menu preserves the eight persisted scope IDs, order and bilingual labels', () => {
  assert.deepEqual(REVIEW_MODES, ['last-turn', 'session', 'pending', 'uncommitted', 'unstaged', 'staged', 'commit', 'branch'])
  for (const [active, dictionary] of [['zh', zh], ['en', en]]) {
    const detach = attachLocale({ getSnapshot: () => ({ active }) })
    try {
      for (const mode of REVIEW_MODES) {
        assert.equal(typeof dictionary[REVIEW_SCOPES[mode].label], 'string')
        assert.equal(commentScopeLabel(mode), dictionary[REVIEW_SCOPES[mode].label])
      }
    } finally { detach() }
  }
})

test('only Git scopes pass the Host request schema; unknown and inherited names are refused', () => {
  assert.deepEqual(GIT_REVIEW_MODES, ['uncommitted', 'unstaged', 'staged', 'commit', 'branch'])
  for (const mode of REVIEW_MODES) {
    assert.equal(isReviewMode(mode), true)
    assert.notEqual(isGitReviewMode(mode), isSessionReviewMode(mode))
    assert.equal(gitReviewRequestSchema.safeParse({ mode }).success, isGitReviewMode(mode))
  }
  for (const mode of [null, undefined, '', 'constructor', '__proto__', 'toString', 'future-scope', ['session'], 1]) {
    assert.equal(isReviewMode(mode), false)
    assert.equal(isSessionReviewMode(mode), false)
    assert.equal(isGitReviewMode(mode), false)
    assert.equal(gitReviewRequestSchema.safeParse({ mode }).success, false)
  }
})

const target = scope => ({ scope, repository: 'D:/App', repositoryName: 'App', path: 'a.py', absolutePath: 'D:/App/a.py' })
const encodedComment = anchor => JSON.stringify({ version: 1, comments: [{ id: 'one', text: 'Review this', anchor }] })

test('session filters share comment identity for one turn, while Git comparisons remain distinct', () => {
  const keys = ['last-turn', 'session', 'pending'].map(scope => commentFileKey({ ...target(scope), turn: 7 }))
  assert.equal(new Set(keys).size, 1)
  assert.notEqual(keys[0], commentFileKey({ ...target('session'), turn: 8 }))
  const gitKeys = GIT_REVIEW_MODES.map(scope => commentFileKey(target(scope)))
  assert.equal(new Set([...keys, ...gitKeys]).size, 6)
  assert.notEqual(commentFileKey({ ...target('commit'), ref: 'one' }), commentFileKey({ ...target('commit'), ref: 'two' }))
})

test('persisted comments require turns only for session scopes and reject malformed scope values', () => {
  for (const scope of REVIEW_MODES) {
    const anchor = fileCommentAnchor({ ...target(scope), ...(isSessionReviewMode(scope) ? { turn: 7 } : {}) })
    assert.deepEqual(parseReviewComments(encodedComment(anchor))[0].anchor, anchor)
    if (isSessionReviewMode(scope)) {
      const { turn, ...withoutTurn } = anchor
      assert.throws(() => parseReviewComments(encodedComment(withoutTurn)), /Invalid review turn/)
    }
  }
  for (const scope of ['future-scope', ['uncommitted'], { toString: 'session' }, '__proto__']) {
    assert.throws(() => parseReviewComments(encodedComment(fileCommentAnchor(target(scope)))), /Invalid review anchor/)
  }
})

test('working-tree capabilities never include staged or historical sources', () => {
  assert.deepEqual(REVIEW_MODES.filter(usesWorkingTree), ['uncommitted', 'unstaged'])
})

test('session scope handlers preserve latest-turn and pending-confirmation semantics', () => {
  const turns = [1, 2, 3].map(turn => ({ turn, live: turn === 3, files: [{ path: 'a.py', diffs: [] }] }))
  const snapshot = { nodes: [], turnEnds: new Map([[1, 10], [2, 20]]), partial: { turn: 3 }, runningCalls: [] }
  const confirmed = new Map([[1, turnConfirmationRevision(turns[0])], [3, turnConfirmationRevision(turns[2])]])
  const input = { snapshot, turns, confirmed }
  assert.deepEqual(sessionScopeBehavior('last-turn').select(input), [turns[2]])
  assert.strictEqual(sessionScopeBehavior('session').select(input), turns)
  assert.deepEqual(sessionScopeBehavior('pending').select(input), [turns[1], turns[2]])
  assert.equal(sessionScopeBehavior('pending').pagination, 'pending')
  assert.equal(sessionScopeBehavior('pending').empty, 'pendingEmpty')
  assert.equal(sessionScopeBehavior('pending').filteredEmpty, 'pendingRepoEmpty')
  assert.equal(sessionScopeBehavior('last-turn').pagination, 'archive')
  assert.equal(sessionScopeBehavior('last-turn').empty, 'lastTurnEmpty')
  assert.equal(sessionScopeBehavior('last-turn').filteredEmpty, 'lastTurnRepoEmpty')
  for (const mode of ['session', ...GIT_REVIEW_MODES]) {
    assert.equal(sessionScopeBehavior(mode).pagination, 'archive')
    assert.equal(sessionScopeBehavior(mode).empty, 'empty')
    assert.equal(sessionScopeBehavior(mode).filteredEmpty, 'repoFilterEmpty')
  }
  for (const mode of GIT_REVIEW_MODES) assert.strictEqual(sessionScopeBehavior(mode).select(input), turns)
  assert.deepEqual(sessionScopeBehavior('last-turn').select({ ...input, snapshot: { ...snapshot, partial: { turn: 4 } } }), [])
})

test('Git reference selectors keep commit/branch values, order, labels and empty-repository behavior', () => {
  const repository = { name: 'App', path: 'D:/App', branch: 'main', branches: ['feature', 'main'], commits: [
    { oid: 'a'.repeat(40), subject: 'Subject', date: '2026-10-04' },
  ] }
  assert.deepEqual(gitReferenceSelector('commit', repository), {
    label: 'reviewCommit', defaultLabel: 'reviewHead',
    options: [{ value: 'a'.repeat(40), label: 'aaaaaaaa · Subject · 2026-10-04' }],
  })
  assert.deepEqual(gitReferenceSelector('branch', repository), {
    label: 'reviewBranch', defaultLabel: 'reviewAutoBranch',
    options: [{ value: 'feature', label: 'feature' }, { value: 'main', label: 'main' }],
  })
  assert.deepEqual(gitReferenceSelector('commit').options, [])
  assert.deepEqual(gitReferenceSelector('branch').options, [])
  for (const mode of ['uncommitted', 'unstaged', 'staged']) assert.equal(gitReferenceSelector(mode, repository), null)
})
