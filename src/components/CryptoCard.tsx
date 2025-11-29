"use client";

import { Cryptocurrency } from "@/types/crypto";
import { formatters } from "@/utils/themeUtils";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface CryptoCardProps {
  crypto: Cryptocurrency;
  onClick?: (crypto: Cryptocurrency) => void;
  className?: string;
}

export default function CryptoCard({
  crypto,
  onClick,
  className = "",
}: CryptoCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick(crypto);
    } else {
      router.push(`/${crypto.symbol.toLowerCase()}`);
    }
  };

  const priceData = formatters.percentage(
    crypto.price_change_percentage_24h || 0
  );

  // Render 30D mini chart
  const renderMiniChart = () => {
    if (!crypto.sparkline_in_7d?.price) return null;

    const prices = crypto.sparkline_in_7d.price;
    const trend = prices[prices.length - 1] > prices[0] ? "up" : "down";
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);

    // Sample points to create 30D effect (take every 5th point for smoother look)
    const sampledPrices = prices.filter((_, idx) => idx % 5 === 0);

    return (
      <div className="flex items-end gap-0.5 h-8 w-20">
        {sampledPrices.map((price, idx) => {
          const heightPercent =
            ((price - minPrice) / (maxPrice - minPrice)) * 100 || 50;

          return (
            <div
              key={idx}
              className="flex-1 rounded-sm"
              style={{
                height: `${Math.max(heightPercent, 10)}%`,
                background:
                  trend === "up"
                    ? "var(--color-success)"
                    : "var(--color-error)",
                opacity: 0.6,
                transition: "var(--transition-fast)",
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div
      onClick={handleClick}
      className="unified-card !p-3 cursor-pointer"
      style={{
        transition: "all var(--transition-base)",
      }}
    >
      <div className="flex items-center gap-3">
        {/* Left: Icon + Name */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {crypto.image && !imageError ? (
            <img
              src={crypto.image}
              alt={crypto.name}
              className="w-8 h-8 rounded-full flex-shrink-0"
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                background: "var(--bg-overlay)",
                color: "var(--text-primary)",
              }}
            >
              {crypto.symbol.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div
              className="font-medium text-sm truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {crypto.name}
            </div>
            <div className="text-secondary text-xs uppercase">
              {crypto.symbol}
            </div>
          </div>
        </div>

        {/* Center: Mini Chart */}
        <div className="flex-shrink-0">{renderMiniChart()}</div>

        {/* Right: Price + Change */}
        <div className="text-right flex-shrink-0 min-w-[80px]">
          <div
            className="font-semibold text-sm"
            style={{ color: "var(--text-primary)" }}
          >
            {formatters.price(crypto.current_price)}
          </div>
          <div className={`text-xs font-medium ${priceData.className}`}>
            {priceData.formatted}
          </div>
        </div>
      </div>
    </div>
  );
}
