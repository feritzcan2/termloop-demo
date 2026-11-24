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

test('GET /api/health returns status, uptime and limiter stats from the provider', () => {
  const health = () => ({ uptimeSeconds: 42, limiter: { activeClients: 3, blocked: 7 } });
  const res = handle('GET', '/api/health', new Date(), { health });
  assert.equal(res.status, 200);
  assert.deepEqual(JSON.parse(res.body), {
    status: 'ok',
    uptimeSeconds: 42,
    limiter: { activeClients: 3, blocked: 7 },
  });
});

test('GET /api/health works without a provider', () => {
  assert.deepEqual(get('/api/health').body, { status: 'ok' });
});
