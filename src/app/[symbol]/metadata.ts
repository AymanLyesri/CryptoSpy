import { Metadata } from "next";
import { getCryptoBySymbol } from "../../services/coinGeckoApi";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ symbol: string }>;
}): Promise<Metadata> {
  const { symbol } = await params;

  try {
    const cryptoData = await getCryptoBySymbol(symbol.toUpperCase());

    if (!cryptoData) {
      return {
        title: "Cryptocurrency Not Found | Crypto Spy",
        description:
          "The requested cryptocurrency could not be found. Explore thousands of other cryptocurrencies on Crypto Spy.",
      };
    }

    const currentPrice = cryptoData.current_price?.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });

    const priceChange = cryptoData.price_change_percentage_24h;
    const changeText = priceChange
      ? `${priceChange > 0 ? "+" : ""}${priceChange.toFixed(2)}%`
      : "";

    const title = `${
      cryptoData.name
    } (${cryptoData.symbol?.toUpperCase()}) Price - ${currentPrice} ${changeText}`;
    const description = `Live ${
      cryptoData.name
    } price: ${currentPrice}. ${changeText} in 24h. View real-time ${cryptoData.symbol?.toUpperCase()} charts, market cap, volume, and analysis on Crypto Spy.`;

    return {
      title,
      description,
      keywords: [
        cryptoData.name,
        cryptoData.symbol?.toUpperCase(),
        `${cryptoData.name} price`,
        `${cryptoData.symbol} price`,
        "cryptocurrency",
        "crypto price",
        "live price",
        "crypto chart",
        "market data",
        "blockchain",
      ],
      openGraph: {
        title,
        description,
        type: "website",
        url: `https://crypto-spy-app.vercel.app/${symbol.toLowerCase()}`,
        images: [
          {
            url: cryptoData.image || "/og-image.png",
            width: 1200,
            height: 630,
            alt: `${cryptoData.name} cryptocurrency logo and price chart`,
          },
        ],
        siteName: "Crypto Spy",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [cryptoData.image || "/og-image.png"],
      },
      alternates: {
        canonical: `https://crypto-spy-app.vercel.app/${symbol.toLowerCase()}`,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: `${symbol.toUpperCase()} Cryptocurrency Price | Crypto Spy`,
      description: `Get live ${symbol.toUpperCase()} price, charts, and market data. Track cryptocurrency prices in real-time with Crypto Spy.`,
    };
  }
}
