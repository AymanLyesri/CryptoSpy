"use client";

import { Cryptocurrency } from "../types/crypto";
import { useCryptoData } from "../hooks/useCryptoData";
import NewsComponent from "./NewsComponent";
import TipsComponent from "./TipsComponent";
import { unifiedStyles, formatters } from "@/utils/themeUtils";

interface LandingComponentProps {
  onCoinSelect?: (crypto: Cryptocurrency) => void;
  isDarkMode?: boolean;
}

export default function LandingComponent({
  onCoinSelect,
  isDarkMode = false,
}: LandingComponentProps) {
  const { popularCryptos, isLoadingPopular } = useCryptoData();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 4 : 2,
    }).format(price);
  };

  const formatPercentage = (percentage: number | null) => {
    if (percentage === null || percentage === undefined) {
      return (
        <span className="font-medium text-gray-500 dark:text-gray-400">
          N/A
        </span>
      );
    }

    const isPositive = percentage > 0;
    return (
      <span
        className={`font-medium ${
          isPositive
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 dark:text-red-400"
        }`}
      >
        {isPositive ? "+" : ""}
        {percentage.toFixed(2)}%
      </span>
    );
  };

  return (
    <div className="mt-8 space-y-8">
      {/* Popular Coins Section */}
      <div
        className={`rounded-xl border backdrop-blur-md transition-all duration-300 ${
          isDarkMode
            ? "bg-gray-800/50 border-gray-700"
            : "bg-white/50 border-gray-200"
        }`}
        style={{
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div className="p-6">
          <div className="flex items-center mb-6">
            <span className="text-2xl mr-3">🚀</span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Popular Cryptocurrencies
            </h2>
          </div>

          {isLoadingPopular ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg border animate-pulse ${
                    isDarkMode
                      ? "bg-gray-700/50 border-gray-600"
                      : "bg-gray-100 border-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularCryptos.slice(0, 6).map((crypto: Cryptocurrency) => (
                <div
                  key={crypto.id}
                  onClick={() => onCoinSelect?.(crypto)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-105 ${
                    isDarkMode
                      ? "bg-gray-700/30 border-gray-600 hover:bg-gray-700/50 hover:border-gray-500"
                      : "bg-white/50 border-gray-200 hover:bg-white/80 hover:border-gray-300"
                  }`}
                  style={{
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {crypto.image && (
                        <img
                          src={crypto.image}
                          alt={crypto.name}
                          className="w-8 h-8 rounded-full"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {crypto.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                          {crypto.symbol}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {formatPrice(crypto.current_price)}
                      </div>
                      <div className="text-xs">
                        {formatPercentage(crypto.price_change_percentage_24h)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tips and News Container */}
      <div className="space-y-8">
        {/* Tips Section */}
        <TipsComponent isDarkMode={isDarkMode} />

        {/* News Section */}
        <NewsComponent isDarkMode={isDarkMode} />
      </div>
    </div>
  );
}
