import { Metadata } from "next";

interface SeoMetadataProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  keywords?: string[];
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
}

export function generateSeoMetadata({
  title,
  description,
  url,
  image = "/og-image.png",
  keywords = [],
  type = "website",
  publishedTime,
  modifiedTime,
  noIndex = false,
}: SeoMetadataProps): Metadata {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://crypto-spy-app.vercel.app";
  const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;
  const imageUrl = image.startsWith("http") ? image : `${baseUrl}${image}`;

  return {
    title,
    description,
    keywords,
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
    openGraph: {
      type,
      url: fullUrl,
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: "Crypto Spy",
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
      creator: "@CryptoSpy",
    },
    alternates: {
      canonical: fullUrl,
    },
  };
}

export const defaultSeoConfig = {
  siteName: "Crypto Spy",
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL || "https://crypto-spy-app.vercel.app",
  description: "Real-time cryptocurrency prices, charts, and market analysis",
  keywords: [
    "cryptocurrency",
    "crypto prices",
    "bitcoin",
    "ethereum",
    "crypto charts",
    "real-time crypto data",
    "cryptocurrency analysis",
    "crypto market",
    "digital currency",
    "blockchain",
  ],
};
