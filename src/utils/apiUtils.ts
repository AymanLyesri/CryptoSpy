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
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  private evictLRU(): void {
    let oldestKey = '';
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

// Enhanced rate limiter with exponential backoff and request deduplication
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private windowMs: number;
  private backoffMultiplier: number = 1;
  private maxBackoff: number = 30000; // 30 seconds max backoff
  private pendingRequests = new Map<string, Promise<any>>();

  constructor(maxRequests: number = 6, windowMs: number = 60000) { // Conservative limit
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
    // Reset backoff on successful request
    this.backoffMultiplier = 1;
  }

  recordFailure(): void {
    // Increase backoff for future requests
    this.backoffMultiplier = Math.min(this.backoffMultiplier * 2, this.maxBackoff / 1000);
  }

  async waitForNextSlot(): Promise<void> {
    if (this.requests.length === 0) return;
    
    const oldestRequest = Math.min(...this.requests);
    const baseWaitTime = this.windowMs - (Date.now() - oldestRequest);
    const waitTime = Math.max(baseWaitTime, 1000 * this.backoffMultiplier);
    
    if (waitTime > 0) {
      console.log(`Rate limit hit, waiting ${Math.round(waitTime / 1000)}s before next request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  // Request deduplication - prevent multiple identical requests
  async deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      console.log(`Deduplicating request: ${key}`);
      return this.pendingRequests.get(key) as Promise<T>;
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  getStats(): { requestsInWindow: number; maxRequests: number; backoffMultiplier: number } {
    const now = Date.now();
    const requestsInWindow = this.requests.filter(time => now - time < this.windowMs).length;
    return { requestsInWindow, maxRequests: this.maxRequests, backoffMultiplier: this.backoffMultiplier };
  }
}

// Smart cache TTL based on data type
export const getCacheTTL = (dataType: 'market' | 'search' | 'historical' | 'price'): number => {
  switch (dataType) {
    case 'market': return 2 * 60 * 1000; // 2 minutes for market data
    case 'search': return 30 * 60 * 1000; // 30 minutes for search results
    case 'historical': return 60 * 60 * 1000; // 1 hour for historical data
    case 'price': return 30 * 1000; // 30 seconds for current price
    default: return 5 * 60 * 1000; // 5 minutes default
  }
};

export const apiCache = new MemoryCache(1000);
export const rateLimiter = new RateLimiter(10, 60000); // 6 requests per minute to be very safe