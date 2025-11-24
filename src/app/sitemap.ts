import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  // Top cryptocurrencies to include in sitemap
  const topCryptocurrencies = [
    "bitcoin",
    "ethereum",
    "tether",
    "bnb",
    "solana",
    "usdc",
    "xrp",
    "dogecoin",
    "cardano",
    "avalanche",
    "tron",
    "chainlink",
    "polkadot",
    "polygon",
    "litecoin",
    "near",
    "uniswap",
    "bitcoin-cash",
    "stellar",
    "cosmos",
  ];

  const baseUrl = "https://crypto-spy-app.vercel.app";

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "always" as const,
      priority: 1,
    },
  ];

  // Cryptocurrency pages
  const cryptoPages = topCryptocurrencies.map((symbol) => ({
    url: `${baseUrl}/${symbol}`,
    lastModified: new Date(),
    changeFrequency: "hourly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...cryptoPages];
}
