import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildUnifiedHunks, visibleHunkRows, unifiedVisibleBlocks, splitDiffRows, unifiedDiffText, summarizeDiffs } from '../src/client/unified-diff-model.ts'
import { indexDiff, stepDiffIndex, nearestDiffChange, revealDiffLocation, expandDiffGapSlice } from '../src/client/diff-navigation.ts'
import { searchDiff, DIFF_SEARCH_LIMIT } from '../src/client/diff-search.ts'
import { diffLanguage, highlightLine, highlightDiff, HIGHLIGHT_CHARACTER_LIMIT, HIGHLIGHT_LINE_LIMIT } from '../src/client/diff-highlight.ts'
import { commentAnchorKey, lineCommentAnchor, reviewDiffRevision } from '../src/client/review-comments.ts'

const options = { side: 'both', caseSensitive: false, wholeWord: false }
const old = Array.from({ length: 300 }, (_, i) => `const value${i + 1} = ${i + 1};`)
old[19] = '// needle 中文 needle'; old[130] = 'const removedOnly = 1;'
const next = [...old]; next[80] = 'const value81 = 810;'; next[130] = 'const addedOnly = 2;'; next[240] = 'const value241 = 2410;'
const diff = { path: 'example.ts', oldText: old.join('\n'), newText: next.join('\n'), oldStart: 1, newStart: 1 }
const hunks = buildUnifiedHunks([diff], 3)
const index = indexDiff(hunks, 3)
const search = (query, settings = options) => searchDiff(index.lines, query, settings)
const tokens = (text, language, state = {}) => highlightLine(text, language, state).map(token => [text.slice(token.start, token.end), token.kind])

test('literal search preserves multiple Unicode matches, offsets and common-context identity', () => {
  const found = search('needle')
  assert.equal(found.matches.length, 2)
  assert.deepEqual(found.matches.map(match => [match.start, match.end, match.side]), [[3, 9, 'new'], [13, 19, 'new']])
  assert.equal(new Set(found.matches.map(match => match.id)).size, 2)
  assert.equal(search('中文').matches[0].location.line.newNumber, 20)
  assert.equal(search('missing').matches.length, 0)
  assert.deepEqual(search(''), { matches: [], truncated: false })
  assert.equal(search('value81 = 810;').matches.length, 1)
})

test('before/after search distinguishes removed and added lines, and selects the actual context side', () => {
  assert.equal(search('removedOnly', { ...options, side: 'new' }).matches.length, 0)
  assert.equal(search('addedOnly', { ...options, side: 'old' }).matches.length, 0)
  assert.equal(search('removedOnly').matches[0].side, 'old')
  assert.equal(search('addedOnly').matches[0].side, 'new')
  assert.equal(search('中文', { ...options, side: 'old' }).matches[0].location.line.oldNumber, 20)
  assert.equal(search('中文', { ...options, side: 'old' }).matches[0].side, 'old')
})

test('case, whole words, metacharacters and Unicode case folding keep real string offsets', () => {
  const local = indexDiff(buildUnifiedHunks([{ path: 'file.txt', oldText: null, newText: 'Needle needle needles _needle needle$ 中文 中文字 [a.*] 😀İi' }], 3), 3)
  const find = (query, changes = {}) => searchDiff(local.lines, query, { ...options, ...changes }).matches
  assert.equal(find('needle').length, 5)
  assert.equal(find('needle', { caseSensitive: true }).length, 4)
  assert.equal(find('needle', { wholeWord: true }).length, 2)
  assert.equal(find('中文', { wholeWord: true }).length, 1)
  assert.equal(find('[a.*]').length, 1)
  assert.equal(find('i')[0].start, local.lines[0].line.text.length - 1)
  assert.equal(find('😀')[0].end - find('😀')[0].start, 2)
})

test('search bounds result materialization and explicitly reports truncation', () => {
  const local = indexDiff(buildUnifiedHunks([{ path: 'many.txt', oldText: null, newText: 'x '.repeat(DIFF_SEARCH_LIMIT + 1) }], 3), 3)
  const result = searchDiff(local.lines, 'x', options)
  assert.equal(result.matches.length, DIFF_SEARCH_LIMIT)
  assert.equal(result.truncated, true)
})

test('searching hidden context reveals a seven-line window and retains every other hidden interval', () => {
  const match = search('中文').matches[0]
  const expansions = revealDiffLocation(hunks, new Map(), match.location)
  const rows = visibleHunkRows(hunks[0], expansions, true)
  const originalLines = visibleHunkRows(hunks[0], new Map()).filter(row => row.kind !== 'gap')
  const shown = rows.filter(row => row.kind !== 'gap')
  assert.equal(shown.length - originalLines.length, 7)
  assert.ok(shown.includes(match.location.line))
  assert.equal(new Set(shown).size, shown.length)
  assert.deepEqual(unifiedVisibleBlocks(rows).flatMap(block => block.lines), shown)
  assert.deepEqual(rows.filter(row => row.kind === 'gap' && row.originId).map(row => row.offset), [0, 23])
  assert.deepEqual(visibleHunkRows(hunks[0], new Map()), hunks[0].rows)
})

