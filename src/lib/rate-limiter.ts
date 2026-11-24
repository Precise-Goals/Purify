/**
 * In-Memory Sliding-Window Rate Limiter
 * 8 requests per minute per IP.
 * Bounded memory (max 5,000 entries) with automatic pruning.
 */

export interface RateLimiterOptions {
  maxRequests?: number;
  windowMs?: number;
  maxEntries?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

interface WindowBucket {
  timestamps: number[];
  lastUpdated: number;
}

export class RateLimiter {
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly maxEntries: number;
  private readonly store: Map<string, WindowBucket> = new Map();

  constructor(options: RateLimiterOptions = {}) {
    this.maxRequests = options.maxRequests ?? 8;
    this.windowMs = options.windowMs ?? 60 * 1000; // 60 seconds
    this.maxEntries = options.maxEntries ?? 5000;
  }

  public check(ip: string, now: number = Date.now()): RateLimitResult {
    const key = ip || "unknown";
    const windowStart = now - this.windowMs;

    let bucket = this.store.get(key);
    if (!bucket) {
      if (this.store.size >= this.maxEntries) {
        this.prune(now);
      }
      bucket = { timestamps: [], lastUpdated: now };
      this.store.set(key, bucket);
    }

    // Filter out timestamps outside the sliding window
    bucket.timestamps = bucket.timestamps.filter((ts) => ts > windowStart);
    bucket.lastUpdated = now;

    if (bucket.timestamps.length >= this.maxRequests) {
      const oldest = bucket.timestamps[0];
      const resetMs = Math.max(0, oldest + this.windowMs - now);
      return {
        allowed: false,
        remaining: 0,
        resetSeconds: Math.ceil(resetMs / 1000),
      };
    }

    // Record request
    bucket.timestamps.push(now);
    const remaining = this.maxRequests - bucket.timestamps.length;
    return {
      allowed: true,
      remaining,
      resetSeconds: Math.ceil(this.windowMs / 1000),
    };
  }

  private prune(now: number): void {
    const windowStart = now - this.windowMs;
    for (const [key, bucket] of this.store.entries()) {
      if (bucket.lastUpdated < windowStart) {
        this.store.delete(key);
      }
    }
  }

  public clear(): void {
    this.store.clear();
  }
}

// Global default singleton for server instance
export const globalRateLimiter = new RateLimiter();
