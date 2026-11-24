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

test('perPage defaults to 5 and is capped at 50', () => {
  assert.equal(get('/api/releases').body.items.length, Math.min(5, get('/api/releases').body.total));
  const capped = get('/api/releases?perPage=1000').body;
  assert.ok(capped.items.length <= 50);
  assert.equal(capped.items.length, Math.min(capped.total, 50));
  assert.equal(get('/api/releases?perPage=2').body.items.length, 2);
});
