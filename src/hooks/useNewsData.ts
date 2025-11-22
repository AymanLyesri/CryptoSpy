import { useState, useEffect, useCallback } from "react";
import { NewsItem, CryptoNewsApiParams } from "../types/news";
import { newsApiService } from "../services/newsApi";
import { Cryptocurrency } from "../types/crypto";

interface UseNewsDataOptions {
  selectedCrypto?: Cryptocurrency | null;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseNewsDataReturn {
  news: NewsItem[];
  loading: boolean;
  error: string | null;
  refreshNews: () => Promise<void>;
  lastUpdated: Date | null;
}

export const useNewsData = ({
  selectedCrypto,
  autoRefresh = true,
  refreshInterval = 5 * 60 * 1000, // 5 minutes
}: UseNewsDataOptions = {}): UseNewsDataReturn => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let newsData: NewsItem[];

      if (selectedCrypto) {
        // Fetch coin-specific news
        newsData = await newsApiService.getCoinSpecificNews(
          selectedCrypto.id,
          selectedCrypto.symbol
        );
      } else {
        // Fetch general crypto news
        const params: CryptoNewsApiParams = {
          filter: "hot",
          pageSize: 10,
        };
        newsData = await newsApiService.getCryptoNews(params);
      }

      setNews(newsData);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch news";
      setError(errorMessage);
      console.error("Error fetching news:", err);

      // Set fallback mock data on error
      const fallbackNews = selectedCrypto
        ? await newsApiService.getCoinSpecificNews(
            selectedCrypto.id,
            selectedCrypto.symbol
          )
        : await newsApiService.getCryptoNews({ filter: "hot" });
      setNews(fallbackNews);
    } finally {
      setLoading(false);
    }
  }, [selectedCrypto]);

  const refreshNews = useCallback(async () => {
    await fetchNews();
  }, [fetchNews]);

  // Initial fetch
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchNews();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchNews, autoRefresh, refreshInterval]);

  // Refresh when selected crypto changes
  useEffect(() => {
    if (selectedCrypto) {
      fetchNews();
    }
  }, [selectedCrypto?.id, fetchNews]);

  return {
    news,
    loading,
    error,
    refreshNews,
    lastUpdated,
  };
};
