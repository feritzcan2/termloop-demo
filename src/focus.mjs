/**
 * Index to focus after a j/k key press in a list of `count` items.
 * `current` is the focused index, or -1 when nothing in the list has focus.
 * Movement stops at the ends; any other key (or an empty list) returns `current`.
 */
export function nextFocusIndex(current, count, key) {
  if (count <= 0) return -1;
  if (key === 'j') return Math.min(current + 1, count - 1);
  if (key === 'k') return current < 0 ? 0 : Math.max(current - 1, 0);
  return current;
}
