// WCAG AA contrast check for badge and progress tokens in both themes.
// Reads the tokens straight from public/styles.css so it cannot drift.
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../public/styles.css', import.meta.url), 'utf8');

function tokens(selectorPattern) {
  const m = css.match(new RegExp(selectorPattern + '\\s*\\{([^}]*)\\}'));
  if (!m) throw new Error(`No CSS block matches ${selectorPattern}`);
  return Object.fromEntries([...m[1].matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-f]{6})\s*;/gi)].map((t) => [t[1], t[2]]));
}

const themes = {
  light: tokens(String.raw`:root`),
  dark: tokens(String.raw`:root\[data-theme="dark"\]`),
};
// The prefers-color-scheme block must stay in sync with the explicit dark theme.
const mediaDark = tokens(String.raw`:root:not\(\[data-theme="light"\]\)`);

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Badges are 12px text (AA: 4.5:1); the progress fill is a UI component (AA: 3:1).
const pairs = [
  ['badge', '--text', '--border', 4.5],
  ['badge.ready', '--ok', '--ok-bg', 4.5],
  ['badge.at-risk', '--warn', '--warn-bg', 4.5],
  ['progress', '--accent', '--track', 3],
];

let failed = 0;
for (const key of Object.keys(mediaDark)) {
  if (mediaDark[key] !== themes.dark[key]) {
    failed++;
    console.error(`FAIL  ${key}: prefers-color-scheme dark (${mediaDark[key]}) differs from data-theme=dark (${themes.dark[key]})`);
  }
}
for (const [theme, t] of Object.entries(themes)) {
  for (const [name, fg, bg, min] of pairs) {
    const ratio = contrast(t[fg], t[bg]);
    const ok = ratio >= min;
    if (!ok) failed++;
    console.log(`${ok ? 'ok   ' : 'FAIL '} ${theme.padEnd(5)} ${name.padEnd(14)} ${fg} on ${bg}: ${ratio.toFixed(2)}:1 (min ${min}:1)`);
  }
}
if (failed) {
  console.error(`\n${failed} contrast check(s) failed`);
  process.exit(1);
}
