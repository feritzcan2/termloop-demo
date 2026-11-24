import test from 'node:test';
import assert from 'node:assert/strict';
import { toCsv } from '../src/csv.mjs';

test('toCsv quotes commas and quotes', () => {
  const csv = toCsv([{ name: 'Checkout, v3', note: 'say "hi"' }], ['name', 'note']);
  assert.equal(csv, 'name,note\n"Checkout, v3","say ""hi"""');
});
