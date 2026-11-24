import test from 'node:test';
import assert from 'node:assert/strict';
import { ownersOf, filterByOwner, ownerFromSearch, withOwner } from '../public/owner-filter.js';

const releases = [{ id: 1, owner: 'Maya' }, { id: 2, owner: 'Jonas' }, { id: 3, owner: 'Maya' }];

test('ownersOf returns sorted unique owners', () => {
  assert.deepEqual(ownersOf(releases), ['Jonas', 'Maya']);
});

test('filterByOwner keeps only that owner, and empty means all', () => {
  assert.deepEqual(filterByOwner(releases, 'Maya').map((r) => r.id), [1, 3]);
  assert.equal(filterByOwner(releases, '').length, 3);
  assert.equal(filterByOwner(releases, 'Nobody').length, 0);
});

test('ownerFromSearch and withOwner round-trip and keep other params', () => {
  assert.equal(ownerFromSearch('?owner=Maya%20K'), 'Maya K');
  assert.equal(ownerFromSearch(''), '');
  assert.equal(withOwner('?q=x', 'Maya'), '?q=x&owner=Maya');
  assert.equal(withOwner('?owner=Maya', ''), '');
  assert.equal(ownerFromSearch(withOwner('', 'Maya K')), 'Maya K');
});
