"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Cryptocurrency } from "../types/crypto";
import { useCryptoData } from "../hooks/useCryptoData";
import CryptoCard from "./CryptoCard";
import { unifiedStyles, formatters } from "@/utils/themeUtils";

interface CryptoSearchProps {
  onSelect?: (crypto: Cryptocurrency) => void;
  placeholder?: string;
  compact?: boolean;
}

export default function CryptoSearch({
  onSelect,
  placeholder = "Search cryptocurrencies...",
  compact = false,
}: CryptoSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    searchResults,
    isSearching,
    searchError,
    searchCryptos,
    popularCryptos,
    isLoadingPopular,
  } = useCryptoData();

  // Detect theme changes for better visual feedback
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    };

    checkTheme();

    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Improved debounced search with typing indicator
  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set typing indicator
      setIsTyping(true);

      // Clear typing indicator after a short delay
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 150);

      debounceTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);

        if (searchQuery.trim() && searchQuery.length >= 2) {
          searchCryptos(searchQuery);
        } else {
          setIsOpen(false);
        }
      }, 500); // Increased debounce time for better API management
    },
    [searchCryptos]
  );

  // Handle query changes with improved debouncing
  useEffect(() => {
    debouncedSearch(query);

    // Cleanup timeouts on unmount or query change
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [query, debouncedSearch]);

  // Determine which cryptos to show
  const cryptosToShow =
    query.trim() && query.length >= 2
      ? searchResults
      : popularCryptos.slice(0, 10);
  const shouldShowDropdown =
    query.trim() && query.length >= 2
      ? searchResults.length > 0
      : isOpen && !query.trim();

  // Update dropdown visibility
  useEffect(() => {
    if (query.trim() === "") {
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
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < cryptosToShow.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < cryptosToShow.length) {
          handleSelect(cryptosToShow[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (crypto: Cryptocurrency) => {
    setQuery(""); // Clear the search query after selection
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur(); // Remove focus to prevent dropdown reopening
    onSelect?.(crypto);
  };

  return (
    <div
      ref={searchRef}
      className={`relative w-full mx-auto ${compact ? "max-w-md" : "max-w-lg"}`}
    >
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
          className={`
            ${compact ? "unified-input--compact" : "unified-input"}
            w-full pr-12
          `}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          {isSearching || isLoadingPopular || isTyping ? (
            <div className="loading-spinner" />
          ) : (
            <svg
              className="w-5 h-5"
              style={{ color: "var(--text-muted)" }}
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
        <div className="unified-dropdown absolute z-10 w-full mt-2 max-h-[32rem] overflow-y-auto">
          {!query.trim() && (
            <div
              className="px-6 py-3 text-xs font-semibold border-b flex items-center gap-2"
              style={{
                color: "var(--text-secondary)",
                borderColor: "var(--border-primary)",
                background: "var(--bg-overlay)",
              }}
            >
              <span className="text-base">🔥</span>
              Popular Cryptocurrencies
            </div>
          )}
          {query.trim() && query.length >= 2 && (
            <div
              className="px-6 py-3 text-xs font-semibold border-b flex items-center gap-2"
              style={{
                color: "var(--text-secondary)",
                borderColor: "var(--border-primary)",
                background: "var(--bg-overlay)",
              }}
            >
              <span className="text-base">🔍</span>
              {searchResults.length} result
              {searchResults.length !== 1 ? "s" : ""} for "{query}"
            </div>
          )}
          {cryptosToShow.map((crypto: Cryptocurrency, index: number) => (
            <CryptoCard
              key={crypto.id}
              crypto={crypto}
              onClick={handleSelect}
            />
          ))}
        </div>
      )}

      {/* No results */}
      {query.trim() !== "" && !isSearching && searchResults.length === 0 && (
        <div className="unified-card absolute z-10 w-full mt-2">
          <div className="px-6 py-4 text-center text-secondary">
            {searchError ? (
              <div style={{ color: "var(--color-error)" }}>
                <div className="font-medium">Search Error</div>
                <div className="text-sm">{searchError}</div>
              </div>
            ) : (
              <div>
                <div
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  No Results Found
                </div>
                <div className="text-sm mt-1">
                  No cryptocurrencies found for "{query}"
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
