import test from 'node:test';
import assert from 'node:assert/strict';
import { paginate } from '../src/paginate.mjs';

test('page 1 starts at the first item and later pages continue', () => {
  const items = [1, 2, 3, 4, 5, 6, 7];
  assert.deepEqual(paginate(items, 1).items, [1, 2, 3, 4, 5]);
  assert.deepEqual(paginate(items, 2).items, [6, 7]);
  assert.equal(paginate(items, 9).page, 2);
});
