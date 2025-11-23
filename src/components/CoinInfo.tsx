"use client";

import { Cryptocurrency } from "../types/crypto";
import { unifiedStyles, formatters } from "@/utils/themeUtils";

interface CoinInfoProps {
  crypto: Cryptocurrency;
}

export default function CoinInfo({ crypto }: CoinInfoProps) {
  const formatPercentage = (percentage: number, showIcon: boolean = true) => {
    const percentageData = formatters.percentage(percentage);
    return (
      <span className={percentageData.className}>
        {percentageData.formatted}
        {showIcon && getPercentageIcon(percentage)}
      </span>
    );
  };

  const formatPrice = formatters.price;
  const formatMarketCap = formatters.currency;
  const formatVolume = formatters.currency;
  const formatSupply = formatters.supply;

  const getPercentageIcon = (percentage: number) => {
    if (percentage > 0) {
      return (
        <svg
          className="w-3 h-3 inline-block ml-1"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M7 14l5-5 5 5z" />
        </svg>
      );
    } else {
      return (
        <svg
          className="w-3 h-3 inline-block ml-1"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={`${unifiedStyles.card.hover} h-fit`}>
      {/* Main Header Section */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Coin Identity */}
        <div className="flex flex-col items-center text-center">
          {crypto.image && (
            <img
              src={crypto.image}
              alt={`${crypto.name} logo`}
              className="w-16 h-16 rounded-full shadow-md mb-3"
            />
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {crypto.name}
            </h2>
            <p className="text-muted uppercase font-medium tracking-wider text-sm">
              {crypto.symbol}
            </p>
            {crypto.market_cap_rank && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Rank #{crypto.market_cap_rank}
              </p>
            )}
          </div>
        </div>

        {/* Price Section */}
        <div className="text-center border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {formatPrice(crypto.current_price)}
          </div>
          <div className="flex items-center justify-center text-base mb-2">
            {formatPercentage(crypto.price_change_percentage_24h)}
          </div>
          {crypto.price_change_24h && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {crypto.price_change_24h > 0 ? "+" : ""}
              {formatPrice(crypto.price_change_24h)} (24h)
            </div>
          )}
        </div>
      </div>

      {/* Price Performance Stats */}
      {(crypto.price_change_percentage_1h_in_currency ||
        crypto.price_change_percentage_7d ||
        crypto.price_change_percentage_30d) && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Performance
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {crypto.price_change_percentage_1h_in_currency !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">1h:</span>
                {formatPercentage(
                  crypto.price_change_percentage_1h_in_currency,
                  false
                )}
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">24h:</span>
              {formatPercentage(crypto.price_change_percentage_24h, false)}
            </div>
            {crypto.price_change_percentage_7d !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">7d:</span>
                {formatPercentage(crypto.price_change_percentage_7d, false)}
              </div>
            )}
            {crypto.price_change_percentage_30d !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">30d:</span>
                {formatPercentage(crypto.price_change_percentage_30d, false)}
              </div>
            )}
            {crypto.price_change_percentage_1y !== undefined && (
              <div className="flex justify-between col-span-2">
                <span className="text-gray-600 dark:text-gray-400">1y:</span>
                {formatPercentage(crypto.price_change_percentage_1y, false)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Market Stats */}
      <div className="space-y-4 mb-6">
        {/* Market Cap */}
        <div
          style={{
            padding: "1rem",
            borderRadius: "var(--radius-card)",
          }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700/50"
        >
          <h3 className="text-sm font-medium mb-2 text-blue-700 dark:text-blue-300">
            Market Cap
          </h3>
          <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
            {formatMarketCap(crypto.market_cap)}
          </p>
          {crypto.market_cap_change_percentage_24h && (
            <p className="text-xs mt-1 text-blue-700 dark:text-blue-300">
              {crypto.market_cap_change_percentage_24h > 0 ? "+" : ""}
              {crypto.market_cap_change_percentage_24h.toFixed(2)}% (24h)
            </p>
          )}
        </div>

        {/* Volume */}
        {crypto.total_volume && (
          <div
            style={{
              padding: "1rem",
              borderRadius: "var(--radius-card)",
            }}
            className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700/50"
          >
            <h3 className="text-sm font-medium mb-2 text-purple-700 dark:text-purple-300">
              24h Volume
            </h3>
            <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
              {formatVolume(crypto.total_volume)}
            </p>
          </div>
        )}
      </div>

      {/* Price Range (24h) */}
      {(crypto.high_24h || crypto.low_24h) && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            24h Range
          </h3>
          <div className="space-y-2">
            {crypto.low_24h && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Low:</span>
                <span className="font-semibold text-gray-600 dark:text-gray-400">
                  {formatPrice(crypto.low_24h)}
                </span>
              </div>
            )}
            {crypto.high_24h && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">High:</span>
                <span className="font-semibold text-gray-600 dark:text-gray-400">
                  {formatPrice(crypto.high_24h)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All Time High/Low */}
      {(crypto.ath || crypto.atl) && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            All Time
          </h3>
          <div className="space-y-2">
            {crypto.ath && (
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">ATH:</span>
                  <span className="font-semibold text-gray-600 dark:text-gray-400">
                    {formatPrice(crypto.ath)}
                  </span>
                </div>
                {crypto.ath_change_percentage && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-500">
                      From ATH:
                    </span>
                    <span className="text-red-600 dark:text-red-400">
                      {crypto.ath_change_percentage.toFixed(1)}%
                    </span>
                  </div>
                )}
                {crypto.ath_date && (
                  <div className="text-xs text-gray-500 dark:text-gray-500 text-right">
                    {formatDate(crypto.ath_date)}
                  </div>
                )}
              </div>
            )}
            {crypto.atl && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">ATL:</span>
                  <span className="font-semibold text-gray-600 dark:text-gray-400">
                    {formatPrice(crypto.atl)}
                  </span>
                </div>
                {crypto.atl_change_percentage && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-500">
                      From ATL:
                    </span>
                    <span className="text-green-600 dark:text-green-400">
                      +{crypto.atl_change_percentage.toFixed(1)}%
                    </span>
                  </div>
                )}
                {crypto.atl_date && (
                  <div className="text-xs text-gray-500 dark:text-gray-500 text-right">
                    {formatDate(crypto.atl_date)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Supply Information */}
      {(crypto.circulating_supply ||
        crypto.total_supply ||
        crypto.max_supply) && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Supply
          </h3>
          <div className="space-y-2 text-sm">
            {crypto.circulating_supply && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Circulating:
                </span>
                <span className="font-semibold text-gray-600 dark:text-gray-400">
                  {formatSupply(crypto.circulating_supply)} {crypto.symbol}
                </span>
              </div>
            )}
            {crypto.total_supply && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total:</span>
                <span className="font-semibold text-gray-600 dark:text-gray-400">
                  {formatSupply(crypto.total_supply)} {crypto.symbol}
                </span>
              </div>
            )}
            {crypto.max_supply && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Max:</span>
                <span className="font-semibold text-gray-600 dark:text-gray-400">
                  {formatSupply(crypto.max_supply)} {crypto.symbol}
                </span>
              </div>
            )}
            {crypto.max_supply && crypto.circulating_supply && (
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500 dark:text-gray-500">
                    Progress:
                  </span>
                  <span className="text-gray-500 dark:text-gray-500">
                    {(
                      (crypto.circulating_supply / crypto.max_supply) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        (crypto.circulating_supply / crypto.max_supply) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ROI Information */}
      {crypto.roi && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            ROI
          </h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Times:</span>
              <span className="font-semibold text-gray-600 dark:text-gray-400">
                {crypto.roi.times.toFixed(2)}x
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Percentage:
              </span>
              <span
                className={`font-semibold ${
                  crypto.roi.percentage > 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {crypto.roi.percentage > 0 ? "+" : ""}
                {crypto.roi.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Last Updated */}
      {crypto.last_updated && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-500 text-center">
            Last updated: {formatDate(crypto.last_updated)}
          </div>
        </div>
      )}
    </div>
  );
}
