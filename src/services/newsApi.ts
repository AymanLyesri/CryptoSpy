import { NewsItem, NewsResponse, CryptoNewsApiParams } from "../types/news";
import { apiCache, rateLimiter, getCacheTTL } from "../utils/apiUtils";

// Free RSS feeds for crypto news
const NEWS_SOURCES = {
  COINDESK: "https://feeds.feedburner.com/CoinDesk",
  COINTELEGRAPH: "https://cointelegraph.com/rss",
  DECRYPT: "https://decrypt.co/feed",
  CRYPTO_NEWS: "https://cryptonews.com/news/feed/",
  BITCOIN_MAGAZINE: "https://bitcoinmagazine.com/.rss/full/",
};

// Fallback to RSS-to-JSON service
const RSS_TO_JSON_SERVICE = "https://api.rss2json.com/v1/api.json";

class NewsApiService {
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  private readonly REQUEST_DELAY = 1000;

  // Get crypto news from RSS feeds
  async getCryptoNews(params: CryptoNewsApiParams = {}): Promise<NewsItem[]> {
    const cacheKey = `crypto_news_${JSON.stringify(params)}`;
    const cached = apiCache.get<NewsItem[]>(cacheKey);
    if (cached) return cached;

    // Rate limiting check
    if (!(await rateLimiter.canMakeRequest())) {
      await rateLimiter.waitForNextSlot();
    }

    try {
      // Try to fetch from RSS feeds
      const newsData = await this.fetchFromRSSFeeds();

      if (newsData.length > 0) {
        apiCache.set(cacheKey, newsData, this.CACHE_TTL);
        rateLimiter.recordRequest();
        return newsData;
      }

      // If RSS feeds fail, return empty array
      return [];
    } catch (error) {
      rateLimiter.recordFailure();
      console.warn("Failed to fetch crypto news:", error);
      return []; // Return empty array instead of mock data
    }
  }

  // Fetch from RSS feeds using RSS-to-JSON service
  private async fetchFromRSSFeeds(): Promise<NewsItem[]> {
    const allNews: NewsItem[] = [];

    // Try CoinDesk first (most reliable)
    try {
      const coinDeskNews = await this.fetchRSSFeed(
        NEWS_SOURCES.COINDESK,
        "CoinDesk"
      );
      allNews.push(...coinDeskNews.slice(0, 5));
    } catch (error) {
      console.warn("CoinDesk RSS failed:", error);
    }

    // Try Cointelegraph
    try {
      const cointelegraphNews = await this.fetchRSSFeed(
        NEWS_SOURCES.COINTELEGRAPH,
        "Cointelegraph"
      );
      allNews.push(...cointelegraphNews.slice(0, 3));
    } catch (error) {
      console.warn("Cointelegraph RSS failed:", error);
    }

    // Try Decrypt
    try {
      const decryptNews = await this.fetchRSSFeed(
        NEWS_SOURCES.DECRYPT,
        "Decrypt"
      );
      allNews.push(...decryptNews.slice(0, 2));
    } catch (error) {
      console.warn("Decrypt RSS failed:", error);
    }

    // Sort by publication date and return latest 10
    return allNews
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
      .slice(0, 10);
  }

