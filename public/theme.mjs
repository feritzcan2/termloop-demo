export const KEY = 'launchpad-theme';
export const THEMES = ['system', 'light', 'dark'];

export function nextTheme(current) {
  return THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
}

export function readTheme(storage) {
  try {
    const v = storage.getItem(KEY);
    return THEMES.includes(v) ? v : 'system';
  } catch { return 'system'; }
}

export function applyTheme(root, theme) {
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
}

export function setTheme(root, storage, theme) {
  applyTheme(root, theme);
  try { storage.setItem(KEY, theme); } catch { /* storage unavailable */ }
}

export function initTheme(doc = document, storage = localStorage) {
  const current = readTheme(storage);
  applyTheme(doc.documentElement, current);
  doc.querySelectorAll('#theme input').forEach((input) => {
    input.checked = input.value === current;
    input.addEventListener('change', () => setTheme(doc.documentElement, storage, input.value));
  });
}

if (typeof document !== 'undefined') initTheme();
