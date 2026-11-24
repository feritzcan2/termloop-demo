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
      remaining: Math.max(0, limit - w.count),
      retryAfter,
    };
  };
}
