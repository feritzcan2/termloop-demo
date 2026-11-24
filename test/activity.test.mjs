import test from 'node:test';
import assert from 'node:assert/strict';
import { formatActivity, relativeTime } from '../src/activity.mjs';

const now = new Date('2026-11-24T16:00:00Z');

test('relativeTime picks the largest unit', () => {
  assert.equal(relativeTime('2026-11-24T15:42:00Z', now), '18 minutes ago');
  assert.equal(relativeTime('2026-11-24T13:00:00Z', now), '3 hours ago');
  assert.equal(relativeTime('2026-11-23T16:00:00Z', now), 'yesterday');
  assert.equal(relativeTime('2026-11-24T16:00:20Z', now), 'just now');
});

test('activity is newest first', () => {
  const out = formatActivity([{ at: '2026-11-22T00:00:00Z' }, { at: '2026-11-24T00:00:00Z' }], now);
  assert.equal(out[0].at, '2026-11-24T00:00:00Z');
});
