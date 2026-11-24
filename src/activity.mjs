export function formatActivity(entries) {
  return [...entries]
    .sort((a, b) => b.at.localeCompare(a.at))
    .map((entry) => ({ ...entry, when: new Date(entry.at).toUTCString() }));
}
