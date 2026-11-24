/** Sorted unique owner names. */
export function ownersOf(releases) {
  return [...new Set(releases.map((r) => r.owner))].sort((a, b) => a.localeCompare(b));
}

/** Releases owned by `owner`; an empty owner ("All") returns everything. */
export function filterByOwner(releases, owner) {
  return owner ? releases.filter((r) => r.owner === owner) : [...releases];
}

/** Reads ?owner= from a query string; returns '' when absent. */
export function ownerFromSearch(search) {
  return new URLSearchParams(search).get('owner') ?? '';
}

/** Returns the query string with owner set (or removed when empty), keeping other params. */
export function withOwner(search, owner) {
  const params = new URLSearchParams(search);
  if (owner) params.set('owner', owner);
  else params.delete('owner');
  const out = params.toString();
  return out ? `?${out}` : '';
}
