"use client";

import { useState, useEffect } from "react";
import { CoinGeckoService } from "../services/coinGeckoApi";

interface ApiStats {
  cache: {
    size: number;
    maxSize: number;
  };
  rateLimiter: {
    requestsInWindow: number;
    maxRequests: number;
    backoffMultiplier: number;
    nextAvailableTime?: number;
  };
}

export default function ApiStatusIndicator() {
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    const updateStats = () => {
      try {
        const apiStats = CoinGeckoService.getApiStats();
        setStats(apiStats);

        // Only calculate countdown when near or at rate limit
        const rateLimitUsage =
          apiStats.rateLimiter.requestsInWindow /
          apiStats.rateLimiter.maxRequests;
        const isNearOrAtLimit = rateLimitUsage > 0.8; // 80% threshold

        if (isNearOrAtLimit) {
          if (apiStats.rateLimiter.nextAvailableTime) {
            // Use actual next available time from rate limiter
            const waitTime = Math.max(
              apiStats.rateLimiter.nextAvailableTime - Date.now(),
              0
            );
            setCountdown(Math.ceil(waitTime / 1000));
          } else {
            // Estimate countdown based on request window (60 seconds)
            const windowMs = 60000; // 1 minute window
            const estimatedTimeToNextSlot = Math.ceil(
              (apiStats.rateLimiter.requestsInWindow /
                apiStats.rateLimiter.maxRequests) *
                (windowMs / 1000)
            );
            setCountdown(Math.max(estimatedTimeToNextSlot, 1));
          }
        } else {
          setCountdown(0);
        }
      } catch (error) {
        console.error("Failed to get API stats:", error);
      }
    };

    // Update stats every second for accurate countdown
    const interval = setInterval(updateStats, 1000);
    updateStats(); // Initial update

    return () => clearInterval(interval);
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => Math.max(prev - 1, 0));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!stats) return null;

  const cacheUsage = Math.round((stats.cache.size / stats.cache.maxSize) * 100);
  const rateLimitUsage = Math.round(
    (stats.rateLimiter.requestsInWindow / stats.rateLimiter.maxRequests) * 100
  );
  const isNearLimit = rateLimitUsage > 80;
  const isAtLimit =
    stats.rateLimiter.requestsInWindow >= stats.rateLimiter.maxRequests;
  const hasBackoff = stats.rateLimiter.backoffMultiplier > 1;

  // Format countdown time
  const formatCountdown = (seconds: number) => {
    if (seconds <= 0) return "";
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        style={{ borderRadius: "var(--radius-button)" }}
        className={`mb-2 px-3 py-1 text-xs font-medium transition-colors ${
          isAtLimit || hasBackoff
            ? "status-warning hover:bg-yellow-600"
            : isNearLimit
            ? "status-warning hover:bg-yellow-600"
            : "status-success hover:bg-green-600"
        }`}
        title="Click to view API usage details"
      >
        {(isNearLimit || isAtLimit) && countdown > 0
          ? `API 🕐 ${formatCountdown(countdown)}`
          : isAtLimit
          ? "API 🚫"
          : `API ${isNearLimit || hasBackoff ? "⚠️" : "✅"}`}
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
          <h3 className="text-subheading mb-3">API Status</h3>

          {/* Rate Limit Status */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Rate Limit
              </span>
              <span
                className={`text-xs font-medium ${
                  isNearLimit
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
                  isNearLimit ? "bg-yellow-500" : "bg-green-500"
                }`}
                style={{ width: `${rateLimitUsage}%` }}
              />
            </div>
            {hasBackoff && (
              <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Backoff: {stats.rateLimiter.backoffMultiplier.toFixed(1)}x
              </div>
            )}
            {(isNearLimit || isAtLimit) && countdown > 0 && (
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Next available: {formatCountdown(countdown)}
              </div>
            )}
          </div>

          {/* Cache Status */}
          <div className="mb-3">
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

          {/* Status Messages */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {(isNearLimit || isAtLimit) && countdown > 0 && (
              <div className="text-blue-600 dark:text-blue-400 mb-1">
                🕐 Next slot available in {formatCountdown(countdown)}
              </div>
            )}
            {isAtLimit && countdown === 0 && (
              <div className="text-red-600 dark:text-red-400 mb-1">
                🚫 Rate limit reached
              </div>
            )}
            {isNearLimit && !isAtLimit && countdown === 0 && (
              <div className="text-yellow-600 dark:text-yellow-400 mb-1">
                ⚠️ Near rate limit
              </div>
            )}
            {hasBackoff && (
              <div className="text-orange-600 dark:text-orange-400 mb-1">
                🕐 Requests throttled
              </div>
            )}
            {!isNearLimit && !hasBackoff && !isAtLimit && (
              <div className="text-green-600 dark:text-green-400">
                ✅ Operating normally
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
