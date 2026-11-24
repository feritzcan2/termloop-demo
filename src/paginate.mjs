/**
 * Returns one page of items. Pages are 1-based.
 */
export const DEFAULT_PER_PAGE = 5;
export const MAX_PER_PAGE = 50;

export function paginate(items, page = 1, requested = DEFAULT_PER_PAGE) {
  const size = Math.floor(Number(requested));
  const perPage = Number.isFinite(size) && size >= 1 ? Math.min(size, MAX_PER_PAGE) : DEFAULT_PER_PAGE;
  const pages = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(Math.max(1, page), pages);
  const start = (current - 1) * perPage;
  return { items: items.slice(start, start + perPage), page: current, pages, total: items.length };
}
