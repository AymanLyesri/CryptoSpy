import { Cryptocurrency } from '../types/crypto';
import { CryptoPriceHistory, PriceDataPoint } from '../types/chartData';
import { apiCache, rateLimiter } from '../utils/apiUtils';
import { mockCryptoData } from '../data/mockCrypto';
import { mockPriceHistory } from '../data/mockPriceHistory';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Interface for CoinGecko API response
interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
}

interface CoinGeckoHistoricalData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export class CoinGeckoService {
  private static async fetchWithRateLimit(url: string, cacheKey?: string, cacheTtl?: number): Promise<any> {
    // Check cache first
    if (cacheKey && apiCache.has(cacheKey)) {
      console.log(`Cache hit for: ${cacheKey}`);
      return apiCache.get(cacheKey);
    }

    // Check rate limit
    if (!(await rateLimiter.canMakeRequest())) {
      console.warn('Rate limit exceeded, waiting...');
      await rateLimiter.waitForNextSlot();
    }

    try {
      rateLimiter.recordRequest();
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('RATE_LIMIT_EXCEEDED');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the successful response
      if (cacheKey) {
        apiCache.set(cacheKey, data, cacheTtl || 5 * 60 * 1000); // 5 minutes default
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
  // Fetch popular cryptocurrencies
  static async getPopularCryptos(limit: number = 100): Promise<Cryptocurrency[]> {
    const cacheKey = `popular_cryptos_${limit}`;
    
    try {
      const data: CoinGeckoMarketData[] = await this.fetchWithRateLimit(
        `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`,
        cacheKey,
        10 * 60 * 1000 // 10 minutes cache
      );
      
      return data.map(coin => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        current_price: coin.current_price,
        market_cap: coin.market_cap,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        image: coin.image,
      }));
    } catch (error) {
      console.warn('Falling back to mock data for popular cryptos:', error);
      // Fallback to mock data
      return mockCryptoData.slice(0, Math.min(limit, mockCryptoData.length));
    }
  }

  // Search cryptocurrencies by name or symbol
  static async searchCryptos(query: string): Promise<Cryptocurrency[]> {
    if (!query.trim()) return [];
    
    const cacheKey = `search_${query.toLowerCase()}`;
    
    try {
      const searchData = await this.fetchWithRateLimit(
        `${COINGECKO_BASE_URL}/search?query=${encodeURIComponent(query)}`,
        cacheKey,
        15 * 60 * 1000 // 15 minutes cache for searches
      );
      
      // Get detailed market data for search results
      const coinIds = searchData.coins.slice(0, 10).map((coin: any) => coin.id).join(',');
      
      if (!coinIds) return [];
      
      const marketData: CoinGeckoMarketData[] = await this.fetchWithRateLimit(
        `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`,
        `market_${coinIds}`,
        5 * 60 * 1000 // 5 minutes cache
      );
      
      return marketData.map(coin => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        current_price: coin.current_price,
        market_cap: coin.market_cap,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        image: coin.image,
      }));
    } catch (error) {
      console.warn('Falling back to mock data for search:', error);
      // Fallback to filtering mock data
      const filtered = mockCryptoData.filter(crypto => 
        crypto.name.toLowerCase().includes(query.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(query.toLowerCase())
      );
      return filtered.slice(0, 10);
    }
  }

  // Fetch historical price data
  static async getHistoricalData(
    coinId: string,
    days: number
  ): Promise<PriceDataPoint[]> {
    const cacheKey = `historical_${coinId}_${days}`;
    
    try {
      const data: CoinGeckoHistoricalData = await this.fetchWithRateLimit(
        `${COINGECKO_BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${days <= 1 ? 'hourly' : 'daily'}`,
        cacheKey,
        30 * 60 * 1000 // 30 minutes cache for historical data
      );
      
      return data.prices.map(([timestamp, price]) => ({
        timestamp,
        price,
      }));
    } catch (error) {
      console.warn(`Falling back to mock data for ${coinId} historical data:`, error);
      // Fallback to mock data if available
      if (mockPriceHistory[coinId]) {
        // Return appropriate mock data based on days requested
        if (days <= 1) return mockPriceHistory[coinId].hourly;
        if (days <= 30) return mockPriceHistory[coinId].daily;
        if (days <= 365) return mockPriceHistory[coinId].weekly;
        return mockPriceHistory[coinId].monthly;
      }
      throw new Error(`No data available for ${coinId}`);
    }
  }

  // Get comprehensive price history for all time ranges
  static async getCryptoPriceHistory(coinId: string): Promise<CryptoPriceHistory> {
    const cacheKey = `price_history_${coinId}`;
    
    // Check if we have cached complete history
    const cachedData = apiCache.get<CryptoPriceHistory>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    try {
      // Try to get all data with delays between requests
      const delays = [0, 1000, 2000, 3000]; // Stagger requests by 1 second each
      
      const dataPromises = [
        new Promise(resolve => setTimeout(() => resolve(this.getHistoricalData(coinId, 1)), delays[0])),
        new Promise(resolve => setTimeout(() => resolve(this.getHistoricalData(coinId, 30)), delays[1])),
        new Promise(resolve => setTimeout(() => resolve(this.getHistoricalData(coinId, 365)), delays[2])),
        new Promise(resolve => setTimeout(() => resolve(this.getHistoricalData(coinId, 365 * 2)), delays[3])),
      ];
      
      const [hourlyData, dailyData, weeklyRawData, monthlyRawData] = await Promise.all(dataPromises) as PriceDataPoint[][];

      // Process yearly data to weekly intervals
      const weeklyProcessed = this.processDataToInterval(weeklyRawData, 7);
      
      // Process 2-year data to monthly intervals
      const monthlyProcessed = this.processDataToInterval(monthlyRawData, 30);

      const result = {
        cryptoId: coinId,
        hourly: hourlyData,
        daily: dailyData,
        weekly: weeklyProcessed,
        monthly: monthlyProcessed,
      };
      
      // Cache the complete result
      apiCache.set(cacheKey, result, 30 * 60 * 1000); // 30 minutes
      
      return result;
    } catch (error) {
      console.warn(`Falling back to mock price history for ${coinId}:`, error);
      // Fallback to mock data
      if (mockPriceHistory[coinId]) {
        return mockPriceHistory[coinId];
      }
      throw new Error(`No price history available for ${coinId}`);
    }
  }

  // Helper method to process data into intervals
  private static processDataToInterval(
    data: PriceDataPoint[],
    intervalDays: number
  ): PriceDataPoint[] {
    if (data.length === 0) return [];
    
    const result: PriceDataPoint[] = [];
    const intervalMs = intervalDays * 24 * 60 * 60 * 1000;
    
    for (let i = 0; i < data.length; i += intervalDays) {
      const intervalData = data.slice(i, i + intervalDays);
      if (intervalData.length > 0) {
        // Use the last price of the interval
        const lastPoint = intervalData[intervalData.length - 1];
        result.push({
          timestamp: lastPoint.timestamp,
          price: lastPoint.price,
        });
      }
    }
    
    return result;
  }

  // Get current price for a specific cryptocurrency
  static async getCurrentPrice(coinId: string): Promise<number> {
    try {
      const response = await fetch(
        `${COINGECKO_BASE_URL}/simple/price?ids=${coinId}&vs_currencies=usd`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data[coinId]?.usd || 0;
    } catch (error) {
      console.error('Error fetching current price:', error);
      throw new Error('Failed to fetch current price');
    }
  }
}