import test from 'node:test';
import assert from 'node:assert/strict';
import { clientKey, createRateLimiter, isRateLimited, rateLimitHeaders } from '../src/rate-limit.mjs';

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

test('headers report limit and remaining on allowed requests', () => {
  const check = createRateLimiter();
  check('a', 0);
  const h = rateLimitHeaders(check('a', 0));
  assert.deepEqual(h, { 'x-ratelimit-limit': '60', 'x-ratelimit-remaining': '58' });
});

test('headers on a blocked request include Retry-After and remaining 0', () => {
  const check = createRateLimiter({ limit: 1 });
  check('a', 0);
  const h = rateLimitHeaders(check('a', 20_000));
  assert.equal(h['x-ratelimit-limit'], '1');
  assert.equal(h['x-ratelimit-remaining'], '0');
  assert.equal(h['retry-after'], '40');
});

const spoofed = { headers: { 'x-forwarded-for': '9.9.9.9, 2.2.2.2' }, remoteAddress: '10.0.0.1' };

test('clientKey ignores X-Forwarded-For by default', () => {
  assert.equal(clientKey(spoofed), '10.0.0.1');
  assert.equal(clientKey(spoofed, { trustProxy: false }), '10.0.0.1');
});

test('clientKey uses the proxy-appended X-Forwarded-For entry when trusted', () => {
  assert.equal(clientKey(spoofed, { trustProxy: true }), '2.2.2.2');
});

test('clientKey falls back to the socket address when trusted but header missing', () => {
  assert.equal(clientKey({ headers: {}, remoteAddress: '10.0.0.1' }, { trustProxy: true }), '10.0.0.1');
  assert.equal(clientKey({}, { trustProxy: true }), 'unknown');
});

test('spoofing X-Forwarded-For cannot dodge the limit when untrusted', () => {
  const check = createRateLimiter({ limit: 1 });
  const a = { headers: { 'x-forwarded-for': '1.1.1.1' }, remoteAddress: '10.0.0.1' };
  const b = { headers: { 'x-forwarded-for': '3.3.3.3' }, remoteAddress: '10.0.0.1' };
  check(clientKey(a), 0);
  assert.equal(check(clientKey(b), 0).allowed, false);
});

test('stats report active clients and total blocked requests', () => {
  const check = createRateLimiter({ limit: 1 });
  assert.deepEqual(check.stats(0), { activeClients: 0, blocked: 0 });
  check('a', 0);
  check('a', 0); // blocked
  check('a', 0); // blocked
  check('b', 0);
  assert.deepEqual(check.stats(0), { activeClients: 2, blocked: 2 });
  // Expired windows are no longer active; blocked is cumulative.
  assert.deepEqual(check.stats(60_000), { activeClients: 0, blocked: 2 });
});

test('/api/health is exempt from rate limiting; other /api paths and static files behave', () => {
  assert.equal(isRateLimited('/api/health'), false);
  assert.equal(isRateLimited('/api/releases'), true);
  assert.equal(isRateLimited('/api/activity'), true);
  assert.equal(isRateLimited('/index.html'), false);
});

test('exempt health checks never consume quota', () => {
  const check = createRateLimiter({ limit: 1 });
  for (let i = 0; i < 100; i++) if (isRateLimited('/api/health')) check('a', 0);
  assert.equal(check('a', 0).allowed, true);
  assert.equal(check.stats(0).blocked, 0);
});
