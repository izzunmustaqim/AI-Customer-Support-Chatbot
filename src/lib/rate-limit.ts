// =============================================
// In-memory IP-based rate limiter
// Suitable for single-instance VPS deployments
// =============================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const requests = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

if (typeof globalThis !== 'undefined') {
  // Use a global flag to avoid multiple cleanup intervals in dev (hot reload)
  const key = '__rateLimitCleanup';
  if (!(globalThis as Record<string, unknown>)[key]) {
    (globalThis as Record<string, unknown>)[key] = true;
    setInterval(() => {
      const now = Date.now();
      for (const [ip, entry] of requests) {
        if (now > entry.resetAt) {
          requests.delete(ip);
        }
      }
    }, CLEANUP_INTERVAL_MS);
  }
}

/**
 * Check if a request from the given IP is within rate limits.
 *
 * @param ip - The client IP address
 * @param windowMs - Time window in milliseconds (default: 60s)
 * @param maxRequests - Max requests per window (default: 20)
 * @returns Object with `allowed` boolean and `remaining` count
 */
export function checkRateLimit(
  ip: string,
  windowMs: number = 60_000,
  maxRequests: number = 20
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = requests.get(ip);

  // First request or window expired — reset
  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    requests.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  // Within window — increment
  entry.count++;
  const remaining = Math.max(0, maxRequests - entry.count);

  return {
    allowed: entry.count <= maxRequests,
    remaining,
    resetAt: entry.resetAt,
  };
}
