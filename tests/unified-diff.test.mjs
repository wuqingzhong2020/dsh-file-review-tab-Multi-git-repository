import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildUnifiedHunks, expandAllContextGap, expandContextGap, hunkLines, splitDiffRows, summarizeDiffs, unifiedDiffText, unifiedHunkRange, unifiedVisibleBlocks, visibleHunkRows } from '../src/client/unified-diff-model.ts'
import { groupReviewFiles } from '../src/client/review-repository-groups.ts'
import { commentAnchorKey, lineCommentAnchor, reviewDiffRevision } from '../src/client/review-comments.ts'
import { mergeRecordedTurns } from '../src/client/session-changes.ts'
import { DEFAULT_DIFF_VIEW, DIFF_VIEW_STORAGE_KEY, DiffViewStore, parseDiffViewPreferences } from '../src/client/diff-view-preferences.ts'

const old = Array.from({ length: 200 }, (_, index) => `unchanged ${index + 1}`)
const next = [...old]; next.splice(60, 1, 'modified 61', 'inserted 62'); next.splice(141, 1)
const diff = { path: 'file.ts', oldStart: 1, newStart: 1, oldText: old.join('\n') + '\n', newText: next.join('\n') + '\n' }
const gaps = hunk => hunk.rows.filter(row => row.kind === 'gap')
const lines = (hunk, expansion) => visibleHunkRows(hunk, expansion).filter(row => row.kind !== 'gap')

test('leading expansion reveals twenty lines next to the change, rather than from the top of the file', () => {
  const hunk = buildUnifiedHunks([diff], 3)[0]; const gap = gaps(hunk).find(row => row.position === 'leading')
  const shown = new Map(); const before = lines(hunk, shown)
  shown.set(gap.id, expandContextGap(gap))
  const after = lines(hunk, shown)
  assert.equal(after.length - before.length, 20)
  assert.equal(after[0].oldNumber, before[0].oldNumber - 20)
  assert.equal(after[0].text, `unchanged ${after[0].oldNumber}`)
  shown.set(gap.id, expandContextGap(gap, shown.get(gap.id)))
  assert.equal(lines(hunk, shown).length - after.length, 20)
  assert.equal(lines(hunk, shown)[0].oldNumber, before[0].oldNumber - 40)
})

test('middle expansion reveals ten lines from each neighboring change and preserves distinct old/new numbers', () => {
  const hunk = buildUnifiedHunks([diff], 3)[0]; const gap = gaps(hunk).find(row => row.position === 'middle')
  const shown = new Map([[gap.id, expandContextGap(gap)]])
  const revealed = lines(hunk, shown).filter(row => gap.lines.includes(row))
  assert.equal(revealed.length, 20)
  assert.deepEqual(revealed.slice(0, 10), gap.lines.slice(0, 10))
  assert.deepEqual(revealed.slice(-10), gap.lines.slice(-10))
  assert.ok(revealed.every(row => row.newNumber === row.oldNumber + 1))
})

test('trailing expansion progresses toward EOF, exhausts short remainders and never duplicates a line', () => {
  const hunk = buildUnifiedHunks([diff], 3)[0]; const gap = gaps(hunk).find(row => row.position === 'trailing')
  const shown = new Map(); let previousCount = lines(hunk, shown).length; let remaining = gap.lines.length
  while (remaining > 0) {
    shown.set(gap.id, expandContextGap(gap, shown.get(gap.id)))
    const rows = lines(hunk, shown)
    assert.equal(rows.length - previousCount, Math.min(20, remaining))
    remaining -= Math.min(20, remaining); previousCount = rows.length
    assert.equal(new Set(rows.map(row => `${row.kind}:${row.oldNumber}:${row.newNumber}`)).size, rows.length)
  }
  assert.equal(lines(hunk, shown).at(-1).oldNumber, 200)
  assert.ok(!visibleHunkRows(hunk, shown).some(row => row.kind === 'gap' && row.id === gap.id))
})

test('fully revealing every gap merges the blocks into the original line stream; collapse restores three-line context', () => {
  const hunk = buildUnifiedHunks([diff], 3)[0]; const shown = new Map()
  for (const gap of gaps(hunk)) while ((shown.get(gap.id)?.before ?? 0) + (shown.get(gap.id)?.after ?? 0) < gap.lines.length) shown.set(gap.id, expandContextGap(gap, shown.get(gap.id)))
  const rows = visibleHunkRows(hunk, shown)
  assert.deepEqual(rows, hunk.lines)
  assert.equal(unifiedVisibleBlocks(rows).length, 1)
  assert.deepEqual(visibleHunkRows(hunk, new Map()), hunk.rows)
  assert.deepEqual(summarizeDiffs([diff]), { added: 2, removed: 2 })
})

