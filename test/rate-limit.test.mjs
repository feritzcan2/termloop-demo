import test from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter } from '../src/rate-limit.mjs';

test('allows 60 requests then blocks the 61st', () => {
  const check = createRateLimiter();
  for (let i = 0; i < 60; i++) assert.equal(check('1.1.1.1', 1000).allowed, true);
  const res = check('1.1.1.1', 1000);
  assert.equal(res.allowed, false);
  assert.equal(res.remaining, 0);
});

test('retryAfter is seconds until the window ends', () => {
  const check = createRateLimiter({ limit: 1 });
  check('a', 0);
  assert.equal(check('a', 10_000).retryAfter, 50);
});

test('clients are limited independently', () => {
  const check = createRateLimiter({ limit: 1 });
  check('a', 0);
  assert.equal(check('a', 0).allowed, false);
  assert.equal(check('b', 0).allowed, true);
});

test('window resets after windowMs', () => {
  const check = createRateLimiter({ limit: 1 });
  check('a', 0);
  assert.equal(check('a', 59_999).allowed, false);
  assert.equal(check('a', 60_000).allowed, true);
});
