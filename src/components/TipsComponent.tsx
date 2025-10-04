"use client";

import { useState, useEffect } from "react";

interface TipsComponentProps {
  isDarkMode?: boolean;
  title?: string;
  className?: string;
}

interface TipItem {
  id: number;
  title: string;
  description: string;
  icon: string;
}

export default function TipsComponent({
  isDarkMode = false,
  title = "Crypto Tips",
  className = "",
}: TipsComponentProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // Enhanced crypto tips with practical advice
  const tips: TipItem[] = [
    {
      id: 1,
      title: "Dollar-Cost Averaging (DCA)",
      description:
        "Invest fixed amounts regularly regardless of price. This strategy reduces the impact of volatility and removes emotion from timing decisions.",
      icon: "📊",
    },
    {
      id: 2,
      title: "Understand Market Cap vs Price",
      description:
        "A $1 coin isn't 'cheaper' than a $100 coin. Market cap = price × supply. Focus on market cap potential, not just unit price.",
      icon: "🧮",
    },
    {
      id: 3,
      title: "Secure Your Private Keys",
      description:
        "Not your keys, not your crypto. Use hardware wallets for large amounts and never share your seed phrase. Write it down offline.",
      icon: "🔐",
    },
    {
      id: 4,
      title: "Read the Whitepaper",
      description:
        "Before investing, understand the project's technology, use case, and tokenomics. Look for real-world problems being solved.",
      icon: "📖",
    },
    {
      id: 5,
      title: "Beware of FOMO and FUD",
      description:
        "Fear of Missing Out and Fear, Uncertainty, Doubt drive irrational decisions. Stick to your strategy and ignore market noise.",
      icon: "🧠",
    },
    {
      id: 6,
      title: "Tax Planning Matters",
      description:
        "Keep detailed records of all transactions. Many countries tax crypto gains. Consider tax-loss harvesting and long-term holdings.",
      icon: "📋",
    },
    {
      id: 7,
      title: "Avoid Leverage as Beginner",
      description:
        "Leveraged trading amplifies both gains and losses. 90% of leveraged traders lose money. Master spot trading first.",
      icon: "⚠️",
    },
    {
      id: 8,
      title: "Follow the Technology",
      description:
        "Invest in blockchains with active development, growing ecosystems, and real adoption. Check GitHub activity and partnerships.",
      icon: "💻",
    },
    {
      id: 9,
      title: "Portfolio Allocation Rule",
      description:
        "Never invest more than you can afford to lose. Consider the 5-10% rule: only allocate 5-10% of net worth to high-risk crypto.",
      icon: "⚖️",
    },
    {
      id: 10,
      title: "Learn On-Chain Analysis",
      description:
        "Study wallet movements, exchange flows, and network metrics. On-chain data often predicts price movements before technical analysis.",
      icon: "🔍",
    },
    {
      id: 11,
      title: "Staking vs Trading",
      description:
        "Consider staking stable, established coins for passive income. Often safer than active trading with better risk-adjusted returns.",
      icon: "🏦",
    },
    {
      id: 12,
      title: "Recognize Common Scams",
      description:
        "Watch for fake giveaways, phishing sites, rug pulls, and 'get rich quick' schemes. If it sounds too good to be true, it is.",
      icon: "🚨",
    },
  ];

  // Rotate tips every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [tips.length]);

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
          <span className="text-2xl mr-3">💡</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
        </div>

        <div className="space-y-4">
          <div
            className={`p-4 rounded-lg border transition-all duration-500 ${
              isDarkMode
                ? "bg-gray-700/30 border-gray-600"
                : "bg-blue-50/50 border-blue-200"
            }`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{tips[currentTipIndex].icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {tips[currentTipIndex].title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tips[currentTipIndex].description}
                </p>
              </div>
            </div>
          </div>

          {/* Tip navigation dots */}
          <div className="flex justify-center space-x-2">
            {tips.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTipIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentTipIndex
                    ? "bg-blue-500 w-6"
                    : isDarkMode
                    ? "bg-gray-600"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
