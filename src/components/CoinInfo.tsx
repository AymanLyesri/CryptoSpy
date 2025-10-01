"use client";

import { Cryptocurrency } from "../types/crypto";

interface CoinInfoProps {
  crypto: Cryptocurrency;
}

export default function CoinInfo({ crypto }: CoinInfoProps) {
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
        className={`font-semibold transition-colors duration-200 ${
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

  const getPercentageIcon = (percentage: number) => {
    if (percentage > 0) {
      return (
        <svg
          className="w-4 h-4 inline-block ml-1"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M7 14l5-5 5 5z" />
        </svg>
      );
    } else {
      return (
        <svg
          className="w-4 h-4 inline-block ml-1"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      );
    }
  };

  return (
    <div
      style={{
        padding: "var(--spacing-card)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
      }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-[var(--shadow-card-hover)]"
    >
      {/* Main Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        {/* Coin Identity */}
        <div className="flex items-center space-x-4">
          {crypto.image && (
            <img
              src={crypto.image}
              alt={`${crypto.name} logo`}
              className="w-12 h-12 rounded-full shadow-md"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {crypto.name}
            </h2>
            <p className="text-muted uppercase font-medium tracking-wider">
              {crypto.symbol}
            </p>
          </div>
        </div>

        {/* Price Section */}
        <div className="text-left sm:text-right">
          <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-1">
            {formatPrice(crypto.current_price)}
          </div>
          <div className="flex items-center justify-start sm:justify-end text-lg">
            {formatPercentage(crypto.price_change_percentage_24h)}
            {getPercentageIcon(crypto.price_change_percentage_24h)}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Market Cap */}
        <div
          style={{
            padding: "var(--spacing-card)",
            borderRadius: "var(--radius-card)",
          }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700/50"
        >
          <h3 className="text-label mb-2 text-blue-700 dark:text-blue-300">
            Market Cap
          </h3>
          <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
            {formatMarketCap(crypto.market_cap)}
          </p>
        </div>

        {/* 24h Change */}
        <div
          style={{
            padding: "var(--spacing-card)",
            borderRadius: "var(--radius-card)",
          }}
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700/50"
        >
          <h3 className="text-label mb-2 text-green-700 dark:text-green-300">
            24h Change
          </h3>
          <p className="text-xl font-bold">
            {formatPercentage(crypto.price_change_percentage_24h)}
          </p>
        </div>
      </div>

      {/* Price Action Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-label mb-1">Current Price</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPrice(crypto.current_price)}
            </p>
          </div>

          <div className="flex items-center justify-center sm:justify-end space-x-2">
            <span className="text-muted">24h Performance:</span>
            <div className="flex items-center">
              {formatPercentage(crypto.price_change_percentage_24h)}
              {getPercentageIcon(crypto.price_change_percentage_24h)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
