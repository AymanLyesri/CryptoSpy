"use client";

import { useState, useEffect } from "react";
import { CoinGeckoService } from "../services/coinGeckoApi";
import { unifiedStyles } from "@/utils/themeUtils";

interface ApiStats {
  cache: {
    size: number;
    maxSize: number;
  };
  rateLimiter: {
    requestsInWindow: number;
    maxRequests: number;
  };
}

export default function ApiStatusIndicator() {
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      try {
        const apiStats = CoinGeckoService.getApiStats();
        setStats(apiStats);
      } catch (error) {
        console.error("Failed to get API stats:", error);
      }
    };

    // Update stats every 5 seconds
    const interval = setInterval(updateStats, 5000);
    updateStats(); // Initial update

    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  const cacheUsage = Math.round((stats.cache.size / stats.cache.maxSize) * 100);
  const rateLimitUsage = Math.round(
    (stats.rateLimiter.requestsInWindow / stats.rateLimiter.maxRequests) * 100
  );
  const isAtLimit = rateLimitUsage >= 100;
  const isNearLimit = rateLimitUsage > 70;

  return (
    <div id="api-status-indicator" className="fixed bottom-4 left-4 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`
          ${unifiedStyles.button.secondary}
          mb-2 text-xs font-medium
          ${
            isAtLimit
              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
              : isNearLimit
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800"
              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800"
          }
        `}
        title="API Status"
      >
        API {isAtLimit ? "Limit" : isNearLimit ? "Warning" : "OK"}
      </button>

      {/* Stats panel */}
      {isVisible && (
        <div
          style={{
            borderRadius: "var(--radius-card)",
            padding: "var(--spacing-card)",
            boxShadow: "var(--shadow-card-hover)",
            minWidth: "200px",
          }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-subheading mb-3 text-gray-600 dark:text-gray-400">
            API Status
          </h3>

          {/* Rate Limit Status */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Rate Limit
              </span>
              <span
                className={`text-xs font-medium ${
                  isAtLimit
                    ? "text-red-600 dark:text-red-400"
                    : isNearLimit
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-green-600 dark:text-green-400"
                }`}
              >
                {stats.rateLimiter.requestsInWindow}/
                {stats.rateLimiter.maxRequests}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  isAtLimit
                    ? "bg-red-500"
                    : isNearLimit
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${Math.min(rateLimitUsage, 100)}%` }}
              />
            </div>
          </div>

          {/* Cache Status */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Cache
              </span>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                {stats.cache.size}/{stats.cache.maxSize}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${cacheUsage}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
