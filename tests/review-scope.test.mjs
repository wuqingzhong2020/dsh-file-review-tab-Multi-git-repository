import { test } from 'node:test'
import assert from 'node:assert/strict'
import { lastTurnChanges } from '../src/client/session-changes.ts'

const turns = [1, 3].map(turn => ({ turn, live: false, files: [{ path: 'file.txt', diffs: [] }] }))
const snapshot = { nodes: [], turnEnds: new Map([[1, 10], [2, 20], [3, 30]]), partial: null, runningCalls: [] }

test('last-turn range uses the actual completed turn even when it changed no files', () => {
  assert.deepEqual(lastTurnChanges(snapshot, turns).map(turn => turn.turn), [3])
  assert.deepEqual(lastTurnChanges({ ...snapshot, turnEnds: new Map([...snapshot.turnEnds, [4, 40]]) }, turns), [])
  assert.deepEqual(lastTurnChanges({ views: new Map([['chat', { legacy: snapshot }]]) }, turns).map(turn => turn.turn), [3])
})

test('last-turn range follows a running turn without showing older changes', () => {
  assert.deepEqual(lastTurnChanges({ ...snapshot, partial: { turn: 4 } }, turns), [])
  assert.deepEqual(lastTurnChanges({ ...snapshot, runningCalls: [{ turn: 5 }] }, [...turns, { turn: 5, live: true, files: [] }]).map(turn => turn.turn), [5])
})
