// Simple in-memory cache with TTL (Time To Live)
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();

  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void { // Default 5 minutes
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }
}

// Rate limiter to prevent hitting API limits
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) { // 10 requests per minute by default
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async canMakeRequest(): Promise<boolean> {
    const now = Date.now();
    // Remove requests outside the current window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    return this.requests.length < this.maxRequests;
  }

  recordRequest(): void {
    this.requests.push(Date.now());
  }

  async waitForNextSlot(): Promise<void> {
    if (this.requests.length === 0) return;
    
    const oldestRequest = Math.min(...this.requests);
    const waitTime = this.windowMs - (Date.now() - oldestRequest);
    
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

export const apiCache = new MemoryCache();
export const rateLimiter = new RateLimiter(8, 60000); // 8 requests per minute to be safe