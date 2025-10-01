"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Cryptocurrency } from "../types/crypto";
import { CryptoPriceHistory, TimeRange } from "../types/chartData";
import { CoinGeckoService } from "../services/coinGeckoApi";

interface UseCryptoDataReturn {
  // Search functionality
  searchResults: Cryptocurrency[];
  isSearching: boolean;
  searchError: string | null;
  searchCryptos: (query: string) => Promise<void>;

  // Popular cryptos
  popularCryptos: Cryptocurrency[];
  isLoadingPopular: boolean;
  popularError: string | null;

  // Price history
  priceHistory: CryptoPriceHistory | null;
  isLoadingHistory: boolean;
  historyError: string | null;
  loadPriceHistory: (coinId: string) => Promise<void>;

  // Status flags
  isUsingFallbackData: boolean;
}

export function useCryptoData(): UseCryptoDataReturn {
  // Search state
  const [searchResults, setSearchResults] = useState<Cryptocurrency[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Popular cryptos state
  const [popularCryptos, setPopularCryptos] = useState<Cryptocurrency[]>([]);
  const [isLoadingPopular, setIsLoadingPopular] = useState(false);
  const [popularError, setPopularError] = useState<string | null>(null);

  // Price history state
  const [priceHistory, setPriceHistory] = useState<CryptoPriceHistory | null>(
    null
  );
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Status state
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false);

  // AbortController ref for search requests
  const searchAbortControllerRef = useRef<AbortController | null>(null);

  // Load popular cryptocurrencies on mount
  useEffect(() => {
    const loadPopularCryptos = async () => {
      setIsLoadingPopular(true);
      setPopularError(null);

      try {
        const cryptos = await CoinGeckoService.getPopularCryptos(50);
        setPopularCryptos(cryptos);
        setIsUsingFallbackData(false);
      } catch (error) {
        console.error("Error loading popular cryptos:", error);

        // Provide more user-friendly error messages
        let errorMessage = "Failed to load cryptocurrencies";
        if (error instanceof Error) {
          if (error.message.includes("401")) {
            errorMessage = "API authentication issue - using limited data";
          } else if (error.message.includes("429")) {
            errorMessage = "Rate limit reached - please wait a moment";
          } else if (error.message.includes("timeout")) {
            errorMessage = "Request timed out - please check your connection";
          } else {
            errorMessage = error.message;
          }
        }

        setPopularError(errorMessage);
        setIsUsingFallbackData(true);
      } finally {
        setIsLoadingPopular(false);
      }
    };

    loadPopularCryptos();
  }, []);

  // Search cryptocurrencies with improved request cancellation
  const searchCryptos = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery || trimmedQuery.length < 2) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    // Cancel previous search request if it exists
    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    const abortController = new AbortController();
    searchAbortControllerRef.current = abortController;

    setIsSearching(true);
    setSearchError(null);

    try {
      const results = await CoinGeckoService.searchCryptos(trimmedQuery);

      // Only update results if this request wasn't aborted
      if (!abortController.signal.aborted) {
        setSearchResults(results);
      }
    } catch (error) {
      // Only handle error if request wasn't aborted
      if (!abortController.signal.aborted) {
        console.error("Error searching cryptos:", error);

        // Provide user-friendly error messages for search
        let errorMessage = "Search failed";
        if (error instanceof Error) {
          if (error.message.includes("401")) {
            errorMessage = "Search unavailable - API authentication issue";
          } else if (error.message.includes("429")) {
            errorMessage = "Too many searches - please wait a moment";
          } else if (error.message.includes("timeout")) {
            errorMessage = "Search timed out - please try again";
          } else {
            errorMessage = error.message;
          }
        }

        setSearchError(errorMessage);
        setSearchResults([]);
      }
    } finally {
      // Only update loading state if this request wasn't aborted
      if (!abortController.signal.aborted) {
        setIsSearching(false);
      }

      // Clear the ref if this was the current request
      if (searchAbortControllerRef.current === abortController) {
        searchAbortControllerRef.current = null;
      }
    }
  }, []);

  // Load price history for a cryptocurrency
  const loadPriceHistory = useCallback(async (coinId: string) => {
    console.log(`Loading price history for: ${coinId}`);
    setIsLoadingHistory(true);
    setHistoryError(null);

    try {
      const history = await CoinGeckoService.getCryptoPriceHistory(coinId);
      console.log("Price history loaded:", {
        coinId: history.cryptoId,
        hourly: history.hourly?.length || 0,
        daily: history.daily?.length || 0,
        weekly: history.weekly?.length || 0,
        monthly: history.monthly?.length || 0,
        sampleHourlyData: history.hourly?.slice(0, 3),
        sampleDailyData: history.daily?.slice(0, 3),
      });
      setPriceHistory(history);
    } catch (error) {
      console.error("Error loading price history:", error);

      // Provide user-friendly error messages for price history
      let errorMessage = "Failed to load price history";
      if (error instanceof Error) {
        if (error.message.includes("401")) {
          errorMessage = "Chart data unavailable - API authentication issue";
        } else if (error.message.includes("429")) {
          errorMessage =
            "Rate limit reached - please wait before loading chart";
        } else if (error.message.includes("timeout")) {
          errorMessage = "Chart data request timed out - please try again";
        } else {
          errorMessage = error.message;
        }
      }

      setHistoryError(errorMessage);
      setPriceHistory(null);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  return {
    // Search
    searchResults,
    isSearching,
    searchError,
    searchCryptos,

    // Popular
    popularCryptos,
    isLoadingPopular,
    popularError,

    // History
    priceHistory,
    isLoadingHistory,
    historyError,
    loadPriceHistory,

    // Status
    isUsingFallbackData,
  };
}
