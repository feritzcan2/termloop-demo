import test from 'node:test';
import assert from 'node:assert/strict';
import { progress, status, sortByTarget } from '../src/releases.mjs';

const release = (done, total, target = '2026-12-31') => ({
  target,
  checklist: Array.from({ length: total }, (_, i) => ({ id: `c${i}`, text: 'x', done: i < done })),
});

test('progress is a rounded percentage', () => {
  assert.equal(progress(release(1, 3)), 33);
  assert.equal(progress(release(3, 3)), 100);
});

test('status is ready when the checklist is complete', () => {
  assert.equal(status(release(2, 2)), 'ready');
});

test('status is at-risk close to the target date', () => {
  assert.equal(status(release(0, 2, '2026-11-26'), new Date('2026-11-24')), 'at-risk');
  assert.equal(status(release(0, 2, '2026-12-20'), new Date('2026-11-24')), 'on-track');
});

test('sortByTarget orders by target date without mutating input', () => {
  const input = [{ target: '2026-12-09' }, { target: '2026-11-28' }];
  assert.deepEqual(sortByTarget(input).map((r) => r.target), ['2026-11-28', '2026-12-09']);
  assert.equal(input[0].target, '2026-12-09');
});
