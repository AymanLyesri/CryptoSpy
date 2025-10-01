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
  },
};

export default nextConfig;
