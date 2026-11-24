/**
 * Returns one page of items. Pages are 1-based.
 */
export function paginate(items, page = 1, perPage = 5) {
  const pages = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(Math.max(1, page), pages);
  const start = current * perPage;
  return { items: items.slice(start, start + perPage), page: current, pages, total: items.length };
}
