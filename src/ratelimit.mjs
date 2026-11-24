// Fixed-window request counter. Pure in-memory; the clock is injectable for tests.
export function createRateLimiter({ limit = 100, windowMs = 60_000, now = Date.now } = {}) {
  const windows = new Map();
  return {
    limit,
    hit(key) {
      const t = now();
      let w = windows.get(key);
      if (!w || t >= w.resetAt) {
        w = { count: 0, resetAt: t + windowMs };
        windows.set(key, w);
      }
      w.count += 1;
      return { limit, remaining: Math.max(0, limit - w.count) };
    },
  };
}
