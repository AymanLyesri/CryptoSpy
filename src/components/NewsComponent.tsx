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

  const getSentimentBadge = (sentiment?: string): string => {
    switch (sentiment) {
      case "positive":
        return "Positive";
      case "negative":
        return "Negative";
      default:
        return "Neutral";
    }
  };

  return (
    <section className={`unified-card ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <h2
              className="text-xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {dynamicTitle}
            </h2>
          </div>
          {!loading && (
            <button
              onClick={refreshNews}
              className="unified-button--ghost !p-2"
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
          <div className="text-xs text-muted mb-4">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Warning:</strong> Using cached news data. {error}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {/* Top ad placement */}
          {/* <AdComponent
            adSlot="2822503833"
            className="mb-4"
            fallback={
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  📰 Advertisement Space
                </span>
              </div>
            }
          /> */}

          {loading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="unified-card !p-4 loading-pulse">
                  <div className="flex justify-between items-start mb-2">
                    <div
                      className="h-4 rounded w-16"
                      style={{ background: "var(--border-secondary)" }}
                    ></div>
                    <div
                      className="h-3 rounded w-12"
                      style={{ background: "var(--border-secondary)" }}
                    ></div>
                  </div>
                  <div
                    className="h-4 rounded w-3/4 mb-2"
                    style={{ background: "var(--border-secondary)" }}
                  ></div>
                  <div
                    className="h-3 rounded w-full"
                    style={{ background: "var(--border-secondary)" }}
                  ></div>
                </div>
              ))}
            </div>
          )}

          {!loading && news.length === 0 && (
            <div className="text-center py-8">
              <p className="text-secondary">No news available at the moment</p>
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
                  className="unified-card !p-4 cursor-pointer"
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
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            item.sentiment === "positive"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : item.sentiment === "negative"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {getSentimentBadge(item.sentiment)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted">
                      {formatTimeAgo(item.publishedAt)}
                    </span>
                  </div>

                  <h3
                    className="font-semibold mb-2 line-clamp-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {item.title}
                  </h3>

                  <p className="text-sm text-secondary line-clamp-2 mb-2">
                    {item.summary}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">
                      {item.source.name}
                    </span>
                    {item.currencies && item.currencies.length > 0 && (
                      <div className="flex space-x-1">
                        {item.currencies.slice(0, 3).map((currency) => (
                          <span
                            key={currency}
                            className="text-xs px-1 py-0.5 rounded"
                            style={{
                              background: "var(--bg-overlay)",
                              color: "var(--text-primary)",
                            }}
                          >
                            {currency}
                          </span>
                        ))}
                        {item.currencies.length > 3 && (
                          <span className="text-xs text-muted">
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
          {/* {!loading && news.length > 0 && (
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
          )} */}
        </div>
      </div>
    </section>
  );
}
