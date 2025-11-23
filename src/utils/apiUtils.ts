// Enhanced in-memory cache with TTL and size limits
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    // Cleanup expired items before adding new ones
    this.cleanup();

    // If at max capacity, remove least recently used items
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
      accessCount: 0,
      lastAccessed: Date.now(),
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access stats
    item.accessCount++;
    item.lastAccessed = now;

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  private evictLRU(): void {
    let oldestKey = "";
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  getStats(): { size: number; maxSize: number } {
    return { size: this.cache.size, maxSize: this.maxSize };
  }
}

// Simple rate limiter
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    // Remove requests outside the current window
    this.requests = this.requests.filter((time) => now - time < this.windowMs);
    return this.requests.length < this.maxRequests;
  }

  recordRequest(): void {
    this.requests.push(Date.now());
  }

  recordFailure(): void {
    // For now, just record it as a request since failures still count towards rate limits
    this.recordRequest();
  }

  async waitForNextSlot(): Promise<void> {
    // Wait until we can make a request
    while (!this.canMakeRequest()) {
      // Calculate time until the oldest request in the window expires
      const now = Date.now();
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.windowMs - (now - oldestRequest) + 100; // Add 100ms buffer
      
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  getStats(): {
    requestsInWindow: number;
    maxRequests: number;
  } {
    const now = Date.now();
    const requestsInWindow = this.requests.filter(
      (time) => now - time < this.windowMs
    ).length;

    return {
      requestsInWindow,
      maxRequests: this.maxRequests,
    };
  }
}

// Smart cache TTL based on data type
export const getCacheTTL = (
  dataType: "market" | "search" | "historical" | "price"
): number => {
  switch (dataType) {
    case "market":
      return 2 * 60 * 1000; // 2 minutes for market data
    case "search":
      return 30 * 60 * 1000; // 30 minutes for search results
    case "historical":
      return 60 * 60 * 1000; // 1 hour for historical data
    case "price":
      return 30 * 1000; // 30 seconds for current price
    default:
      return 5 * 60 * 1000; // 5 minutes default
  }
};

export const apiCache = new MemoryCache(1000);
export const rateLimiter = new RateLimiter(100, 60000); // 10 requests per minute
