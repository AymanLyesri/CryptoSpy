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

  // Search cryptocurrencies with improved debouncing
  const searchCryptos = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    // Don't search if already searching the same query
    if (isSearching) {
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
  }, [isSearching]);

  // Load price history for a cryptocurrency
  const loadPriceHistory = useCallback(async (coinId: string) => {
    console.log(`Loading price history for: ${coinId}`);
    setIsLoadingHistory(true);
    setHistoryError(null);
    
    try {
      const history = await CoinGeckoService.getCryptoPriceHistory(coinId);
      console.log('Price history loaded:', {
        coinId: history.cryptoId,
        hourly: history.hourly?.length || 0,
        daily: history.daily?.length || 0,
        weekly: history.weekly?.length || 0,
        monthly: history.monthly?.length || 0,
        sampleHourlyData: history.hourly?.slice(0, 3),
        sampleDailyData: history.daily?.slice(0, 3)
      });
      setPriceHistory(history);
    } catch (error) {
      console.error('Error loading price history:', error);
      setHistoryError(error instanceof Error ? error.message : 'Failed to load price history');
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