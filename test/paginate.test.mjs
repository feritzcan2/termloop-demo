import test from 'node:test';
import assert from 'node:assert/strict';
import { paginate } from '../src/paginate.mjs';

const items = Array.from({ length: 12 }, (_, i) => i + 1);

test('page 1 starts with the first item', () => {
  const result = paginate(items, 1);
  assert.deepEqual(result.items, [1, 2, 3, 4, 5]);
  assert.equal(result.page, 1);
  assert.equal(result.pages, 3);
  assert.equal(result.total, 12);
});

test('last page returns the remaining items', () => {
  const result = paginate(items, 3);
  assert.deepEqual(result.items, [11, 12]);
  assert.equal(result.page, 3);
});

test('out-of-range pages clamp to the last page', () => {
  const high = paginate(items, 99);
  assert.deepEqual(high.items, [11, 12]);
  assert.equal(high.page, 3);
  assert.equal(paginate(items, 0).page, 1);
  assert.equal(paginate(items, -4).page, 1);
});

test('empty list yields a single empty page', () => {
  assert.deepEqual(paginate([], 1), { items: [], page: 1, pages: 1, total: 0 });
});

test('perPage is capped at 50', () => {
  const many = Array.from({ length: 120 }, (_, i) => i);
  const result = paginate(many, 1, 1000);
  assert.equal(result.items.length, 50);
  assert.equal(result.pages, 3);
});

test('invalid perPage falls back to the default of 5', () => {
  assert.equal(paginate(items, 1, 0).items.length, 5);
  assert.equal(paginate(items, 1, NaN).items.length, 5);
  assert.equal(paginate(items, 1, 3).items.length, 3);
});
