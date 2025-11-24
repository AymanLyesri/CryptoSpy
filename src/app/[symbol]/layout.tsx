import { Metadata } from "next";
import { getCryptoBySymbol } from "../../services/coinGeckoApi";

interface CryptoLayoutProps {
  children: React.ReactNode;
  params: Promise<{ symbol: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ symbol: string }>;
}): Promise<Metadata> {
  const { symbol } = await params;

  try {
    const crypto = await getCryptoBySymbol(symbol.toLowerCase());

    if (crypto) {
      return {
        title: `${crypto.name} (${crypto.symbol}) - Live Price & Chart | Crypto Spy`,
        description: `Get real-time ${
          crypto.name
        } price, market cap, volume, and historical charts. Current price: $${crypto.current_price.toLocaleString()}`,
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  // Fallback metadata
  return {
    title: `${symbol.toUpperCase()} - Cryptocurrency Data | Crypto Spy`,
    description: `Live ${symbol.toUpperCase()} cryptocurrency price, charts, and market analysis.`,
  };
}

export default function CryptoLayout({ children }: CryptoLayoutProps) {
  return <>{children}</>;
}
