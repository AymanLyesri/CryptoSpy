"use client";

import React, { useState, useEffect } from "react";
import { Cryptocurrency } from "../types/crypto";
import { useNewsData } from "../hooks/useNewsData";
import AdComponent from "./AdComponent";
import { newsApiService } from "@/services/newsApi";
import { unifiedStyles, formatters, colors } from "@/utils/themeUtils";

interface NewsComponentProps {
  isDarkMode?: boolean;
  title?: string;
  className?: string;
  selectedCrypto?: Cryptocurrency | null;
}

export default function NewsComponent({
  isDarkMode = false,
  title,
  className = "",
  selectedCrypto = null,
}: NewsComponentProps) {
  const [dynamicTitle, setDynamicTitle] = useState(title || "Latest News");

  // Use the news hook to get dynamic data
  const { news, loading, error, refreshNews, lastUpdated } = useNewsData({
    selectedCrypto,
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000, // 5 minutes
  });

  // Update title based on time and selection
  useEffect(() => {
    if (title) {
      setDynamicTitle(title);
    } else if (selectedCrypto) {
      setDynamicTitle(`${selectedCrypto.name} News`);
    } else {
      setDynamicTitle(newsApiService.getNewsGreeting());
    }
  }, [title, selectedCrypto]);

  const getCategoryColor = colors.getCategoryColor;

  const formatTimeAgo = formatters.timeAgo;

  const getSentimentIcon = (sentiment?: string): string => {
    switch (sentiment) {
      case "positive":
        return "📈";
      case "negative":
        return "📉";
      default:
        return "📰";
    }
  };

  return (
    <div className={`${unifiedStyles.card.base} ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <span className="text-2xl mr-3">📰</span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {dynamicTitle}
            </h2>
          </div>
          {!loading && (
            <button
              onClick={refreshNews}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200"
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              }`}
              title="Refresh news"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          )}
        </div>

        {lastUpdated && !loading && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ Using cached news data. {error}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {/* Top ad placement */}
          <AdComponent
            adSlot="2822503833"
            className="mb-4"
            fallback={
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  📰 Advertisement Space
                </span>
              </div>
            }
          />

          {loading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg border animate-pulse ${
                    isDarkMode
                      ? "bg-gray-700/30 border-gray-600"
                      : "bg-white/30 border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                  </div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                </div>
              ))}
            </div>
          )}

          {!loading && news.length === 0 && (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">📭</span>
              <p className="text-gray-500 dark:text-gray-400">
                No news available at the moment
              </p>
            </div>
          )}

          {!loading &&
            news.map((item, index) => (
              <React.Fragment key={item.id}>
                {/* Insert ad after every 3rd news item */}
                {/* {index === 2 && (
                  <AdComponent
                    adSlot="9876543210"
                    adFormat="fluid"
                    className="my-4"
                    fallback={
                      <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          💼 Sponsored Content
                        </span>
                      </div>
                    }
                  />
                )} */}
                <div
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                    isDarkMode
                      ? "bg-gray-700/30 border-gray-600 hover:bg-gray-700/50"
                      : "bg-white/30 border-gray-200 hover:bg-white/60"
                  }`}
                  onClick={() => item.url && window.open(item.url, "_blank")}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(
                          item.category
                        )}`}
                      >
                        {item.category}
                      </span>
                      {item.sentiment && (
                        <span className="text-sm">
                          {getSentimentIcon(item.sentiment)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(item.publishedAt)}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {item.summary}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {item.source.name}
                    </span>
                    {item.currencies && item.currencies.length > 0 && (
                      <div className="flex space-x-1">
                        {item.currencies.slice(0, 3).map((currency) => (
                          <span
                            key={currency}
                            className="text-xs px-1 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                          >
                            {currency}
                          </span>
                        ))}
                        {item.currencies.length > 3 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{item.currencies.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            ))}

          {/* Bottom ad placement - only show if we have news items */}
          {!loading && news.length > 0 && (
            <AdComponent
              adSlot="2822503833"
              adFormat="rectangle"
              className="mt-6"
              style={{ minHeight: "250px" }}
              fallback={
                <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border">
                  <div className="text-2xl mb-2">🎯</div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Support us by allowing ads or consider our premium features
                  </span>
                </div>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
