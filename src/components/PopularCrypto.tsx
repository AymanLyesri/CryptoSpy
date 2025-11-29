"use client";

import { Cryptocurrency } from "../types/crypto";
import { useCryptoData } from "../hooks/useCryptoData";
import NewsComponent from "./NewsComponent";
import TipsComponent from "./TipsComponent";
import CryptoCard from "./CryptoCard";
import CryptoCardSkeleton from "./CryptoCardSkeleton";

interface LandingComponentProps {
  isDarkMode?: boolean;
}

export default function PopularCrypto({
  isDarkMode = false,
}: LandingComponentProps) {
  const { popularCryptos, isLoadingPopular } = useCryptoData();

  return (
    <section className="mt-8 space-y-8">
      {/* Popular Coins Section */}
      <div className="unified-card">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <h2
              className="text-xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Popular Cryptocurrencies
            </h2>
          </div>

          {isLoadingPopular ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3">
              {[...Array(6)].map((_, i) => (
                <CryptoCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3">
              {popularCryptos.slice(0, 6).map((crypto: Cryptocurrency) => (
                <CryptoCard key={crypto.id} crypto={crypto} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tips and News Container */}
      <div className="space-y-8">
        {/* Tips Section */}
        <TipsComponent isDarkMode={isDarkMode} />

        {/* News Section */}
        <NewsComponent isDarkMode={isDarkMode} />
      </div>
    </section>
  );
}
