import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://crypto-spy-app.vercel.app"),
  title: {
    default: "Crypto Spy - Live Cryptocurrency Data & Analysis",
    template: "%s | Crypto Spy",
  },
  description:
    "Real-time cryptocurrency prices, charts, and market analysis. Track Bitcoin, Ethereum, and thousands of other cryptocurrencies with live data, interactive charts, and comprehensive market insights.",
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
  authors: [{ name: "Crypto Spy Team" }],
  creator: "Crypto Spy",
  publisher: "Crypto Spy",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://crypto-spy-app.vercel.app",
    title: "Crypto Spy - Live Cryptocurrency Data & Analysis",
    description:
      "Real-time cryptocurrency prices, charts, and market analysis. Track Bitcoin, Ethereum, and thousands of other cryptocurrencies.",
    siteName: "Crypto Spy",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Crypto Spy - Live Cryptocurrency Data",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Crypto Spy - Live Cryptocurrency Data & Analysis",
    description:
      "Real-time cryptocurrency prices, charts, and market analysis. Track Bitcoin, Ethereum, and thousands of other cryptocurrencies.",
    creator: "@CryptoSpy",
    images: ["/og-image.png"],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: "https://crypto-spy-app.vercel.app",
  },
  category: "finance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Crypto Spy",
    url: "https://crypto-spy-app.vercel.app",
    description:
      "Real-time cryptocurrency prices, charts, and market analysis platform",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://crypto-spy-app.vercel.app/{search_term_string}",
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "Crypto Spy",
      url: "https://crypto-spy-app.vercel.app",
    },
    mainEntity: {
      "@type": "Service",
      name: "Cryptocurrency Data Analysis",
      serviceType: "Financial Data Service",
      provider: {
        "@type": "Organization",
        name: "Crypto Spy",
      },
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="canonical" href="https://crypto-spy-app.vercel.app" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />

        <Script id="theme-script">
          {`
  try {
    const saved = localStorage.getItem('theme');
    const prefersDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (prefersDark) document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme-ready', 'true');
  } catch(e){}
`}
        </Script>

        <meta name="google-adsense-account" content="ca-pub-8579370544297692" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8579370544297692"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