test('manual expansion beside a search window preserves the focus and expands only that slice', () => {
  const match = search('中文').matches[0]
  const expansions = new Map(revealDiffLocation(hunks, new Map(), match.location))
  const slice = visibleHunkRows(hunks[0], expansions).find(row => row.kind === 'gap' && row.originId && row.offset > 0)
  const before = visibleHunkRows(hunks[0], expansions).filter(row => row.kind !== 'gap')
  expansions.set(slice.originId, expandDiffGapSlice(slice, expansions.get(slice.originId), 7, 'down'))
  const after = visibleHunkRows(hunks[0], expansions).filter(row => row.kind !== 'gap')
  assert.equal(after.length - before.length, 7)
  assert.ok(after.includes(match.location.line))
  expansions.set(slice.originId, expandDiffGapSlice(slice, expansions.get(slice.originId), slice.lines.length, 'down'))
  assert.equal(new Set(visibleHunkRows(hunks[0], expansions).filter(row => row.kind !== 'gap')).size, visibleHunkRows(hunks[0], expansions).filter(row => row.kind !== 'gap').length)
})

test('navigation groups connected edits, wraps both directions and keeps repeated hunk line numbers separate', () => {
  assert.equal(index.changes.length, 3)
  assert.equal(stepDiffIndex(-1, 1, 3), 0); assert.equal(stepDiffIndex(-1, -1, 3), 2)
  assert.equal(stepDiffIndex(2, 1, 3), 0); assert.equal(stepDiffIndex(0, -1, 3), 2)
  assert.equal(stepDiffIndex(0, 1, 0), -1)
  assert.equal(nearestDiffChange(index.changes, search('中文').matches[0].location), 0)
  const repeated = indexDiff(buildUnifiedHunks([diff, diff], 3), 3)
  assert.equal(new Set(repeated.lines.map(line => line.id)).size, repeated.lines.length)
  assert.notEqual(repeated.changes[0].id, repeated.changes[3].id)
})

test('historical omissions cannot become matches and new/deleted files retain their actual sides', () => {
  const local = indexDiff(buildUnifiedHunks([{ path: 'old.py', oldStart: 400, newStart: 500, oldText: 'return old', newText: 'return new' }], 3), 3)
  assert.equal(local.lines.length, 2)
  assert.equal(searchDiff(local.lines, 'old', options).matches[0].location.line.oldNumber, 400)
  assert.equal(searchDiff(local.lines, 'new', options).matches[0].location.line.newNumber, 500)
  assert.equal(searchDiff(local.lines, 'unrecorded', options).matches.length, 0)
  for (const entry of [{ oldText: null, newText: 'new' }, { oldText: 'old', newText: '' }]) {
    const other = indexDiff(buildUnifiedHunks([{ path: 'file.cpp', ...entry }], 3), 3)
    assert.equal(searchDiff(other.lines, entry.oldText === null ? 'new' : 'old', options).matches[0].side, entry.oldText === null ? 'new' : 'old')
  }
})

test('language detection handles Windows paths, case and Python 3 variants; unknown files stay plain', () => {
  for (const [path, language] of [['D:\\repo\\SOURCE.HPP', 'cpp'], ['main.c', 'cpp'], ['a.mjs', 'javascript'], ['a.tsx', 'typescript'], ['a.PY', 'python'], ['a.pyi', 'python'], ['a.pyw', 'python'], ['data.jsonc', 'json'], ['README.md', 'markdown'], ['file.txt', 'text'], ['LICENSE', 'text']]) assert.equal(diffLanguage(path), language)
  assert.deepEqual(tokens('<script>alert(1)</script>', 'text'), [])
})

test('basic C++/JS/TS/JSON highlights keywords, strings, comments, numbers and JSON properties', () => {
  assert.deepEqual(tokens('const int count = 42; // hello', 'cpp'), [['const', 'keyword'], ['int', 'keyword'], ['42', 'number'], ['// hello', 'comment']])
  assert.deepEqual(tokens('const text = "// string";', 'javascript'), [['const', 'keyword'], ['"// string"', 'string']])
  assert.deepEqual(tokens('interface User { readonly id: number }', 'typescript'), [['interface', 'keyword'], ['readonly', 'keyword'], ['number', 'keyword']])
  assert.deepEqual(tokens('{"name": "中文", "ok": true, "n": 2}', 'json'), [['"name"', 'property'], ['"中文"', 'string'], ['"ok"', 'property'], ['true', 'keyword'], ['"n"', 'property'], ['2', 'number']])
})

