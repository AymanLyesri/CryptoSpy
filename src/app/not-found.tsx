"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          {/* 404 Icon */}
          <div className="mx-auto w-24 h-24 mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <span className="text-4xl">❌</span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Cryptocurrency Not Found
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            The cryptocurrency you're looking for doesn't exist or isn't
            supported yet.
          </p>

          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Make sure you're using the correct cryptocurrency symbol (e.g., btc,
            eth, ada).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            ← Back to Home
          </Link>

          <div className="text-gray-500 dark:text-gray-400 text-sm">
            or try searching for:
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {["btc", "eth", "ada", "dot", "sol"].map((symbol) => (
              <Link
                key={symbol}
                href={`/${symbol}`}
                className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                {symbol.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
