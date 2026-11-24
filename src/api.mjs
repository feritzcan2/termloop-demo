import { activity, releases } from './data.mjs';
import { formatActivity } from './activity.mjs';
import { paginate } from './paginate.mjs';
import { sortByTarget, summarize } from './releases.mjs';
import { createRateLimiter } from './ratelimit.mjs';

const defaultLimiter = createRateLimiter();

const json = (status, body) => ({ status, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

export function handle(method, url, today = new Date(), client = 'anonymous', limiter = defaultLimiter) {
  const res = route(method, url, today);
  if (!res) return res;
  const { limit, remaining } = limiter.hit(client);
  res.headers['x-ratelimit-limit'] = String(limit);
  res.headers['x-ratelimit-remaining'] = String(remaining);
  return res;
}

function route(method, url, today) {
  if (method !== 'GET') return json(405, { error: 'Method not allowed' });
  const { pathname, searchParams } = new URL(url, 'http://localhost');
  if (pathname === '/api/releases') {
    const page = Number(searchParams.get('page') ?? 1);
    const query = (searchParams.get('q') ?? '').trim().toLowerCase();
    const matches = releases.filter((r) => !query || `${r.name} ${r.owner}`.toLowerCase().includes(query));
    const list = sortByTarget(matches).map((r) => summarize(r, today));
    return json(200, paginate(list, page));
  }
  const match = pathname.match(/^\/api\/releases\/([\w-]+)$/);
  if (match) {
    const release = releases.find((r) => r.id === match[1]);
    return release ? json(200, summarize(release, today)) : json(404, { error: 'Release not found' });
  }
  if (pathname === '/api/activity') return json(200, formatActivity(activity));
  return null;
}
