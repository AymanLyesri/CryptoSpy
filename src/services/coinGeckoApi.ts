import { Cryptocurrency } from '../types/crypto';
import { CryptoPriceHistory, PriceDataPoint } from '../types/chartData';
import { apiCache, rateLimiter, getCacheTTL } from '../utils/apiUtils';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Enhanced interfaces
interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  market_cap_rank?: number;
  total_volume?: number;
}

interface CoinGeckoHistoricalData {
  prices: [number, number][];
}

interface RequestConfig {
  timeout?: number;
  retries?: number;
  cacheType?: 'market' | 'search' | 'historical' | 'price';
}

export class CoinGeckoService {
  private static readonly DEFAULT_TIMEOUT = 10000; // 10 seconds
  private static readonly DEFAULT_RETRIES = 2;

  private static async fetchWithRateLimit(
    url: string, 
    cacheKey?: string, 
    config: RequestConfig = {}
  ): Promise<any> {
    const { timeout = this.DEFAULT_TIMEOUT, retries = this.DEFAULT_RETRIES, cacheType = 'market' } = config;
    
    // Check cache first
    if (cacheKey && apiCache.has(cacheKey)) {
      console.log(`Cache hit: ${cacheKey}`);
      return apiCache.get(cacheKey);
    }

    // Use request deduplication to prevent duplicate requests
    return rateLimiter.deduplicateRequest(cacheKey || url, async () => {
      let lastError: Error | null = null;
      
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          // Check rate limit
          if (!(await rateLimiter.canMakeRequest())) {
            await rateLimiter.waitForNextSlot();
          }

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);

          try {
            const response = await fetch(url, {
              signal: controller.signal,
              headers: {
                'accept': 'application/json',
                ...(process.env.NEXT_PUBLIC_COINGECKO_API_KEY && {
                  'x-cg-demo-api-key': process.env.NEXT_PUBLIC_COINGECKO_API_KEY
                }),
              },
            });

            clearTimeout(timeoutId);
            rateLimiter.recordRequest();

            if (!response.ok) {
              if (response.status === 429) {
                rateLimiter.recordFailure();
                throw new Error(`Rate limit exceeded. Please wait before making more requests.`);
              }
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Cache the successful response
            if (cacheKey) {
              const ttl = getCacheTTL(cacheType);
              apiCache.set(cacheKey, data, ttl);
              console.log(`Cached ${cacheKey} for ${ttl/1000}s`);
            }
            
            return data;
          } catch (fetchError) {
            clearTimeout(timeoutId);
            throw fetchError;
          }
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Unknown error');
          
          if (error instanceof Error && error.name === 'AbortError') {
            lastError = new Error('Request timeout');
          }
          
          if (attempt < retries) {
            const backoffTime = Math.min(1000 * Math.pow(2, attempt), 5000);
            console.log(`Request failed, retrying in ${backoffTime}ms (attempt ${attempt + 1}/${retries + 1})`);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
          }
        }
      }
      
      rateLimiter.recordFailure();
      throw lastError || new Error('All retry attempts failed');
    });
  }


  static async getPopularCryptos(limit: number = 10): Promise<Cryptocurrency[]> {
    // Normalize limit to standard values to improve cache hit rate
    const normalizedLimit = limit <= 10 ? 10 : limit <= 50 ? 50 : 100;
    const cacheKey = `popular_cryptos_${normalizedLimit}`;
    
    try {
      const data: CoinGeckoMarketData[] = await this.fetchWithRateLimit(
        `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${normalizedLimit}&page=1&sparkline=false&price_change_percentage=24h`,
        cacheKey,
        { cacheType: 'market', timeout: 15000 }
      );

      const results = data.slice(0, limit).map(coin => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        current_price: coin.current_price,
        market_cap: coin.market_cap,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        image: coin.image,
      }));
      
      return results;
    } catch (error) {
      console.error('Failed to fetch popular cryptocurrencies:', error);
      // Return cached data if available, even if expired
      const cachedData = apiCache.get<CoinGeckoMarketData[]>(cacheKey);
      if (cachedData && Array.isArray(cachedData)) {
        console.log('Returning stale cached data due to API error');
        return cachedData.slice(0, limit).map((coin: CoinGeckoMarketData) => ({
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          current_price: coin.current_price,
          market_cap: coin.market_cap,
          price_change_percentage_24h: coin.price_change_percentage_24h,
          image: coin.image,
        }));
      }
      throw error;
    }
  }

  static async searchCryptos(query: string): Promise<Cryptocurrency[]> {
    if (!query.trim() || query.length < 2) return [];

    const normalizedQuery = query.toLowerCase().trim();
    const cacheKey = `search_${normalizedQuery}`;
    
    try {
      // First try to get search results
      const searchData = await this.fetchWithRateLimit(
        `${COINGECKO_BASE_URL}/search?query=${encodeURIComponent(normalizedQuery)}`,
        cacheKey,
        { cacheType: 'search', timeout: 12000 }
      );

      if (!searchData.coins || searchData.coins.length === 0) {
        return [];
      }

      // Get top 10 most relevant coins
      const coinIds = searchData.coins.slice(0, 10).map((coin: any) => coin.id);
      if (coinIds.length === 0) return [];

      // Batch request for market data
      const marketCacheKey = `market_batch_${coinIds.sort().join(',')}`;
      const marketData: CoinGeckoMarketData[] = await this.fetchWithRateLimit(
        `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&ids=${coinIds.join(',')}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`,
        marketCacheKey,
        { cacheType: 'market', timeout: 12000 }
      );

      return marketData.map(coin => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        current_price: coin.current_price,
        market_cap: coin.market_cap,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        image: coin.image,
      }));
    } catch (error) {
      console.error(`Search failed for query "${query}":`, error);
      
      // Try to return cached results for similar queries
      const cachedResult = apiCache.get<Cryptocurrency[]>(cacheKey);
      if (cachedResult && Array.isArray(cachedResult)) {
        console.log('Returning cached search results due to API error');
        return cachedResult;
      }
      
      // If search fails completely, return empty array rather than throwing
      return [];
    }
  }

  static async getHistoricalData(coinId: string, days: number): Promise<PriceDataPoint[]> {
    const cacheKey = `historical_${coinId}_${days}`;
    
    try {
      const interval = days <= 1 ? 'hourly' : days <= 90 ? 'daily' : 'weekly';
      const data: CoinGeckoHistoricalData = await this.fetchWithRateLimit(
        `${COINGECKO_BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${interval}`,
        cacheKey,
        { cacheType: 'historical', timeout: 15000 }
      );

      if (!data.prices || data.prices.length === 0) {
        throw new Error('No price data available');
      }

      return data.prices.map(([timestamp, price]) => ({ timestamp, price }));
    } catch (error) {
      console.error(`Failed to fetch historical data for ${coinId} (${days} days):`, error);
      
      // Try to return cached data even if expired
      const cachedData = apiCache.get<PriceDataPoint[]>(cacheKey);
      if (cachedData && Array.isArray(cachedData)) {
        console.log('Returning stale cached historical data');
        return cachedData;
      }
      
      throw error;
    }
  }

  static async getCurrentPrice(coinId: string): Promise<number> {
    const cacheKey = `current_price_${coinId}`;
    
    try {
      const data = await this.fetchWithRateLimit(
        `${COINGECKO_BASE_URL}/simple/price?ids=${coinId}&vs_currencies=usd`,
        cacheKey,
        { cacheType: 'price', timeout: 8000 }
      );
      
      return data[coinId]?.usd || 0;
    } catch (error) {
      console.error(`Failed to fetch current price for ${coinId}:`, error);
      
      // Try to extract price from cached market data
      const marketCacheKey = `popular_cryptos_50`;
      const cachedMarketData = apiCache.get<CoinGeckoMarketData[]>(marketCacheKey);
      if (cachedMarketData && Array.isArray(cachedMarketData)) {
        const coin = cachedMarketData.find((c: CoinGeckoMarketData) => c.id === coinId);
        if (coin) {
          console.log('Using price from cached market data');
          return coin.current_price;
        }
      }
      
      throw error;
    }
  }

  // Optimized method that intelligently fetches historical data
  static async getCryptoPriceHistory(coinId: string): Promise<CryptoPriceHistory> {
    const cacheKey = `price_history_${coinId}`;
    
    // Check if we have cached complete history
    if (apiCache.has(cacheKey)) {
      return apiCache.get(cacheKey)!;
    }

    try {
      // Fetch different timeframes based on what data we need
      // This is more efficient than the previous approach that relied on filtering yearly data
      const [dailyData, weeklyData, monthlyData] = await Promise.all([
        this.getHistoricalData(coinId, 7),    // Last 7 days (good for daily/hourly)
        this.getHistoricalData(coinId, 30),   // Last 30 days (for weekly view)  
        this.getHistoricalData(coinId, 365),  // Last year (for monthly view)
      ]);
      
      // For hourly data, use the most recent portion of daily data
      const now = Date.now();
      const oneDayAgo = now - (24 * 60 * 60 * 1000);
      const hourly = dailyData.filter(point => point.timestamp >= oneDayAgo);
      
      // Ensure we have meaningful data for each timeframe
      const result: CryptoPriceHistory = {
        cryptoId: coinId,
        hourly: hourly.length > 0 ? hourly : dailyData.slice(-24), // Last 24 data points as fallback
        daily: dailyData,
        weekly: weeklyData,
        monthly: monthlyData,
      };
      
      // Cache the processed result
      apiCache.set(cacheKey, result, getCacheTTL('historical'));
      
      return result;
    } catch (error) {
      console.error(`Error fetching price history for ${coinId}:`, error);
      
      // Check for any cached data, even if expired
      const cachedData = apiCache.get<CryptoPriceHistory>(cacheKey);
      if (cachedData && typeof cachedData === 'object' && cachedData.cryptoId) {
        console.log('Returning stale cached price history');
        return cachedData;
      }
      
      // Return minimal fallback data with current price if available
      try {
        const fallbackPrice = await this.getCurrentPrice(coinId);
        const now = Date.now();
        
        // Generate some mock historical data for better UX
        const mockHistoricalData = Array.from({ length: 24 }, (_, i) => ({
          timestamp: now - (i * 60 * 60 * 1000), // Every hour for 24 hours
          price: fallbackPrice * (0.98 + Math.random() * 0.04), // Small price variations
        })).reverse();
        
        return {
          cryptoId: coinId,
          hourly: mockHistoricalData,
          daily: mockHistoricalData,
          weekly: mockHistoricalData,
          monthly: mockHistoricalData,
        };
      } catch (priceError) {
        console.error('Failed to get fallback price data:', priceError);
        const mockDataPoint = { timestamp: Date.now(), price: 0 };
        return {
          cryptoId: coinId,
          hourly: [mockDataPoint],
          daily: [mockDataPoint],
          weekly: [mockDataPoint],
          monthly: [mockDataPoint],
        };
      }
    }
  }

  // Utility method to get API usage statistics
  static getApiStats(): { cache: any; rateLimiter: any } {
    return {
      cache: apiCache.getStats(),
      rateLimiter: rateLimiter.getStats(),
    };
  }
}
