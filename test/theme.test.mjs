import test from 'node:test';
import assert from 'node:assert/strict';
import { KEY, nextTheme, readTheme, setTheme } from '../public/theme.mjs';

const memoryStorage = () => {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) };
};
const fakeRoot = () => {
  const attrs = {};
  return {
    attrs,
    setAttribute: (k, v) => { attrs[k] = v; },
    removeAttribute: (k) => { delete attrs[k]; },
  };
};

test('theme cycles System, Light, Dark and wraps', () => {
  assert.equal(nextTheme('system'), 'light');
  assert.equal(nextTheme('light'), 'dark');
  assert.equal(nextTheme('dark'), 'system');
});

test('choice is persisted and applied to the root element', () => {
  const storage = memoryStorage();
  const root = fakeRoot();
  let theme = readTheme(storage);
  assert.equal(theme, 'system');
  for (const expected of ['light', 'dark', 'system']) {
    theme = nextTheme(theme);
    setTheme(root, storage, theme);
    assert.equal(theme, expected);
    assert.equal(storage.getItem(KEY), expected);
    assert.equal(readTheme(storage), expected);
    assert.equal(root.attrs['data-theme'], expected === 'system' ? undefined : expected);
  }
});

test('invalid or unavailable storage falls back to system', () => {
  assert.equal(readTheme({ getItem: () => 'purple' }), 'system');
  assert.equal(readTheme({ getItem: () => { throw new Error('blocked'); } }), 'system');
  assert.doesNotThrow(() => setTheme(fakeRoot(), { setItem: () => { throw new Error('blocked'); } }, 'dark'));
});
