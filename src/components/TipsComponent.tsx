"use client";

import { useState, useEffect } from "react";
import { unifiedStyles } from "@/utils/themeUtils";

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
      icon: "DCA",
    },
    {
      id: 2,
      title: "Understand Market Cap vs Price",
      description:
        "A $1 coin isn't 'cheaper' than a $100 coin. Market cap = price × supply. Focus on market cap potential, not just unit price.",
      icon: "CAP",
    },
    {
      id: 3,
      title: "Secure Your Private Keys",
      description:
        "Not your keys, not your crypto. Use hardware wallets for large amounts and never share your seed phrase. Write it down offline.",
      icon: "SEC",
    },
    {
      id: 4,
      title: "Read the Whitepaper",
      description:
        "Before investing, understand the project's technology, use case, and tokenomics. Look for real-world problems being solved.",
      icon: "WP",
    },
    {
      id: 5,
      title: "Beware of FOMO and FUD",
      description:
        "Fear of Missing Out and Fear, Uncertainty, Doubt drive irrational decisions. Stick to your strategy and ignore market noise.",
      icon: "FUD",
    },
    {
      id: 6,
      title: "Tax Planning Matters",
      description:
        "Keep detailed records of all transactions. Many countries tax crypto gains. Consider tax-loss harvesting and long-term holdings.",
      icon: "TAX",
    },
    {
      id: 7,
      title: "Avoid Leverage as Beginner",
      description:
        "Leveraged trading amplifies both gains and losses. 90% of leveraged traders lose money. Master spot trading first.",
      icon: "LEV",
    },
    {
      id: 8,
      title: "Follow the Technology",
      description:
        "Invest in blockchains with active development, growing ecosystems, and real adoption. Check GitHub activity and partnerships.",
      icon: "TECH",
    },
    {
      id: 9,
      title: "Portfolio Allocation Rule",
      description:
        "Never invest more than you can afford to lose. Consider the 5-10% rule: only allocate 5-10% of net worth to high-risk crypto.",
      icon: "PORT",
    },
    {
      id: 10,
      title: "Learn On-Chain Analysis",
      description:
        "Study wallet movements, exchange flows, and network metrics. On-chain data often predicts price movements before technical analysis.",
      icon: "CHAIN",
    },
    {
      id: 11,
      title: "Staking vs Trading",
      description:
        "Consider staking stable, established coins for passive income. Often safer than active trading with better risk-adjusted returns.",
      icon: "STAKE",
    },
    {
      id: 12,
      title: "Recognize Common Scams",
      description:
        "Watch for fake giveaways, phishing sites, rug pulls, and 'get rich quick' schemes. If it sounds too good to be true, it is.",
      icon: "SCAM",
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
    <section id="tips-section" className={`unified-card ${className}`}>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <h2
            className="text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h2>
        </div>

        <div className="space-y-4">
          <div className="unified-card !p-4">
            <div className="flex items-start space-x-3">
              <span
                className="px-2 py-1 text-xs font-semibold rounded"
                style={{
                  background: "var(--color-primary)",
                  color: "var(--text-inverted)",
                }}
              >
                {tips[currentTipIndex].icon}
              </span>
              <div>
                <h3
                  className="font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  {tips[currentTipIndex].title}
                </h3>
                <p className="text-sm text-secondary">
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
                className="h-2 rounded-full"
                style={{
                  width: index === currentTipIndex ? "1.5rem" : "0.5rem",
                  background:
                    index === currentTipIndex
                      ? "var(--color-primary)"
                      : "var(--border-secondary)",
                  transition: "var(--transition-base)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
