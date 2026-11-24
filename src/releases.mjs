/** Percentage of completed checklist items, 0-100. */
export function progress(release) {
  const items = release.checklist;
  if (items.length === 0) return 0;
  const done = items.filter((item) => item.done).length;
  return Math.round((done / items.length) * 100);
}

/** Text label such as "3 of 5 done"; empty checklists read "No checklist yet". */
export function progressLabel(release) {
  const total = release.checklist.length;
  if (total === 0) return 'No checklist yet';
  return `${release.checklist.filter((item) => item.done).length} of ${total} done`;
}

/** 'ready' when every item is done, 'at-risk' when the target is within 3 days, else 'on-track'. */
export function status(release, today = new Date()) {
  if (release.checklist.length > 0 && progress(release) === 100) return 'ready';
  const days = (Date.parse(release.target) - today.getTime()) / 86_400_000;
  return days <= 3 ? 'at-risk' : 'on-track';
}

export function summarize(release, today) {
  return { ...release, progress: progress(release), progressLabel: progressLabel(release), status: status(release, today) };
}

export function sortByTarget(releases) {
  return [...releases].sort((a, b) => a.target.localeCompare(b.target));
}

/** Blocked releases first, then by target date. Does not mutate the input. */
export function sortReleases(releases) {
  return [...releases].sort((a, b) => Number(Boolean(b.blocked)) - Number(Boolean(a.blocked)) || a.target.localeCompare(b.target));
}
