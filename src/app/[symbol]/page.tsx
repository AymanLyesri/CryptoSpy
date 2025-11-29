"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Navbar from "../../components/Navbar";
import CryptoPriceChart from "../../components/CryptoPriceChart";
import TimeRangeSelector from "../../components/TimeRangeSelector";
import ToastContainer from "../../components/ToastContainer";
import CoinInfo from "../../components/CoinInfo";
import NewsComponent from "../../components/NewsComponent";
import { Cryptocurrency } from "../../types/crypto";
import { TimeRange } from "../../types/chartData";
import { useCryptoData } from "../../hooks/useCryptoData";
import { useToast } from "../../hooks/useToast";
import ApiStatusIndicator from "../../components/ApiStatusIndicator";
import { getCryptoBySymbol } from "../../services/coinGeckoApi";
import Script from "next/script";

interface CryptoPageProps {
  params: Promise<{ symbol: string }>;
}

// Structured data for cryptocurrency
const generateStructuredData = (crypto: Cryptocurrency) => {
  return {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    name: crypto.name,
    description: `Live price and market data for ${
      crypto.name
    } (${crypto.symbol?.toUpperCase()})`,
    url: `https://crypto-spy-app.vercel.app/${crypto.symbol?.toLowerCase()}`,
    category: "Cryptocurrency",
    provider: {
      "@type": "Organization",
      name: "Crypto Spy",
    },
    offers: {
      "@type": "Offer",
      price: crypto.current_price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: crypto.market_cap_rank
        ? Math.max(1, 6 - Math.log10(crypto.market_cap_rank))
        : 4,
      ratingCount: "1000",
      bestRating: "5",
      worstRating: "1",
    },
  };
};

export default function CryptoPage({ params }: CryptoPageProps) {
  const [selectedCrypto, setSelectedCrypto] = useState<Cryptocurrency | null>(
    null
  );
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<TimeRange>("daily");
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
    // This will be handled by the Navbar component
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    setSelectedTimeRange(range);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
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
    <div className="mt-32 min-h-screen transition-colors duration-300">
      <Script
        id={`crypto-structured-data-${selectedCrypto.symbol}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData(selectedCrypto)),
        }}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Single Navbar - Fixed at top with scroll transitions */}
      <Navbar onCryptoSelect={handleCryptoSelect} />

      {/* Main Content - Add top padding to account for fixed navbar */}
      <main className="pt-20 sm:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
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
                    <div className=" backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300">
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
                    <div className=" border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
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
      </main>
    </div>
  );
}
