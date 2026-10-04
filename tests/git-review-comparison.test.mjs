import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveDefaultBranchRequest, resolveGitComparison } from '../src/git-review-command.ts'

const root = '/approved/repository'
const head = 'a'.repeat(40), parent = 'b'.repeat(40), empty = 'c'.repeat(40)
function runner(responses) {
  const calls = []
  return {
    calls,
    run: async (cwd, args) => {
      assert.equal(cwd, root)
      calls.push(args)
      const response = responses[JSON.stringify(args)]
      assert.notEqual(response, undefined, 'Unexpected command: ' + args.join(' '))
      if (response instanceof Error) throw response
      return response
    },
  }
}
const command = (...args) => JSON.stringify(args)

test('worktree and index comparisons choose their own arguments with and without HEAD', async () => {
  for (const hasHead of [true, false]) {
    for (const [mode, args, comparison] of [
      ['unstaged', [], 'index → working tree'],
      ['staged', ['--cached'], 'HEAD → index'],
      ['uncommitted', hasHead ? ['HEAD'] : ['--cached'], 'HEAD → working tree'],
    ]) {
      const git = runner({ [command('rev-parse', '--verify', 'HEAD')]: hasHead ? head : new Error('unborn') })
      assert.deepEqual(await resolveGitComparison(root, { mode }, git.run), { args, comparison })
      assert.equal(git.calls.length, 1)
    }
  }
})

test('commit comparisons validate the reference and use the empty tree only when the parent is absent', async () => {
  for (const isRoot of [true, false]) {
    const git = runner({
      [command('rev-parse', '--verify', 'HEAD')]: head,
      [command('rev-parse', '--verify', '--end-of-options', 'HEAD^{commit}')]: head + '\n',
      [command('rev-parse', '--verify', `${head}^`)]: isRoot ? new Error('no parent') : parent + '\n',
      [command('hash-object', '-t', 'tree', '--stdin')]: empty + '\n',
    })
    assert.deepEqual(await resolveGitComparison(root, { mode: 'commit' }, git.run), {
      args: [isRoot ? empty : parent, head], comparison: 'aaaaaaaa (HEAD)',
    })
    assert.equal(git.calls.length, isRoot ? 4 : 3)
  }
})

test('branch comparisons use only the verified object ID to find the merge base', async () => {
  const ref = '--name with spaces'
  const oid = 'd'.repeat(64)
  const git = runner({
    [command('rev-parse', '--verify', 'HEAD')]: head,
    [command('rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`)]: oid,
    [command('merge-base', 'HEAD', oid)]: parent,
  })
  assert.deepEqual(await resolveGitComparison(root, { mode: 'branch', ref }, git.run), {
    args: [parent, 'HEAD'], comparison: `${ref} merge-base → HEAD`,
  })
  assert.deepEqual(git.calls.at(-1), ['merge-base', 'HEAD', oid])
})

test('historical comparisons fail before diff execution for missing commits, references and invalid objects', async () => {
  for (const mode of ['commit', 'branch']) {
    const unborn = runner({ [command('rev-parse', '--verify', 'HEAD')]: new Error('unborn') })
    await assert.rejects(resolveGitComparison(root, { mode }, unborn.run), /This repository has no commits/)
    assert.equal(unborn.calls.length, 1)
  }
  const missing = runner({ [command('rev-parse', '--verify', 'HEAD')]: head })
  await assert.rejects(resolveGitComparison(root, { mode: 'branch' }, missing.run), /Select a comparison branch/)
  const invalid = runner({
    [command('rev-parse', '--verify', 'HEAD')]: head,
    [command('rev-parse', '--verify', '--end-of-options', 'HEAD^{commit}')]: 'invalid-object',
  })
  await assert.rejects(resolveGitComparison(root, { mode: 'commit' }, invalid.run), /Invalid commit/)
})

test('automatic branch selection preserves remote-default, main/master and alternate-branch priority', async () => {
  const cases = [
    ['origin/default', 'feature\nmain\norigin/default\n', 'origin/default'],
    ['', 'feature\norigin/HEAD\nother\nmain\n', 'main'],
    ['', 'feature\norigin/HEAD\nother\n', 'other'],
    ['', 'feature\norigin/HEAD\n', undefined],
  ]
  for (const [preferred, branches, expected] of cases) {
    const git = runner({
      [command('symbolic-ref', '--quiet', '--short', 'HEAD')]: 'feature\n',
      [command('for-each-ref', '--format=%(refname:short)', 'refs/heads', 'refs/remotes')]: branches,
      [command('symbolic-ref', '--quiet', '--short', 'refs/remotes/origin/HEAD')]: preferred || new Error('no default'),
    })
    assert.deepEqual(await resolveDefaultBranchRequest(root, { mode: 'branch' }, git.run), { mode: 'branch', ref: expected })
  }
  const unreachable = async () => { throw new Error('Should not query Git') }
  for (const request of [{ mode: 'branch', ref: 'chosen' }, { mode: 'commit' }, { mode: 'uncommitted' }]) {
    assert.strictEqual(await resolveDefaultBranchRequest(root, request, unreachable), request)
  }
})
