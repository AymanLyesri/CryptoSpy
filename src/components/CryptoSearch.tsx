'use client';

import { useState, useEffect, useRef } from 'react';
import { Cryptocurrency } from '../types/crypto';
import { useCryptoData } from '../hooks/useCryptoData';

interface CryptoSearchProps {
  onSelect?: (crypto: Cryptocurrency) => void;
  placeholder?: string;
}

export default function CryptoSearch({ onSelect, placeholder = "Search cryptocurrencies..." }: CryptoSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { 
    searchResults, 
    isSearching, 
    searchError, 
    searchCryptos,
    popularCryptos,
    isLoadingPopular 
  } = useCryptoData();

  // Detect theme changes for better visual feedback
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };
    
    checkTheme();
    
    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // Enhanced debounced search effect
  useEffect(() => {
    // Clear previous timeout
    const timeoutId = setTimeout(() => {
      if (query.trim() && query.length >= 2) {
        searchCryptos(query);
      } else {
        // Don't show dropdown for short queries
        setIsOpen(false);
      }
    }, 300); // Reduced debounce time for better responsiveness

    return () => clearTimeout(timeoutId);
  }, [query, searchCryptos]);

  // Determine which cryptos to show
  const cryptosToShow = query.trim() && query.length >= 2 ? searchResults : popularCryptos.slice(0, 10);
  const shouldShowDropdown = query.trim() && query.length >= 2 ? searchResults.length > 0 : (isOpen && !query.trim());

  // Update dropdown visibility
  useEffect(() => {
    if (query.trim() === '') {
      setIsOpen(false);
    } else if (query.length >= 2) {
      setIsOpen(shouldShowDropdown && !isSearching);
    } else {
      setIsOpen(false);
    }
    setHighlightedIndex(-1);
  }, [query, shouldShowDropdown, isSearching]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < cryptosToShow.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < cryptosToShow.length) {
          handleSelect(cryptosToShow[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (crypto: Cryptocurrency) => {
    setQuery(''); // Clear the search query after selection
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur(); // Remove focus to prevent dropdown reopening
    onSelect?.(crypto);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 4 : 2,
    }).format(price);
  };

  const formatPercentage = (percentage: number) => {
    const isPositive = percentage > 0;
    return (
      <span className={`font-medium ${
        isPositive 
          ? 'text-green-600 dark:text-green-400' 
          : 'text-red-600 dark:text-red-400'
      }`}>
        {isPositive ? '+' : ''}{percentage.toFixed(2)}%
      </span>
    );
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-lg mx-auto">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (!query.trim() && popularCryptos.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          style={{ 
            borderRadius: 'var(--radius-input)',
            padding: 'var(--spacing-card) 3rem var(--spacing-card) var(--spacing-card)',
            boxShadow: 'var(--shadow-card)'
          }}
          className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:border-transparent focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-all duration-300 hover:shadow-[var(--shadow-card-hover)]"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          {isSearching || isLoadingPopular ? (
            <div className={`animate-spin rounded-full h-5 w-5 border-2 border-t-transparent transition-colors duration-300 ${
              isDarkMode ? 'border-blue-400' : 'border-blue-500'
            }`}></div>
          ) : (
            <svg
              className={`w-5 h-5 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && cryptosToShow.length > 0 && (
        <div style={{ 
          borderRadius: 'var(--radius-card)',
          boxShadow: 'var(--shadow-card-hover)'
        }} className={`absolute z-10 w-full mt-2 border backdrop-blur-md max-h-80 overflow-y-auto transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800/95 border-gray-700' 
            : 'bg-white/95 border-gray-200'
        }`}>
          {!query.trim() && (
            <div className={`px-6 py-3 text-xs font-medium border-b transition-colors duration-300 ${
              isDarkMode
                ? 'text-gray-400 border-gray-700 bg-gray-700/50'
                : 'text-gray-500 border-gray-100 bg-gray-50/50'
            }`}>
              Popular Cryptocurrencies
            </div>
          )}
          {query.trim() && query.length >= 2 && (
            <div className={`px-6 py-3 text-xs font-medium border-b transition-colors duration-300 ${
              isDarkMode
                ? 'text-gray-400 border-gray-700 bg-gray-700/50'
                : 'text-gray-500 border-gray-100 bg-gray-50/50'
            }`}>
              Search Results for "{query}"
            </div>
          )}
          {cryptosToShow.map((crypto: Cryptocurrency, index: number) => (
            <div
              key={crypto.id}
              onClick={() => handleSelect(crypto)}
              className={`px-6 py-4 cursor-pointer border-b last:border-b-0 transition-all duration-200 ${
                isDarkMode 
                  ? 'border-gray-700 hover:bg-gray-700/50' 
                  : 'border-gray-100 hover:bg-gray-50'
              } ${
                index === highlightedIndex
                  ? isDarkMode
                    ? 'bg-blue-900/30 border-blue-700'
                    : 'bg-blue-50 border-blue-200'
                  : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    {crypto.image && (
                      <img 
                        src={crypto.image} 
                        alt={crypto.name} 
                        className="w-6 h-6 rounded-full"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{crypto.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 uppercase">{crypto.symbol}</div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {formatPrice(crypto.current_price)}
                  </div>
                  <div className="text-sm">
                    {formatPercentage(crypto.price_change_percentage_24h)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {query.trim() !== '' && !isSearching && searchResults.length === 0 && (
        <div style={{ 
          borderRadius: 'var(--radius-card)',
          boxShadow: 'var(--shadow-card-hover)'
        }} className={`absolute z-10 w-full mt-2 border backdrop-blur-md transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800/95 border-gray-700' 
            : 'bg-white/95 border-gray-200'
        }`}>
          <div className={`px-6 py-4 text-center transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {searchError ? (
              <div className={`transition-colors duration-300 ${
                isDarkMode ? 'text-red-400' : 'text-red-500'
              }`}>
                <div className="font-medium">Search Error</div>
                <div className="text-sm">{searchError}</div>
              </div>
            ) : (
              <div>
                <div className={`font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>No Results Found</div>
                <div className="text-sm mt-1">No cryptocurrencies found for "{query}"</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}