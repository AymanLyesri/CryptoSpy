import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Webpack configuration for Chart.js optimization
  webpack: (config, { isServer }) => {
    // Don't include chart.js in server bundles to prevent SSR issues
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        "chart.js",
        "react-chartjs-2",
      ];
    }

    // Add fallbacks for Node.js modules that Chart.js might use
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      encoding: false,
    };

    return config;
  },

  // Output configuration for better performance
  output: "standalone",

  // Enable static optimization
  trailingSlash: false,

  // Enable gzip compression
  compress: true,

  // Power by header removal for security
  poweredByHeader: false,

  // SEO and Performance Headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
          },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Content-Type",
            value: "application/xml",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=3600",
          },
        ],
      },
      {
        source: "/robots.txt",
        headers: [
          {
            key: "Content-Type",
            value: "text/plain",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=86400, s-maxage=86400",
          },
        ],
      },
      {
        source: "/(.*\\.(?:js|css|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2))",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Compress images and optimize assets
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.coingecko.com",
        port: "",
        pathname: "/coins/images/**",
      },
    ],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 31536000, // 1 year
  },
};

export default nextConfig;
