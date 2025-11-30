"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  Search,
  BarChart3,
  Sparkles,
} from "lucide-react";

export default function LandingHero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      id="landing-hero"
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
    >
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 dark:bg-white/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 dark:bg-zinc-400/5 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/5 dark:bg-white/3 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div
          className={`transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm mb-8"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
            }}
          >
            <TrendingUp
              className="w-4 h-4"
              style={{ color: "var(--color-primary)" }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Real-time Crypto Tracking
            </span>
          </div>

          {/* Heading */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Track Crypto
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(to right, var(--color-primary), var(--color-primary))",
              }}
            >
              Like a Pro
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
            Monitor real-time prices, analyze market trends, and stay ahead of
            the crypto market with our sleek and intuitive platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={() =>
                document
                  .getElementById("popular-crypto")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="unified-button--primary group px-8 py-4 rounded-xl font-semibold shadow-lg flex items-center gap-2"
            >
              Get Started
              <ArrowRight
                className="w-5 h-5 group-hover:translate-x-1"
                style={{ transition: "var(--transition-base)" }}
              />
            </button>
            <button
              onClick={() => {
                // Scroll to top to reveal navbar
                window.scrollTo({ top: 0, behavior: "smooth" });
                // Focus search after a short delay to ensure navbar is visible
                setTimeout(() => {
                  const searchInput = document.querySelector<HTMLInputElement>(
                    "#crypto-search input"
                  );
                  searchInput?.focus();
                }, 300);
              }}
              className="unified-button--secondary px-8 py-4 rounded-xl font-semibold shadow-lg flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search Coins
            </button>
            <button
              onClick={() => {
                // Click the AI chat button to open it
                const aiChatButton =
                  document.querySelector<HTMLButtonElement>(".ai-chat-button");
                aiChatButton?.click();
              }}
              className="unified-button--secondary px-8 py-4 rounded-xl font-semibold shadow-lg flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              AI Assistant
            </button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="unified-card group p-6">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110"
                style={{
                  background: "var(--bg-overlay)",
                  transition: "var(--transition-base)",
                }}
              >
                <TrendingUp
                  className="w-6 h-6"
                  style={{ color: "var(--color-primary)" }}
                />
              </div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Real-time Data
              </h3>
              <p className="text-sm text-secondary">
                Live cryptocurrency prices updated every second
              </p>
            </div>

            <div className="unified-card group p-6">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110"
                style={{
                  background: "var(--bg-overlay)",
                  transition: "var(--transition-base)",
                }}
              >
                <BarChart3
                  className="w-6 h-6"
                  style={{ color: "var(--color-primary)" }}
                />
              </div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Advanced Charts
              </h3>
              <p className="text-sm text-secondary">
                Interactive charts with multiple timeframes
              </p>
            </div>

            <div className="unified-card group p-6">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110"
                style={{
                  background: "var(--bg-overlay)",
                  transition: "var(--transition-base)",
                }}
              >
                <Search
                  className="w-6 h-6"
                  style={{ color: "var(--color-primary)" }}
                />
              </div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Smart Search
              </h3>
              <p className="text-sm text-secondary">
                Find any cryptocurrency instantly
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div
          className="w-6 h-10 rounded-full flex items-start justify-center p-2"
          style={{
            border: "2px solid var(--border-secondary)",
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full animate-scroll"
            style={{ background: "var(--text-muted)" }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-30px);
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes scroll {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          40% {
            opacity: 1;
          }
          80% {
            transform: translateY(1rem);
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-scroll {
          animation: scroll 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
