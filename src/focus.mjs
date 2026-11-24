/**
 * Index to focus after a j/k key press in a list of `count` items.
 * `current` is the focused index, or -1 when nothing in the list has focus.
 * Movement stops at the ends; any other key (or an empty list) returns `current`.
 * An out-of-range `current` is clamped into the list first.
 */
export function nextFocusIndex(current, count, key) {
  if (count <= 0) return -1;
  const from = Math.min(current, count - 1);
  if (key === 'j') return Math.min(from + 1, count - 1);
  if (key === 'k') return from < 0 ? 0 : Math.max(from - 1, 0);
  return from;
}

/**
 * Index to focus for a j/k press given the focused item (`active`, -1 if focus is
 * outside the list) and the roving-tabindex item (`roving`, -1 if none).
 * With focus outside the list, the first press lands on the roving item instead of
 * skipping past it. Other keys return -1 (no change).
 */
export function keyFocusTarget(active, roving, count, key) {
  if (count <= 0 || (key !== 'j' && key !== 'k')) return -1;
  if (active >= 0) return nextFocusIndex(active, count, key);
  return roving >= 0 && roving < count ? roving : 0;
}

/**
 * Index to restore focus to when a panel closes: the item with `openerId` if it is
 * still listed, else the roving item, else the first item; -1 for an empty list.
 */
export function restoreFocusIndex(ids, openerId, roving) {
  if (ids.length === 0) return -1;
  const same = ids.indexOf(openerId);
  if (same >= 0) return same;
  return roving >= 0 && roving < ids.length ? roving : 0;
}
