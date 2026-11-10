type Bucket = { count: number; resetAt: number };

/**
 * Fixed-window, in-memory rate limiter.
 * NOTE: per-process only — swap for Redis/Upstash when running multiple instances.
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const buckets = new Map<string, Bucket>();

  function sweep(now: number) {
    if (buckets.size < 10_000) return;
    for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
  }

  return {
    /** Records a hit and returns whether the caller is still within the limit. */
    hit(key: string) {
      const now = Date.now();
      sweep(now);
      const bucket = buckets.get(key);
      if (!bucket || bucket.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
      }
      bucket.count += 1;
      return {
        allowed: bucket.count <= limit,
        remaining: Math.max(0, limit - bucket.count),
        resetAt: bucket.resetAt,
      };
    },
    reset(key: string) {
      buckets.delete(key);
    },
  };
}
