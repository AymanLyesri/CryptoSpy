'use client';

import { useState, useEffect, useCallback } from 'react';
import { Cryptocurrency } from '../types/crypto';
import { CryptoPriceHistory, TimeRange } from '../types/chartData';
import { CoinGeckoService } from '../services/coinGeckoApi';

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
  const [priceHistory, setPriceHistory] = useState<CryptoPriceHistory | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  
  // Status state
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false);

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
        setPopularError(error instanceof Error ? error.message : 'Failed to load cryptocurrencies');
        setIsUsingFallbackData(true);
        console.error('Error loading popular cryptos:', error);
      } finally {
        setIsLoadingPopular(false);
      }
    };

    loadPopularCryptos();
  }, []);

  // Search cryptocurrencies
  const searchCryptos = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    
    try {
      const results = await CoinGeckoService.searchCryptos(query);
      setSearchResults(results);
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Search failed');
      setSearchResults([]);
      console.error('Error searching cryptos:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Load price history for a cryptocurrency
  const loadPriceHistory = useCallback(async (coinId: string) => {
    setIsLoadingHistory(true);
    setHistoryError(null);
    
    try {
      const history = await CoinGeckoService.getCryptoPriceHistory(coinId);
      setPriceHistory(history);
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : 'Failed to load price history');
      setPriceHistory(null);
      console.error('Error loading price history:', error);
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