  // Fetch individual RSS feed
  private async fetchRSSFeed(
    rssUrl: string,
    sourceName: string
  ): Promise<NewsItem[]> {
    const response = await fetch(
      `${RSS_TO_JSON_SERVICE}?rss_url=${encodeURIComponent(rssUrl)}&count=10`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch ${sourceName} RSS`);
    }

    const data = await response.json();

    if (data.status !== "ok" || !data.items) {
      throw new Error(`Invalid RSS response from ${sourceName}`);
    }

    return data.items.map((item: any, index: number) => ({
      id: `${sourceName.toLowerCase()}_${index}_${Date.now()}`,
      title: this.cleanText(item.title || "News Update"),
      summary: this.cleanText(
        item.description || item.content || "Latest crypto news update"
      ),
      publishedAt: item.pubDate || new Date().toISOString(),
      source: {
        name: sourceName,
        url: item.link,
      },
      category: this.categorizeNews(item.title),
      url: item.link,
      currencies: this.extractCurrencies(
        item.title + " " + (item.description || "")
      ),
      sentiment: this.analyzeSentiment(item.title),
    }));
  }

  // Clean HTML tags and excessive whitespace from text
  private cleanText(text: string): string {
    return text
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/&[^;]+;/g, "") // Remove HTML entities
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim()
      .slice(0, 200); // Limit length
  }

  // Extract cryptocurrency symbols from text
  private extractCurrencies(text: string): string[] {
    const currencies = new Set<string>();
    const textUpper = text.toUpperCase();

    // Common crypto keywords and symbols
    const cryptoMap = {
      BITCOIN: "BTC",
      BTC: "BTC",
      ETHEREUM: "ETH",
      ETH: "ETH",
      SOLANA: "SOL",
      SOL: "SOL",
      CARDANO: "ADA",
      ADA: "ADA",
      POLKADOT: "DOT",
      DOT: "DOT",
      CHAINLINK: "LINK",
      LINK: "LINK",
      DOGECOIN: "DOGE",
      DOGE: "DOGE",
      XRP: "XRP",
      RIPPLE: "XRP",
    };

    for (const [keyword, symbol] of Object.entries(cryptoMap)) {
      if (textUpper.includes(keyword)) {
        currencies.add(symbol);
      }
    }

    return Array.from(currencies);
  }

  // Get coin-specific news
  async getCoinSpecificNews(
    coinId: string,
    coinSymbol: string
  ): Promise<NewsItem[]> {
    // Get general news and filter for relevant content
    const allNews = await this.getCryptoNews();

    // Filter news that mentions the specific coin
    const coinSpecificNews = allNews.filter((item) => {
      const searchText = (item.title + " " + item.summary).toLowerCase();
      const coinName = this.getCoinName(coinId, coinSymbol).toLowerCase();
      const symbol = coinSymbol.toLowerCase();

      return (
        searchText.includes(coinName) ||
        searchText.includes(symbol) ||
        item.currencies?.some((curr) => curr.toLowerCase() === symbol)
      );
    });

    // If we have specific news, return it; otherwise return general news
    return coinSpecificNews.length > 0 ? coinSpecificNews : allNews.slice(0, 6);
  }

  // Helper methods
  private categorizeNews(title: string): string {
    const titleLower = title.toLowerCase();
    if (
      titleLower.includes("price") ||
      titleLower.includes("market") ||
      titleLower.includes("trading")
    ) {
      return "Market";
    }
    if (
      titleLower.includes("defi") ||
      titleLower.includes("yield") ||
      titleLower.includes("lending")
    ) {
      return "DeFi";
    }
    if (
      titleLower.includes("regulation") ||
      titleLower.includes("legal") ||
      titleLower.includes("sec")
    ) {
      return "Regulation";
    }
    if (
      titleLower.includes("technology") ||
      titleLower.includes("blockchain") ||
      titleLower.includes("protocol")
    ) {
      return "Technology";
    }
    if (
      titleLower.includes("institution") ||
      titleLower.includes("bank") ||
      titleLower.includes("fund")
    ) {
      return "Institutional";
    }
    return "Analysis";
  }

  private analyzeSentiment(title: string): "positive" | "negative" | "neutral" {
    const titleLower = title.toLowerCase();
    const positiveWords = [
      "surge",
      "rise",
      "gain",
      "bullish",
      "growth",
      "adoption",
      "milestone",
      "breakthrough",
    ];
    const negativeWords = [
      "drop",
      "fall",
      "bearish",
      "decline",
      "crash",
      "concern",
      "risk",
      "warning",
    ];

    const hasPositive = positiveWords.some((word) => titleLower.includes(word));
    const hasNegative = negativeWords.some((word) => titleLower.includes(word));

    if (hasPositive && !hasNegative) return "positive";
    if (hasNegative && !hasPositive) return "negative";
    return "neutral";
  }

  private getCoinName(coinId: string, symbol: string): string {
    const coinNames: { [key: string]: string } = {
      bitcoin: "Bitcoin",
      ethereum: "Ethereum",
      cardano: "Cardano",
      solana: "Solana",
      polkadot: "Polkadot",
      chainlink: "Chainlink",
      litecoin: "Litecoin",
      "binance-coin": "BNB",
    };
    return coinNames[coinId] || symbol.toUpperCase();
  }

  // Get time-based greeting for news
  getNewsGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Morning Crypto Brief";
    if (hour < 17) return "Afternoon Market Update";
    if (hour < 21) return "Evening News Digest";
    return "Late Night Crypto Watch";
  }
}

export const newsApiService = new NewsApiService();
