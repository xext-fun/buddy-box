const test = require('node:test');
const assert = require('node:assert/strict');
const { parseCsv, normalizeHandle, extractHandles, toCsv } = require('../src/handles.js');

test('parses quoted CSV fields and embedded newlines', () => {
  assert.deepEqual(parseCsv('name,handle\r\n"A, B","@Alice"\r\n"Multi\nLine",bob\r\n'), [
    ['name', 'handle'], ['A, B', '@Alice'], ['Multi\nLine', 'bob']
  ]);
});

test('finds handle column, normalizes profile URLs, and deduplicates', () => {
  assert.deepEqual(extractHandles('name,username,notes\nAlice,@Alice,x\nBob,https://www.tiktok.com/@bob,y\nAgain,alice,z').handles, ['alice', 'bob']);
});

test('accepts headerless one-column CSV and rejects ambiguous wide CSV', () => {
  assert.deepEqual(extractHandles('@Alice\nbob\n').handles, ['alice', 'bob']);
  assert.throws(() => extractHandles('name,email\nAlice,a@example.com'), /handle column/);
});

test('exports a reusable CSV', () => {
  assert.deepEqual(extractHandles(toCsv(['bob', 'alice'])).handles, ['alice', 'bob']);
  assert.equal(normalizeHandle('not a handle'), null);
});
