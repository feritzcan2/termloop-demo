const units = [['day', 86_400_000], ['hour', 3_600_000], ['minute', 60_000]];
const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function relativeTime(iso, now = new Date()) {
  const diff = Date.parse(iso) - now.getTime();
  for (const [unit, ms] of units) {
    if (Math.abs(diff) >= ms) return rtf.format(Math.round(diff / ms), unit);
  }
  return 'just now';
}

export function formatActivity(entries, now = new Date()) {
  return [...entries]
    .sort((a, b) => b.at.localeCompare(a.at))
    .map((entry) => ({ ...entry, when: relativeTime(entry.at, now) }));
}
