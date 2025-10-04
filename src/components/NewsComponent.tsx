"use client";

import { Cryptocurrency } from "../types/crypto";

interface NewsComponentProps {
  isDarkMode?: boolean;
  title?: string;
  className?: string;
  selectedCrypto?: Cryptocurrency | null;
}

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  time: string;
  category: string;
}

export default function NewsComponent({
  isDarkMode = false,
  title = "Latest News",
  className = "",
  selectedCrypto = null,
}: NewsComponentProps) {
  // Function to generate coin-specific news
  const generateCoinSpecificNews = (crypto: Cryptocurrency): NewsItem[] => {
    const coinName = crypto.name;
    const coinSymbol = crypto.symbol.toUpperCase();
    const priceChange = crypto.price_change_percentage_24h || 0;
    const isPositive = priceChange > 0;

    return [
      {
        id: 1,
        title: `${coinName} (${coinSymbol}) ${
          isPositive ? "Surges" : "Dips"
        } ${Math.abs(priceChange).toFixed(1)}% in 24 Hours`,
        summary: `${coinName} shows ${
          isPositive ? "strong bullish momentum" : "bearish pressure"
        } as trading volume increases across major exchanges...`,
        time: "1 hour ago",
        category: "Market",
      },
      {
        id: 2,
        title: `Technical Analysis: ${coinName} Price Action`,
        summary: `Latest charts show ${coinName} testing key support/resistance levels with potential for ${
          isPositive ? "further upside" : "consolidation"
        }...`,
        time: "3 hours ago",
        category: "Analysis",
      },
      {
        id: 3,
        title: `${coinName} Network Activity Reaches New Milestone`,
        summary: `On-chain metrics for ${coinName} show increasing network usage and transaction volume, indicating growing adoption...`,
        time: "6 hours ago",
        category: "Technology",
      },
      {
        id: 4,
        title: `Institutional Interest in ${coinName} Grows`,
        summary: `Major investment firms are showing increased interest in ${coinName} as part of their digital asset portfolios...`,
        time: "12 hours ago",
        category: "Institutional",
      },
      {
        id: 5,
        title: `${coinName} Developer Activity Update`,
        summary: `Recent commits and updates to the ${coinName} protocol show continued development and improvement efforts...`,
        time: "1 day ago",
        category: "Development",
      },
      {
        id: 6,
        title: `Market Correlation: ${coinName} vs Bitcoin`,
        summary: `Analysis shows ${coinName} correlation with Bitcoin and its position in the broader cryptocurrency market...`,
        time: "2 days ago",
        category: "Market",
      },
    ];
  };

  // Sample general news data
  const news: NewsItem[] = [
    {
      id: 1,
      title: "Bitcoin Reaches New All-Time High",
      summary: "BTC surpasses previous records amid institutional adoption...",
      time: "2 hours ago",
      category: "Market",
    },
    {
      id: 2,
      title: "Ethereum 2.0 Staking Rewards Increase",
      summary: "Validators seeing higher returns as network activity grows...",
      time: "4 hours ago",
      category: "Technology",
    },
    {
      id: 3,
      title: "New DeFi Protocol Launches",
      summary: "Revolutionary lending platform promises better yields...",
      time: "6 hours ago",
      category: "DeFi",
    },
    {
      id: 4,
      title: "Regulatory Update: Crypto Guidelines",
      summary: "Government releases new framework for digital assets...",
      time: "1 day ago",
      category: "Regulation",
    },
    {
      id: 5,
      title: "Major Exchange Adds New Altcoin",
      summary: "Popular trading platform expands cryptocurrency offerings...",
      time: "2 days ago",
      category: "Market",
    },
    {
      id: 6,
      title: "Smart Contract Security Audit Released",
      summary: "New findings reveal best practices for DeFi development...",
      time: "3 days ago",
      category: "Technology",
    },
  ];

  // Use coin-specific news if a crypto is selected, otherwise use general news
  const newsToShow = selectedCrypto
    ? generateCoinSpecificNews(selectedCrypto)
    : news;

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "market":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "technology":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "defi":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "regulation":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "analysis":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300";
      case "institutional":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
      case "development":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div
      className={`rounded-xl border backdrop-blur-md transition-all duration-300 ${
        isDarkMode
          ? "bg-gray-800/50 border-gray-700"
          : "bg-white/50 border-gray-200"
      } ${className}`}
      style={{
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="p-6">
        <div className="flex items-center mb-6">
          <span className="text-2xl mr-3">📰</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
        </div>

        <div className="space-y-4">
          {newsToShow.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                isDarkMode
                  ? "bg-gray-700/30 border-gray-600 hover:bg-gray-700/50"
                  : "bg-white/30 border-gray-200 hover:bg-white/60"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(
                    item.category
                  )}`}
                >
                  {item.category}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {item.time}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {item.summary}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
