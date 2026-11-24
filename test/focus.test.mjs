import test from 'node:test';
import assert from 'node:assert/strict';
import { nextFocusIndex } from '../src/focus.mjs';

test('j moves to the next item', () => assert.equal(nextFocusIndex(1, 5, 'j'), 2));
test('k moves to the previous item', () => assert.equal(nextFocusIndex(3, 5, 'k'), 2));
test('j stops at the last item', () => assert.equal(nextFocusIndex(4, 5, 'j'), 4));
test('k stops at the first item', () => assert.equal(nextFocusIndex(0, 5, 'k'), 0));
test('j with nothing focused picks the first item', () => assert.equal(nextFocusIndex(-1, 5, 'j'), 0));
test('k with nothing focused picks the first item', () => assert.equal(nextFocusIndex(-1, 5, 'k'), 0));
test('an empty list yields no focus', () => {
  assert.equal(nextFocusIndex(-1, 0, 'j'), -1);
  assert.equal(nextFocusIndex(0, 0, 'k'), -1);
});
test('other keys leave focus unchanged', () => assert.equal(nextFocusIndex(2, 5, 'x'), 2));
