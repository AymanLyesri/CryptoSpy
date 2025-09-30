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

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        searchCryptos(query);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, searchCryptos]);

  // Determine which cryptos to show
  const cryptosToShow = query.trim() ? searchResults : popularCryptos.slice(0, 10);
  const shouldShowDropdown = query.trim() ? searchResults.length > 0 : true;

  // Update dropdown visibility
  useEffect(() => {
    if (query.trim() === '') {
      setIsOpen(false);
    } else {
      setIsOpen(shouldShowDropdown && !isSearching);
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
    setQuery(crypto.name);
    setIsOpen(false);
    setHighlightedIndex(-1);
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
      <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? '+' : ''}{percentage.toFixed(2)}%
      </span>
    );
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => !query.trim() && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-10 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {isSearching || isLoadingPopular ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          ) : (
            <svg
              className="w-5 h-5 text-gray-400"
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
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {!query.trim() && (
            <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100 bg-gray-50">
              Popular Cryptocurrencies
            </div>
          )}
          {cryptosToShow.map((crypto: Cryptocurrency, index: number) => (
            <div
              key={crypto.id}
              onClick={() => handleSelect(crypto)}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150 ${
                index === highlightedIndex
                  ? 'bg-blue-50 border-blue-200'
                  : 'hover:bg-gray-50'
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
                      <div className="font-medium text-gray-900">{crypto.name}</div>
                      <div className="text-sm text-gray-500 uppercase">{crypto.symbol}</div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
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
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-gray-500 text-center">
            {searchError ? (
              <div className="text-red-500">
                <div className="font-medium">Search Error</div>
                <div className="text-sm">{searchError}</div>
              </div>
            ) : (
              `No cryptocurrencies found for "${query}"`
            )}
          </div>
        </div>
      )}
    </div>
  );
}