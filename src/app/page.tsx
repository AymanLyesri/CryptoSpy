"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CryptoSearch from "../components/CryptoSearch";
import ToastContainer from "../components/ToastContainer";
import LandingComponent from "../components/LandingComponent";
import { Cryptocurrency } from "../types/crypto";
import { useCryptoData } from "../hooks/useCryptoData";
import { useToast } from "../hooks/useToast";
import ThemeToggle from "@/components/ThemeToggle";
import ApiStatusIndicator from "../components/ApiStatusIndicator";

export default function Home() {
  const router = useRouter();
  const [showStickySearch, setShowStickySearch] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const { isUsingFallbackData, popularError } = useCryptoData();

  const { toasts, showToast, removeToast } = useToast();

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

  // Handle sticky search bar visibility
  useEffect(() => {
    const handleScroll = () => {
      // Show sticky search when scrolled past 200px for a more seamless transition
      const scrollY = window.scrollY;
      setShowStickySearch(scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
    // Navigate to the crypto-specific page
    router.push(`/${crypto.symbol.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ThemeToggle />

      {/* Sticky Search Bar */}
      {showStickySearch && (
        <div
          style={{
            boxShadow: "var(--shadow-card-hover)",
          }}
          className="fixed top-0 left-0 right-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 py-2 px-4 sm:px-6 lg:px-8 transition-all duration-300 ease-out"
        >
          <div className="max-w-lg mx-auto">
            <CryptoSearch
              onSelect={handleCryptoSelect}
              placeholder="Search..."
              compact={true}
            />
          </div>
        </div>
      )}

      <div
        className={`max-w-7xl mx-auto transition-all duration-300 ${
          showStickySearch ? "pt-16" : ""
        }`}
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Crypto Spy 🕵️
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
            Search and discover cryptocurrency information
          </p>

          {/* Data Status Indicator */}
          <div className="flex justify-center mb-8">
            <div
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "var(--radius-button)",
                border: "1px solid",
              }}
              className={`inline-flex items-center text-sm font-medium transition-all duration-300 ${
                isUsingFallbackData
                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700"
                  : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  isUsingFallbackData
                    ? "bg-yellow-500 dark:bg-yellow-400"
                    : "bg-green-500 dark:bg-green-400"
                }`}
              ></div>
              <span>
                {isUsingFallbackData ? "Limited Data Mode" : "Live Data Active"}
              </span>
              {popularError && (
                <span className="ml-2 text-xs opacity-75">
                  •{" "}
                  {popularError.includes("401")
                    ? "API Auth Issue"
                    : popularError.includes("429")
                    ? "Rate Limited"
                    : "Connection Issue"}
                </span>
              )}
            </div>
          </div>

          {/* Search Component */}
          <div className="mb-8">
            <CryptoSearch onSelect={handleCryptoSelect} />
          </div>
        </div>

        {/* Landing Component - Show popular cryptos */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LandingComponent
            onCoinSelect={handleCryptoSelect}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
      <ApiStatusIndicator />
    </div>
  );
}
