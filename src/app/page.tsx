"use client";

import { useState, useEffect } from "react";
import CryptoSearch from "../components/CryptoSearch";
import CryptoPriceChart from "../components/CryptoPriceChart";
import TimeRangeSelector from "../components/TimeRangeSelector";
import ToastContainer from "../components/ToastContainer";
import { Cryptocurrency } from "../types/crypto";
import { TimeRange } from "../types/chartData";
import { useCryptoData } from "../hooks/useCryptoData";
import { useToast } from "../hooks/useToast";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  const [selectedCrypto, setSelectedCrypto] = useState<Cryptocurrency | null>(
    null
  );
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<TimeRange>("daily");

  const {
    priceHistory,
    isLoadingHistory,
    historyError,
    loadPriceHistory,
    isUsingFallbackData,
    popularError,
  } = useCryptoData();

  const { toasts, showToast, removeToast } = useToast();

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
    setSelectedCrypto(crypto);
    // Load price history when a crypto is selected
    loadPriceHistory(crypto.id);
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    setSelectedTimeRange(range);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 4 : 2,
    }).format(price);
  };

  const formatMarketCap = (marketCap: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(marketCap);
  };

  const formatPercentage = (percentage: number) => {
    const isPositive = percentage > 0;
    return (
      <span
        className={`font-semibold ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        {isPositive ? "+" : ""}
        {percentage.toFixed(2)}%
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ThemeToggle />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Crypto Spy 🕵️
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
            Search and discover cryptocurrency information
          </p>

          {/* Data Status Indicator */}
          <div className="flex justify-center mb-8">
            <div
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                isUsingFallbackData
                  ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700"
                  : "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700"
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
            <CryptoSearch onSelect={handleCryptoSelect} />
          </div>
        </div>

        {/* Selected Crypto Display */}
        {selectedCrypto && (
          <div className="space-y-6">
            {/* Crypto Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedCrypto.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 uppercase font-medium">
                      {selectedCrypto.symbol}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(selectedCrypto.current_price)}
                  </div>
                  <div className="text-lg">
                    {formatPercentage(
                      selectedCrypto.price_change_percentage_24h
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Market Cap
                  </h3>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {formatMarketCap(selectedCrypto.market_cap)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    24h Change
                  </h3>
                  <p className="text-xl font-semibold">
                    {formatPercentage(
                      selectedCrypto.price_change_percentage_24h
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Chart Controls */}
            <div className="flex justify-center">
              <TimeRangeSelector
                selectedRange={selectedTimeRange}
                onRangeChange={handleTimeRangeChange}
              />
            </div>

            {/* Price Chart */}
            {selectedCrypto && (
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}
