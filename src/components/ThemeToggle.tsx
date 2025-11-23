"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    setIsDark(html.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const html = document.documentElement;
    const current = html.classList.contains("dark"); // real current state

    if (current) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        borderRadius: "var(--radius-button)",
        boxShadow: "var(--shadow-card)",
      }}
      className="fixed top-2 right-2 z-50 group inline-flex items-center justify-center h-12 w-12 border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 hover:bg-white dark:hover:bg-gray-700 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-[var(--shadow-card-hover)] active:scale-95"
    >
      <div className="relative w-6 h-6">
        {/* Sun icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`absolute inset-0 w-6 h-6 transition-all duration-500 ease-in-out transform ${
            isDark
              ? "opacity-0 rotate-90 scale-75"
              : "opacity-100 rotate-0 scale-100"
          }`}
        >
          <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0 4a1 1 0 0 1-1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Zm0-18a1 1 0 0 1-1-1V2a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Zm10 8a1 1 0 0 1-1 1h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1ZM4 12a1 1 0 0 1-1 1H2a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1Zm14.95 6.364a1 1 0 0 1-1.414 1.414l-.707-.707a1 1 0 0 1 1.414-1.414l.707.707Zm-12.728 0 .707.707A1 1 0 1 1 5.515 21.9l-.707-.707A1 1 0 0 1 6.222 19.95ZM18.485 5.515a1 1 0 0 1 0 1.414l-.707.707A1 1 0 0 1 16.364 6.22l.707-.707a1 1 0 0 1 1.414 0ZM6.222 4.05a1 1 0 0 1 0 1.414l-.707.707A1 1 0 0 1 4.1 4.758l.707-.707A1 1 0 0 1 6.222 4.05Z" />
        </svg>

        {/* Moon icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`absolute inset-0 w-6 h-6 transition-all duration-500 ease-in-out transform ${
            isDark
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 -rotate-90 scale-75"
          }`}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79Z" />
        </svg>
      </div>
    </button>
  );
}