test('multiline comments, JS templates and C++ raw strings carry state across recorded lines', () => {
  const state = {}; tokens('/* comment', 'cpp', state)
  assert.deepEqual(tokens('int hidden = 2; */ return 3;', 'cpp', state), [['int hidden = 2; */', 'comment'], ['return', 'keyword'], ['3', 'number']])
  const template = {}; tokens('const value = `start', 'javascript', template)
  assert.deepEqual(tokens('continued`; return 2;', 'javascript', template), [['continued`', 'string'], ['return', 'keyword'], ['2', 'number']])
  const raw = {}; assert.deepEqual(tokens('auto text = R"tag(hello', 'cpp', raw), [['auto', 'keyword'], ['R"tag(hello', 'string']])
  assert.deepEqual(tokens('world)tag";', 'cpp', raw), [['world)tag"', 'string']])
})

test('Python 3 handles decorators, comments, async, triple strings and floor division', () => {
  assert.deepEqual(tokens('async def run(value): # 中文', 'python'), [['async', 'keyword'], ['def', 'keyword'], ['# 中文', 'comment']])
  assert.deepEqual(tokens('result = 8 // 2', 'python'), [['8', 'number'], ['2', 'number']])
  const state = {}; assert.deepEqual(tokens('    """A document', 'python', state), [['"""A document', 'string']])
  assert.deepEqual(tokens('return is text', 'python', state), [['return is text', 'string']])
  assert.deepEqual(tokens('ends"""; return None', 'python', state), [['ends"""', 'string'], ['return', 'keyword'], ['None', 'keyword']])
  assert.deepEqual(tokens('name = f"hello {value}"', 'python'), [['"hello {value}"', 'string']])
  const escaped = '"""escape \\""" still string"""; return 1'
  assert.deepEqual(tokens(escaped, 'python'), [[escaped.slice(0, escaped.lastIndexOf(';')), 'string'], ['return', 'keyword'], ['1', 'number']])
})

test('Markdown highlights headings, inline code and fenced source without rendering HTML', () => {
  assert.deepEqual(tokens('# Header', 'markdown'), [['# Header', 'heading']])
  assert.deepEqual(tokens('text `code` and [link](file.md)', 'markdown'), [['`code`', 'string'], ['[link](file.md)', 'string']])
  const state = {}; tokens('```python', 'markdown', state)
  assert.deepEqual(tokens('return 1', 'markdown', state), [['return 1', 'string']])
  tokens('```', 'markdown', state); assert.deepEqual(tokens('## End', 'markdown', state), [['## End', 'heading']])
})

test('old and new lexical states stay independent when an edit changes multiline syntax', () => {
  const entries = [{ path: 'a.ts', oldText: '/*\nconst x = 1;\n*/', newText: '//\nconst x = 1;\n//' }]
  const local = buildUnifiedHunks(entries, 3)
  const syntax = highlightDiff(entries, local)
  const shared = local[0].lines.find(line => line.text === 'const x = 1;')
  assert.equal(syntax.get(shared).old[0].kind, 'comment')
  assert.equal(syntax.get(shared).next[0].kind, 'keyword')
})

test('highlight work is bounded for long lines and large files while their text remains complete', () => {
  assert.deepEqual(highlightLine('x'.repeat(HIGHLIGHT_LINE_LIMIT + 1), 'python', {}), [])
  const entries = [{ path: 'large.py', oldText: null, newText: 'x'.repeat(HIGHLIGHT_CHARACTER_LIMIT + 1) }]
  const local = buildUnifiedHunks(entries, 3)
  assert.equal(highlightDiff(entries, local).size, 0)
  assert.equal(local[0].lines[0].text.length, HIGHLIGHT_CHARACTER_LIMIT + 1)
})

test('reading enhancements preserve signed copy, change totals, split streams and comment anchors in every scope', () => {
  const revision = reviewDiffRevision([diff]); const before = JSON.stringify(diff)
  for (const scope of ['session', 'last-turn', 'pending', 'uncommitted', 'unstaged', 'staged', 'commit', 'branch']) {
    const target = { scope, turn: 1, repository: 'D:/repo', repositoryName: 'repo', path: diff.path, absolutePath: 'D:/repo/example.ts' }
    const match = search('中文').matches[0]; const rows = visibleHunkRows(hunks[0], revealDiffLocation(hunks, new Map(), match.location)).filter(row => row.kind !== 'gap')
    const anchor = lineCommentAnchor(target, match.location.line, hunks[0].lines, revision)
    highlightDiff([diff], hunks)
    assert.equal(commentAnchorKey(anchor), commentAnchorKey(lineCommentAnchor(target, splitDiffRows(rows).find(row => row.next === match.location.line).next, hunks[0].lines, revision)))
    assert.deepEqual(summarizeDiffs([diff]), { added: 3, removed: 3 })
    assert.ok(unifiedDiffText([diff]).includes('+ const addedOnly = 2;'))
  }
  assert.equal(JSON.stringify(diff), before)
})
