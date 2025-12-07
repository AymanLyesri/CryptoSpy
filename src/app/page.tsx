"use client";

import { useState, useEffect } from "react";
import ToastContainer from "../components/ToastContainer";
import Navbar from "../components/Navbar";
import { useCryptoData } from "../hooks/useCryptoData";
import { useToast } from "../hooks/useToast";
import ApiStatusIndicator from "../components/ApiStatusIndicator";
import Script from "next/script";
import PopularCrypto from "@/components/PopularCrypto";
import LandingHero from "@/components/LandingHero";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const { isUsingFallbackData, popularError } = useCryptoData();

  const { toasts, showToast, removeToast } = useToast();

  // Homepage structured data
  const homepageStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Crypto Spy",
    url: "https://crypto-spy-app.vercel.app",
    description:
      "Real-time cryptocurrency prices, charts, and market analysis platform",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1000",
      bestRating: "5",
      worstRating: "1",
    },
    featureList: [
      "Real-time cryptocurrency prices",
      "Interactive price charts",
      "Market cap rankings",
      "24h price changes",
      "Cryptocurrency search",
      "Multi-currency support",
    ],
  };

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      <Script
        id="homepage-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homepageStructuredData),
        }}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Single Navbar - Fixed at top with scroll transitions */}
      <Navbar />

      {/* Landing Hero - Full viewport height */}
      <LandingHero />

      {/* Main Content - Popular Cryptos */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <PopularCrypto isDarkMode={isDarkMode} />
        </div>
      </main>
      {/* <ApiStatusIndicator /> */}
    </div>
  );
}
