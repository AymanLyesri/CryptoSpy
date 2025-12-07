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
  const [expandedNewsIds, setExpandedNewsIds] = useState<Set<string>>(
    new Set()
  );
  const [loadingContent, setLoadingContent] = useState<Set<string>>(new Set());
  const [newsContents, setNewsContents] = useState<Map<string, string>>(
    new Map()
  );
  const [contentLoadingStatus, setContentLoadingStatus] = useState<
    Map<string, boolean>
  >(new Map());

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

  // Function to fetch article content
  const fetchArticleContent = async (
    newsId: string,
    newsUrl?: string
  ): Promise<string> => {
    if (!newsUrl) {
      return "";
    }

    try {
      const response = await fetch(newsUrl);
      const html = await response.text();

      // Extract main content from HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Try to find the main article content
      let content = "";
      const articleElement =
        doc.querySelector("article") ||
        doc.querySelector('[role="main"]') ||
        doc.querySelector(".article-content") ||
        doc.querySelector(".post-content") ||
        doc.querySelector("main");

      if (articleElement) {
        // Get text content and clean it up
        const paragraphs = articleElement.querySelectorAll("p");
        content = Array.from(paragraphs)
          .map((p) => p.textContent?.trim())
          .filter((text) => text && text.length > 50)
          .join("\n\n");
      }

      return content;
    } catch (error) {
      console.error("Failed to fetch article content:", error);
      return "";
    }
  };

  // Load all article contents on mount and when news changes
  useEffect(() => {
    if (news.length === 0 || loading) return;

    const loadAllContents = async () => {
      const newContents = new Map<string, string>();
      const newLoadingStatus = new Map<string, boolean>();

      for (const item of news) {
        // Skip if already loaded
        if (newsContents.has(item.id)) {
          newContents.set(item.id, newsContents.get(item.id)!);
          newLoadingStatus.set(item.id, true);
          continue;
        }

        // Set loading status
        newLoadingStatus.set(item.id, false);

        // Fetch content
        const content = await fetchArticleContent(item.id, item.url);

        if (content) {
          newContents.set(item.id, content);
          newLoadingStatus.set(item.id, true);
        }
      }

      setNewsContents(newContents);
      setContentLoadingStatus(newLoadingStatus);
    };

    loadAllContents();
  }, [news, loading]);

  const toggleExpand = async (newsId: string) => {
    const newExpandedIds = new Set(expandedNewsIds);

    if (expandedNewsIds.has(newsId)) {
      // Collapse
      newExpandedIds.delete(newsId);
    } else {
      // Expand
      newExpandedIds.add(newsId);
    }

    setExpandedNewsIds(newExpandedIds);
  };

  // Check if news item has expandable content
  const hasExpandableContent = (item: NewsItem): boolean => {
    const content = newsContents.get(item.id) || item.content;
    return !!content && content.length > 0;
  };

  return (
    <section id="news-section" className={`unified-card ${className}`}>
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

                  {/* Hidden full content for SEO/AdSense - always present but visually hidden */}
                  {hasExpandableContent(item) && (
                    <div
                      className={expandedNewsIds.has(item.id) ? "" : "sr-only"}
                      aria-hidden={!expandedNewsIds.has(item.id)}
                    >
                      <div
                        className="mt-3 pt-3 border-t text-sm text-secondary"
                        style={{ borderColor: "var(--border-secondary)" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="whitespace-pre-wrap">
                          {newsContents.get(item.id) || item.content || ""}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3">
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

                  {/* Expand/Collapse button - only show if there's content */}
                  {hasExpandableContent(item) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(item.id);
                      }}
                      className="mt-3 w-full text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                      style={{
                        background: "var(--bg-overlay)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {expandedNewsIds.has(item.id) ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                          Show Less
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                          Read More
                        </span>
                      )}
                    </button>
                  )}
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
