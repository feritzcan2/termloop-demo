import test from 'node:test';
import assert from 'node:assert/strict';
import { keyFocusTarget, nextFocusIndex, restoreFocusIndex } from '../src/focus.mjs';

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

test('a single item stays focused for j and k', () => {
  for (const from of [-1, 0]) {
    assert.equal(nextFocusIndex(from, 1, 'j'), 0);
    assert.equal(nextFocusIndex(from, 1, 'k'), 0);
  }
});
test('an empty list yields no focus from -1', () => {
  assert.equal(nextFocusIndex(-1, 0, 'j'), -1);
  assert.equal(nextFocusIndex(-1, 0, 'k'), -1);
});
test('an unknown key from -1 stays at -1', () => assert.equal(nextFocusIndex(-1, 5, 'x'), -1));
test('uppercase and arrow keys are ignored', () => {
  for (const key of ['J', 'K', 'ArrowDown', 'ArrowUp']) assert.equal(nextFocusIndex(2, 5, key), 2);
});
test('an out-of-range current is clamped', () => {
  assert.equal(nextFocusIndex(7, 5, 'k'), 3);
  assert.equal(nextFocusIndex(7, 5, 'j'), 4);
  assert.equal(nextFocusIndex(9, 5, 'x'), 4);
});

test('keyFocusTarget moves from the focused item', () => {
  assert.equal(keyFocusTarget(1, 3, 5, 'j'), 2);
  assert.equal(keyFocusTarget(1, 3, 5, 'k'), 0);
});
test('keyFocusTarget lands on the roving item when focus is outside the list', () => {
  assert.equal(keyFocusTarget(-1, 3, 5, 'j'), 3);
  assert.equal(keyFocusTarget(-1, 3, 5, 'k'), 3);
  assert.equal(keyFocusTarget(-1, 0, 5, 'j'), 0);
});
test('keyFocusTarget falls back to the first item without a valid roving item', () => {
  assert.equal(keyFocusTarget(-1, -1, 5, 'j'), 0);
  assert.equal(keyFocusTarget(-1, 9, 5, 'k'), 0);
});
test('keyFocusTarget ignores other keys and empty lists', () => {
  assert.equal(keyFocusTarget(1, 1, 5, 'x'), -1);
  assert.equal(keyFocusTarget(-1, -1, 0, 'j'), -1);
});

test('restoreFocusIndex prefers the opener card', () => {
  assert.equal(restoreFocusIndex(['a', 'b', 'c'], 'b', 0), 1);
});
test('restoreFocusIndex falls back to the roving item, then the first', () => {
  assert.equal(restoreFocusIndex(['a', 'b', 'c'], 'gone', 2), 2);
  assert.equal(restoreFocusIndex(['a', 'b', 'c'], 'gone', -1), 0);
  assert.equal(restoreFocusIndex(['a', 'b', 'c'], 'gone', 7), 0);
});
test('restoreFocusIndex returns -1 for an empty list', () => {
  assert.equal(restoreFocusIndex([], 'a', 0), -1);
});
