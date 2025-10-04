"use client";

import { useState, useEffect } from "react";

interface ChartWrapperProps {
  children: React.ReactNode;
}

export default function ChartWrapper({ children }: ChartWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Ensure we're on the client side before rendering charts
    setIsClient(true);
  }, []);

  // Prevent any chart rendering during SSR
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">
          Loading chart...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
