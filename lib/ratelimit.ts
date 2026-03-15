import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// 5 requests per minute per IP, sliding window
// Falls back to no-op if env vars are not set (local dev)
export function getRatelimiter(): Ratelimit | null {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return null;
  }
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    prefix: 'sn-docs-demo',
  });
}