test('historical omissions are counts without invented code or expansion buttons', () => {
  const historical = { path: 'file.py', oldStart: 2208, newStart: 2208, oldText: 'before1\nbefore2\nbefore3\nold\nafter1\nafter2\nafter3\n', newText: 'before1\nbefore2\nbefore3\nnew\nextra\nafter1\nafter2\nafter3\n' }
  const hunk = buildUnifiedHunks([historical], 3)[0]
  assert.equal(hunk.unchangedBefore, 2207)
  assert.equal(gaps(hunk).length, 0)
  assert.equal(unifiedHunkRange(hunk.lines, historical), '@@ -2208,7 +2208,8 @@')
})

test('new and deleted files use Git-style empty-side ranges without phantom final lines', () => {
  const created = { path: 'new.ts', oldText: null, newText: 'one\ntwo\n', oldStart: 1, newStart: 1 }
  const deleted = { path: 'old.ts', oldText: 'one\ntwo', newText: '', oldStart: 1, newStart: 1 }
  assert.equal(unifiedHunkRange(hunkLines(created), created), '@@ -0,0 +1,2 @@')
  assert.equal(unifiedHunkRange(hunkLines(deleted), deleted), '@@ -1,2 +0,0 @@')
})

test('expanding context preserves comment anchors and copying keeps compact signed differences', () => {
  const hunk = buildUnifiedHunks([diff], 3)[0]
  const row = hunk.lines.find(row => row.kind === 'add')
  const target = { scope: 'unstaged', repository: 'D:/project', repositoryName: 'project', path: 'file.ts', absolutePath: 'D:/project/file.ts' }
  const revision = reviewDiffRevision([diff])
  const anchor = lineCommentAnchor(target, row, hunk.lines, revision)
  const shown = new Map(gaps(hunk).map(gap => [gap.id, expandContextGap(gap)]))
  const expandedRow = lines(hunk, shown).find(line => line === row)
  assert.equal(commentAnchorKey(lineCommentAnchor(target, expandedRow, hunk.lines, revision)), commentAnchorKey(anchor))
  assert.equal(anchor.line, 61)
  const copied = unifiedDiffText([diff])
  assert.ok(!copied.includes(' unchanged 1\n'))
  assert.match(copied, /- unchanged 61/); assert.match(copied, /\+ modified 61/)
  assert.match(copied, /@@ -58,/)
})

test('repository groups list a root once and keep duplicate names and file paths isolated', () => {
  const files = [
    { repository: 'D:/project/core', path: 'a.ts' },
    { repository: 'D:/project/editor', path: 'a.ts' },
    { repository: 'D:/project/core', path: 'b.ts' },
    { repository: 'D:/other/core', path: 'a.ts' },
  ]
  const groups = groupReviewFiles(files, file => ({ key: file.repository, path: file.repository, name: file.repository.split('/').at(-1) }))
  assert.equal(groups.length, 3)
  assert.deepEqual(groups[0].files.map(file => file.path), ['a.ts', 'b.ts'])
  assert.equal(groups[0].name, groups[2].name)
  assert.notEqual(groups[0].key, groups[2].key)
  assert.deepEqual(groupReviewFiles([], () => { throw new Error('No empty group should be created') }), [])
})

test('Code Mode displays recorded full context while undo continues to receive its original contextual hunks', () => {
  const result = mergeRecordedTurns([], [{ rootCallId: 'root-a', turn: 3, live: false }], [{ rootCallId: 'root-a', name: 'edit', path: diff.path, before: diff.oldText, after: diff.newText }])
  const file = result[0].files[0]
  assert.equal(file.diffs.length, 2)
  assert.equal(file.diffs[0].oldStart, 58)
  assert.ok(!file.diffs[0].oldText.includes('unchanged 1\n'))
  assert.equal(file.reviewDiffs.length, 1)
  assert.equal(file.reviewDiffs[0].oldText, diff.oldText)
  assert.equal(file.reviewDiffs[0].newText, diff.newText)
  assert.deepEqual(summarizeDiffs(file.reviewDiffs), summarizeDiffs(file.diffs))
  assert.equal(buildUnifiedHunks(file.reviewDiffs, 3)[0].unchangedBefore, 0)
})

test('split replacements retain both complete streams, real numbers and blank cells for unequal changes', () => {
  const original = hunkLines(diff)
  const rows = splitDiffRows(original)
  assert.deepEqual(rows.flatMap(row => row.old ? [row.old] : []), original.filter(row => row.kind !== 'add'))
  assert.deepEqual(rows.flatMap(row => row.next ? [row.next] : []), original.filter(row => row.kind !== 'del'))
  const replacement = rows.find(row => row.old?.text === 'unchanged 61')
  assert.equal(replacement.next.text, 'modified 61')
  assert.equal(rows.find(row => row.next?.text === 'inserted 62').old, null)
  assert.equal(rows.find(row => row.old?.text === 'unchanged 141').next, null)
  assert.ok(rows.filter(row => row.old?.kind === 'context').every(row => row.old === row.next))
  assert.deepEqual(splitDiffRows([]), [])
})

