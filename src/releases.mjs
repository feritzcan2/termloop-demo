/** Percentage of completed checklist items, 0-100. */
export function progress(release) {
  const items = release.checklist;
  const done = items.filter((item) => item.done).length;
  return Math.round((done / items.length) * 100);
}

/** 'ready' when every item is done, 'at-risk' when the target is within 3 days, else 'on-track'. */
export function status(release, today = new Date()) {
  if (progress(release) === 100) return 'ready';
  const days = (Date.parse(release.target) - today.getTime()) / 86_400_000;
  return days <= 3 ? 'at-risk' : 'on-track';
}

export function summarize(release, today) {
  return { ...release, progress: progress(release), status: status(release, today) };
}

export function sortByTarget(releases) {
  return [...releases].sort((a, b) => a.target.localeCompare(b.target));
}
