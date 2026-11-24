import test from 'node:test';
import assert from 'node:assert/strict';
import { handle } from '../src/api.mjs';

const get = (url) => {
  const res = handle('GET', url, new Date('2026-11-24'));
  return { status: res.status, body: JSON.parse(res.body) };
};

test('GET /api/releases/:id returns one release', () => {
  const { status, body } = get('/api/releases/r-141');
  assert.equal(status, 200);
  assert.equal(body.name, 'Mobile onboarding');
  assert.equal(body.status, 'ready');
});

test('unknown release is a 404', () => {
  assert.equal(get('/api/releases/nope').status, 404);
});

test('non-GET requests are rejected', () => {
  assert.equal(handle('POST', '/api/releases').status, 405);
});

test('unknown paths fall through to static files', () => {
  assert.equal(handle('GET', '/index.html'), null);
});

test('releases can be searched by owner', () => {
  const { body } = get('/api/releases?q=maya');
  assert.equal(body.total, 2);
});

test('every /api response carries rate limit headers', async () => {
  const { createRateLimiter } = await import('../src/ratelimit.mjs');
  const limiter = createRateLimiter({ limit: 3 });
  const call = (method, url) => handle(method, url, new Date('2026-11-24'), 'c1', limiter);
  const ok = call('GET', '/api/releases');
  assert.equal(ok.headers['x-ratelimit-limit'], '3');
  assert.equal(ok.headers['x-ratelimit-remaining'], '2');
  const missing = call('GET', '/api/releases/nope');
  assert.equal(missing.status, 404);
  assert.equal(missing.headers['x-ratelimit-remaining'], '1');
  const post = call('POST', '/api/releases');
  assert.equal(post.headers['x-ratelimit-remaining'], '0');
  assert.equal(call('GET', '/api/activity').headers['x-ratelimit-remaining'], '0');
});

test('rate limit is tracked per client and resets after the window', async () => {
  const { createRateLimiter } = await import('../src/ratelimit.mjs');
  let t = 0;
  const limiter = createRateLimiter({ limit: 2, windowMs: 1000, now: () => t });
  assert.equal(limiter.hit('a').remaining, 1);
  assert.equal(limiter.hit('b').remaining, 1);
  assert.equal(limiter.hit('a').remaining, 0);
  t = 1000;
  assert.equal(limiter.hit('a').remaining, 1);
});

test('static fall-through has no rate limit headers', () => {
  assert.equal(handle('GET', '/styles.css'), null);
});