test('split context expansion reveals the same twenty actual lines and keeps comments on the same snapshot', () => {
  const hunk = buildUnifiedHunks([diff], 3)[0]; const gap = gaps(hunk)[0]
  const before = splitDiffRows(lines(hunk, new Map()))
  const after = splitDiffRows(lines(hunk, new Map([[gap.id, expandContextGap(gap)]])))
  assert.equal(after.length - before.length, 20)
  const target = { scope: 'unstaged', repository: 'D:/project', repositoryName: 'project', path: 'file.ts', absolutePath: 'D:/project/file.ts' }
  const revision = reviewDiffRevision([diff])
  const row = hunk.lines.find(row => row.kind === 'add')
  const split = after.find(item => item.next === row).next
  assert.equal(commentAnchorKey(lineCommentAnchor(target, split, hunk.lines, revision)), commentAnchorKey(lineCommentAnchor(target, row, hunk.lines, revision)))
})

test('left and right context comments use their actual side and line number after insertions', () => {
  const hunk = buildUnifiedHunks([diff], 3)[0]
  const row = hunk.lines.find(row => row.kind === 'context' && row.oldNumber === 80)
  const target = { scope: 'session', turn: 1, repository: 'D:/project', repositoryName: 'project', path: 'file.ts', absolutePath: 'D:/project/file.ts' }
  const left = lineCommentAnchor(target, row, hunk.lines, 'revision', 'old')
  const right = lineCommentAnchor(target, row, hunk.lines, 'revision', 'new')
  assert.equal(left.side, 'old'); assert.equal(left.line, 80)
  assert.equal(right.side, 'new'); assert.equal(right.line, 81)
  assert.equal(left.quote, right.quote)
  assert.notEqual(commentAnchorKey(left), commentAnchorKey(right))
  assert.equal(commentAnchorKey(right), commentAnchorKey(lineCommentAnchor(target, row, hunk.lines, 'revision')))
})

test('only split and unified preferences are accepted and display choices survive reopening', () => {
  const values = new Map()
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value) } }
  const store = new DiffViewStore(storage)
  assert.deepEqual(store.getSnapshot(), { ...DEFAULT_DIFF_VIEW, layout: 'unified', wrap: true, contextExpansionLines: 20 })
  let notifications = 0; const unsubscribe = store.subscribe(() => { notifications++ })
  store.set({ layout: 'split' }); store.set({ wrap: false }); store.set({ wrap: false })
  assert.equal(notifications, 2)
  assert.deepEqual(new DiffViewStore(storage).getSnapshot(), { ...DEFAULT_DIFF_VIEW, layout: 'split', wrap: false, contextExpansionLines: 20 })
  assert.ok(values.has(DIFF_VIEW_STORAGE_KEY))
  unsubscribe(); store.set({ layout: 'unified' }); assert.equal(notifications, 2)
  for (const raw of [null, '{', '{}', '{"layout":"auto","wrap":true}', '{"layout":"split","wrap":"false"}']) assert.deepEqual(parseDiffViewPreferences(raw), DEFAULT_DIFF_VIEW)
})

test('unavailable local storage does not prevent changing the display in memory', () => {
  const store = new DiffViewStore({ getItem() { throw new Error('blocked') }, setItem() { throw new Error('blocked') } })
  store.set({ layout: 'split', wrap: false })
  assert.deepEqual(store.getSnapshot(), { ...DEFAULT_DIFF_VIEW, layout: 'split', wrap: false, contextExpansionLines: 20 })
})

test('configured expansion handles odd counts, single lines and counts beyond the remaining interval', () => {
  const hunk = buildUnifiedHunks([diff], 3)[0]
  for (const gap of gaps(hunk)) {
    const shown = new Map()
    let previousCount = lines(hunk, shown).length
    for (const count of [1, 7, 1000]) {
      const previous = shown.get(gap.id)
      const remaining = gap.lines.length - (previous?.before ?? 0) - (previous?.after ?? 0)
      const expanded = expandContextGap(gap, previous, count)
      shown.set(gap.id, expanded)
      const rows = lines(hunk, shown)
      assert.equal(rows.length - previousCount, Math.min(count, remaining))
      assert.equal(new Set(rows).size, rows.length)
      if (gap.position === 'leading') assert.equal(expanded.before, 0)
      if (gap.position === 'trailing') assert.equal(expanded.after, 0)
      previousCount = rows.length
    }
    assert.ok(!visibleHunkRows(hunk, shown).some(row => row.kind === 'gap' && row.id === gap.id))
  }
})

