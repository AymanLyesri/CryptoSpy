'use client';

import { useState, useEffect } from 'react';
import { CoinGeckoService } from '../services/coinGeckoApi';

interface ApiStats {
  cache: {
    size: number;
    maxSize: number;
  };
  rateLimiter: {
    requestsInWindow: number;
    maxRequests: number;
    backoffMultiplier: number;
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
        console.error('Failed to get API stats:', error);
      }
    };

    // Update stats every 5 seconds
    const interval = setInterval(updateStats, 5000);
    updateStats(); // Initial update

    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  const cacheUsage = Math.round((stats.cache.size / stats.cache.maxSize) * 100);
  const rateLimitUsage = Math.round((stats.rateLimiter.requestsInWindow / stats.rateLimiter.maxRequests) * 100);
  const isNearLimit = rateLimitUsage > 80;
  const hasBackoff = stats.rateLimiter.backoffMultiplier > 1;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        style={{ borderRadius: 'var(--radius-button)' }}
        className={`mb-2 px-3 py-1 text-xs font-medium transition-colors ${
          isNearLimit || hasBackoff
            ? 'status-warning hover:bg-yellow-600'
            : 'status-success hover:bg-green-600'
        }`}
        title="Click to view API usage details"
      >
        API {isNearLimit || hasBackoff ? '⚠️' : '✅'}
      </button>

      {/* Stats panel */}
      {isVisible && (
        <div style={{ 
          borderRadius: 'var(--radius-card)',
          padding: 'var(--spacing-card)',
          boxShadow: 'var(--shadow-card-hover)',
          minWidth: '200px'
        }} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-subheading mb-3">
            API Status
          </h3>
          
          {/* Rate Limit Status */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">Rate Limit</span>
              <span className={`text-xs font-medium ${
                isNearLimit ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
              }`}>
                {stats.rateLimiter.requestsInWindow}/{stats.rateLimiter.maxRequests}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  isNearLimit ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${rateLimitUsage}%` }}
              />
            </div>
            {hasBackoff && (
              <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Backoff: {stats.rateLimiter.backoffMultiplier.toFixed(1)}x
              </div>
            )}
          </div>

          {/* Cache Status */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">Cache</span>
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
            {isNearLimit && (
              <div className="text-yellow-600 dark:text-yellow-400 mb-1">
                ⚠️ Near rate limit
              </div>
            )}
            {hasBackoff && (
              <div className="text-orange-600 dark:text-orange-400 mb-1">
                🕐 Requests throttled
              </div>
            )}
            {!isNearLimit && !hasBackoff && (
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