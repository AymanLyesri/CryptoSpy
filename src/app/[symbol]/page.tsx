"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import CryptoSearch from "../../components/CryptoSearch";
import CryptoPriceChart from "../../components/CryptoPriceChart";
import TimeRangeSelector from "../../components/TimeRangeSelector";
import ToastContainer from "../../components/ToastContainer";
import CoinInfo from "../../components/CoinInfo";
import NewsComponent from "../../components/NewsComponent";
import { Cryptocurrency } from "../../types/crypto";
import { TimeRange } from "../../types/chartData";
import { useCryptoData } from "../../hooks/useCryptoData";
import { useToast } from "../../hooks/useToast";
import ThemeToggle from "@/components/ThemeToggle";
import ApiStatusIndicator from "../../components/ApiStatusIndicator";
import { getCryptoBySymbol } from "../../services/coinGeckoApi";

interface CryptoPageProps {
  params: Promise<{ symbol: string }>;
}

export default function CryptoPage({ params }: CryptoPageProps) {
  const router = useRouter();
  const [selectedCrypto, setSelectedCrypto] = useState<Cryptocurrency | null>(
    null
  );
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<TimeRange>("daily");
  const [showStickySearch, setShowStickySearch] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [symbol, setSymbol] = useState<string>("");

  const {
    priceHistory,
    isLoadingHistory,
    historyError,
    loadPriceHistory,
    isUsingFallbackData,
    popularError,
  } = useCryptoData();

  const { toasts, showToast, removeToast } = useToast();

  // Unwrap params
  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setSymbol(resolvedParams.symbol);
    };
    unwrapParams();
  }, [params]);

  // Load crypto data based on symbol
  useEffect(() => {
    const loadCrypto = async () => {
      if (!symbol) return;

      setIsLoading(true);
      try {
        const crypto = await getCryptoBySymbol(symbol.toLowerCase());
        if (crypto) {
          setSelectedCrypto(crypto);
          loadPriceHistory(crypto.id);
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Error loading crypto:", error);
        notFound();
      } finally {
        setIsLoading(false);
      }
    };

    loadCrypto();
  }, [symbol, loadPriceHistory]);

  // Detect theme changes
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

  // Handle sticky search bar visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowStickySearch(scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Show toast when using fallback data
  useEffect(() => {
    if (isUsingFallbackData) {
      showToast(
        "Using offline data - API rate limit reached. Data may not be current.",
        "warning",
        8000
      );
    }
  }, [isUsingFallbackData, showToast]);

  // Show toast for popular crypto errors
  useEffect(() => {
    if (popularError && isUsingFallbackData) {
      showToast(
        "Unable to fetch live data. Showing sample cryptocurrencies.",
        "info",
        6000
      );
    }
  }, [popularError, isUsingFallbackData, showToast]);

  const handleCryptoSelect = (crypto: Cryptocurrency) => {
    // Navigate to the new crypto page
    router.push(`/${crypto.symbol.toLowerCase()}`);
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    setSelectedTimeRange(range);
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-pulse">
              <div className="text-gray-600 dark:text-gray-300 text-lg mb-4">
                Loading {symbol.toUpperCase()} data...
              </div>
              <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-gray-500 dark:text-gray-400 text-sm">
                Fetching cryptocurrency information
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedCrypto) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ThemeToggle />

      {/* Sticky Search Bar */}
      {showStickySearch && (
        <div
          style={{
            boxShadow: "var(--shadow-card-hover)",
          }}
          className="fixed top-0 left-0 right-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 py-2 px-4 sm:px-6 lg:px-8 transition-all duration-300 ease-out"
        >
          <div className="max-w-lg mx-auto flex items-center gap-4">
            <button
              onClick={handleBackToHome}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ← Home
            </button>
            <CryptoSearch
              onSelect={handleCryptoSelect}
              placeholder="Search another crypto..."
              compact={true}
            />
          </div>
        </div>
      )}

      <div
        className={`max-w-7xl mx-auto transition-all duration-300 ${
          showStickySearch ? "pt-16" : ""
        }`}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <button
              onClick={handleBackToHome}
              className="mr-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ← Home
            </button>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {selectedCrypto.name} ({selectedCrypto.symbol.toUpperCase()})
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
            Comprehensive crypto analysis and live data
          </p>

          {/* Data Status Indicator */}
          <div className="flex justify-center mb-8">
            <div
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "var(--radius-button)",
                border: "1px solid",
              }}
              className={`inline-flex items-center text-sm font-medium transition-all duration-300 ${
                isUsingFallbackData
                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700"
                  : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  isUsingFallbackData
                    ? "bg-yellow-500 dark:bg-yellow-400"
                    : "bg-green-500 dark:bg-green-400"
                }`}
              ></div>
              <span>
                {isUsingFallbackData ? "Limited Data Mode" : "Live Data Active"}
              </span>
              {popularError && (
                <span className="ml-2 text-xs opacity-75">
                  •{" "}
                  {popularError.includes("401")
                    ? "API Auth Issue"
                    : popularError.includes("429")
                    ? "Rate Limited"
                    : "Connection Issue"}
                </span>
              )}
            </div>
          </div>

          {/* Search Component */}
          <div className="mb-8">
            <CryptoSearch
              onSelect={handleCryptoSelect}
              placeholder="Search another cryptocurrency..."
            />
          </div>
        </div>

        {/* Crypto Display */}
        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          {/* Left Sidebar - Crypto Info */}
          <div className="lg:col-span-1 xl:col-span-1 order-2 lg:order-1">
            <CoinInfo crypto={selectedCrypto} />
          </div>

          {/* Middle Section - Chart and Controls */}
          <div className="lg:col-span-3 xl:col-span-3 order-1 lg:order-2 space-y-6">
            {/* Chart Controls */}
            <div className="flex justify-center lg:justify-start">
              <TimeRangeSelector
                selectedRange={selectedTimeRange}
                onRangeChange={handleTimeRangeChange}
              />
            </div>

            {/* Price Chart */}
            <div className="relative">
              {isLoadingHistory && (
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300">
                  <div className="text-center py-12">
                    <div className="animate-pulse">
                      <div className="text-gray-600 dark:text-gray-300 text-lg mb-4">
                        Loading {selectedCrypto.name} price chart...
                      </div>
                      <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <div className="text-gray-500 dark:text-gray-400 text-sm">
                        Fetching historical data
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {historyError && !isLoadingHistory && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                  <div className="text-red-600 dark:text-red-400 font-medium">
                    Failed to load price data
                  </div>
                  <div className="text-red-500 dark:text-red-400 text-sm mt-1">
                    {historyError}
                  </div>
                  <button
                    onClick={() => loadPriceHistory(selectedCrypto.id)}
                    className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              {priceHistory &&
                priceHistory.cryptoId === selectedCrypto.id &&
                !isLoadingHistory && (
                  <CryptoPriceChart
                    key={`${selectedCrypto.id}-${selectedTimeRange}`}
                    data={priceHistory[selectedTimeRange] || []}
                    timeRange={selectedTimeRange}
                    cryptoName={selectedCrypto.name}
                    cryptoSymbol={selectedCrypto.symbol}
                    currentPrice={selectedCrypto.current_price}
                  />
                )}
            </div>

            {/* News Section - Below Chart */}
            <div className="mt-8">
              <NewsComponent
                isDarkMode={isDarkMode}
                title={`${selectedCrypto.name} News & Updates`}
                selectedCrypto={selectedCrypto}
              />
            </div>
          </div>
        </div>
      </div>
      <ApiStatusIndicator />
    </div>
  );
}