test('directional full expansion reveals only the selected gap after partial expansion and preserves line identity', () => {
  const hunk = buildUnifiedHunks([diff], 3)[0]
  for (const gap of gaps(hunk)) for (const direction of ['up', 'down']) {
    const partial = expandContextGap(gap, undefined, 7)
    const expanded = expandAllContextGap(gap, direction, partial)
    assert.equal(expanded.before + expanded.after, gap.lines.length)
    assert.equal(direction === 'up' ? expanded.before : expanded.after, direction === 'up' ? partial.before : partial.after)
    assert.deepEqual(expandAllContextGap(gap, direction, expanded), expanded)
    const shown = new Map([[gap.id, expanded]])
    const rows = visibleHunkRows(hunk, shown)
    assert.deepEqual(rows.filter(row => row.kind === 'gap'), gaps(hunk).filter(row => row.id !== gap.id))
    assert.deepEqual(lines(hunk, shown).filter(row => gap.lines.includes(row)), gap.lines)
    assert.equal(new Set(lines(hunk, shown)).size, lines(hunk, shown).length)
  }
})

test('expanded intervals keep local collapse controls after partial or full expansion without duplicating code', () => {
  const hunk = buildUnifiedHunks([diff], 3)[0]
  const shown = new Map()
  for (const gap of gaps(hunk)) {
    shown.set(gap.id, expandContextGap(gap, undefined, 7))
    assert.deepEqual(visibleHunkRows(hunk, shown, true), visibleHunkRows(hunk, shown))
  }
  for (const gap of gaps(hunk)) shown.set(gap.id, expandAllContextGap(gap, gap.position === 'leading' ? 'up' : 'down', shown.get(gap.id)))
  const rows = visibleHunkRows(hunk, shown, true)
  assert.deepEqual(rows.filter(row => row.kind !== 'gap'), hunk.lines)
  assert.deepEqual(rows.filter(row => row.kind === 'gap').map(row => [row.id, row.lines.length]), gaps(hunk).map(gap => [gap.id, 0]))
  const blocks = unifiedVisibleBlocks(rows)
  assert.deepEqual(blocks.flatMap(block => block.lines), hunk.lines)
  assert.equal(blocks.filter(block => block.gap).length, gaps(hunk).length)
  // Collapse one interval while the other two remain fully revealed.
  const middle = gaps(hunk).find(gap => gap.position === 'middle')
  shown.delete(middle.id)
  const collapsed = visibleHunkRows(hunk, shown, true)
  assert.deepEqual(collapsed.filter(row => row.kind !== 'gap'), hunk.lines.filter(row => !middle.lines.includes(row)))
  assert.equal(collapsed.find(row => row.kind === 'gap' && row.id === middle.id).lines.length, middle.lines.length)
  assert.ok(collapsed.filter(row => row.kind === 'gap' && row.id !== middle.id).every(row => row.lines.length === 0))
  assert.deepEqual(visibleHunkRows(hunk, new Map(), true), hunk.rows)
})

test('context line settings migrate old preferences, reject invalid counts, persist and notify open views', () => {
  assert.deepEqual(parseDiffViewPreferences('{"layout":"split","wrap":false}'), { ...DEFAULT_DIFF_VIEW, layout: 'split', wrap: false, contextExpansionLines: 20 })
  for (const count of [0, -1, 1.5, '30', null, Number.MAX_SAFE_INTEGER + 1]) {
    assert.deepEqual(parseDiffViewPreferences(JSON.stringify({ ...DEFAULT_DIFF_VIEW, layout: 'split', wrap: false, contextExpansionLines: count })), { ...DEFAULT_DIFF_VIEW, layout: 'split', wrap: false, contextExpansionLines: 20 })
  }
  const values = new Map()
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value) } }
  const store = new DiffViewStore(storage)
  let notifications = 0
  store.subscribe(() => { notifications++ })
  store.set({ contextExpansionLines: 7 })
  store.set({ contextExpansionLines: 7 })
  assert.equal(notifications, 1)
  assert.equal(new DiffViewStore(storage).getSnapshot().contextExpansionLines, 7)
  store.set({ layout: 'split', wrap: false })
  assert.deepEqual(store.getSnapshot(), { ...DEFAULT_DIFF_VIEW, layout: 'split', wrap: false, contextExpansionLines: 7 })
  const unavailable = new DiffViewStore({ getItem() { throw new Error('blocked') }, setItem() { throw new Error('blocked') } })
  unavailable.set({ contextExpansionLines: 5 })
  assert.equal(unavailable.getSnapshot().contextExpansionLines, 5)
})
