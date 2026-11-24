// Fixed-window, in-memory rate limiter. No I/O; the clock is injectable.
export function createRateLimiter({ limit = 60, windowMs = 60_000 } = {}) {
  const hits = new Map(); // key -> { start, count }

  return function check(key, now = Date.now()) {
    // Drop expired windows so the map cannot grow without bound.
    for (const [k, w] of hits) if (now - w.start >= windowMs) hits.delete(k);

    let w = hits.get(key);
    if (!w) {
      w = { start: now, count: 0 };
      hits.set(key, w);
    }
    w.count += 1;
    const retryAfter = Math.max(1, Math.ceil((w.start + windowMs - now) / 1000));
    return {
      allowed: w.count <= limit,
      limit,
      remaining: Math.max(0, limit - w.count),
      retryAfter,
    };
  };
}

// Headers sent on every /api response (Retry-After is added only when blocked).
export function rateLimitHeaders(verdict) {
  const headers = {
    'x-ratelimit-limit': String(verdict.limit),
    'x-ratelimit-remaining': String(verdict.remaining),
  };
  if (!verdict.allowed) headers['retry-after'] = String(verdict.retryAfter);
  return headers;
}

// Picks the rate-limit key for a request. X-Forwarded-For is client-controlled,
// so it is only honored when trustProxy is set (TRUST_PROXY=1, i.e. behind a
// reverse proxy that appends the real peer address). The proxy appends to the
// right, so the rightmost entry is the one that cannot be spoofed by a client.
export function clientKey({ headers = {}, remoteAddress } = {}, { trustProxy = false } = {}) {
  if (trustProxy) {
    const xff = headers['x-forwarded-for'];
    const value = Array.isArray(xff) ? xff.join(',') : xff;
    const last = value?.split(',').map((s) => s.trim()).filter(Boolean).pop();
    if (last) return last;
  }
  return remoteAddress ?? 'unknown';
}
