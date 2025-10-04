"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { PriceDataPoint, TimeRange } from "../types/chartData";
import ChartWrapper from "./ChartWrapper";

// Dynamically import Chart.js components to avoid SSR issues
const Line = dynamic(() => import("react-chartjs-2").then((mod) => mod.Line), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-80">
      <div className="animate-pulse text-gray-500 dark:text-gray-400">
        Loading chart...
      </div>
    </div>
  ),
});

// Dynamically register Chart.js components
let ChartJS: any = null;
const registerChartComponents = async () => {
  if (typeof window !== "undefined" && !ChartJS) {
    try {
      const {
        Chart,
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend,
        Filler,
      } = await import("chart.js");

      Chart.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend,
        Filler
      );

      // Set default Chart.js options to prevent DOM access issues
      Chart.defaults.responsive = true;
      Chart.defaults.maintainAspectRatio = false;

      ChartJS = Chart;
    } catch (error) {
      console.error("Failed to register Chart.js components:", error);
    }
  }
};

interface CryptoPriceChartProps {
  data: PriceDataPoint[];
  timeRange: TimeRange;
  cryptoName: string;
  cryptoSymbol: string;
  currentPrice: number;
}

export default function CryptoPriceChart({
  data,
  timeRange,
  cryptoName,
  cryptoSymbol,
  currentPrice,
}: CryptoPriceChartProps) {
  const chartRef = useRef<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [chartReady, setChartReady] = useState(false);

  // Handle component mounting and Chart.js registration
  useEffect(() => {
    const initializeChart = async () => {
      if (typeof window !== "undefined") {
        try {
          await registerChartComponents();
          setIsMounted(true);
          // Add a small delay to ensure DOM is ready
          setTimeout(() => {
            setChartReady(true);
          }, 100);
        } catch (error) {
          console.error("Chart initialization error:", error);
          setIsMounted(true);
          setChartReady(false);
        }
      }
    };

    initializeChart();

    return () => {
      setIsMounted(false);
      setChartReady(false);
    };
  }, []);

  // Force chart re-render when timeRange changes
  useEffect(() => {
    // No need to manually destroy chart - react-chartjs-2 handles this
    // The key prop change will force a complete re-render
  }, [timeRange, isMounted, chartReady]);

  // Detect theme changes - only run on client side
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    };

    checkTheme();

    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [isMounted]);

  // Early return if not mounted or chart not ready (prevents SSR issues)
  if (!isMounted || !chartReady) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300">
        <div className="text-center py-12">
          <div className="animate-pulse">
            <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
              Loading chart...
            </div>
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  // Early return if no valid data
  if (!data || data.length === 0) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300">
        <div className="text-center py-12">
          <div className="animate-pulse">
            <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
              Loading chart data...
            </div>
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  // Filter out invalid data points
  const validData = data.filter(
    (point) =>
      point &&
      typeof point.timestamp === "number" &&
      typeof point.price === "number" &&
      point.price > 0 &&
      !isNaN(point.price) &&
      !isNaN(point.timestamp)
  );

  if (validData.length === 0) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300">
        <div className="text-center py-12">
          <div className="text-red-500 dark:text-red-400 text-lg mb-4">
            Invalid chart data
          </div>
          <div className="text-gray-400 dark:text-gray-500 text-sm">
            Price data contains invalid values
          </div>
        </div>
      </div>
    );
  }

  // Theme-aware color functions
  const getColors = () => {
    if (isDarkMode) {
      return {
        positive: "#10b981", // emerald-500
        negative: "#ef4444", // red-500
        positiveLight: "rgba(16, 185, 129, 0.2)",
        negativeLight: "rgba(239, 68, 68, 0.2)",
        textPrimary: "#f9fafb", // gray-50
        textSecondary: "#d1d5db", // gray-300
        gridColor: "rgba(209, 213, 219, 0.1)",
        tooltipBg: "rgba(17, 24, 39, 0.95)", // gray-900 with opacity
        tooltipBorder: "#374151", // gray-700
      };
    } else {
      return {
        positive: "#059669", // emerald-600
        negative: "#dc2626", // red-600
        positiveLight: "rgba(5, 150, 105, 0.15)",
        negativeLight: "rgba(220, 38, 38, 0.15)",
        textPrimary: "#1f2937", // gray-800
        textSecondary: "#6b7280", // gray-500
        gridColor: "rgba(107, 114, 128, 0.2)",
        tooltipBg: "rgba(255, 255, 255, 0.95)",
        tooltipBorder: "#e5e7eb", // gray-200
      };
    }
  };

  const colors = getColors();

  // Format timestamp based on time range
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);

    switch (timeRange) {
      case "hourly":
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
      case "daily":
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      case "weekly":
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "2-digit",
        });
      case "monthly":
        return date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
      default:
        return date.toLocaleDateString();
    }
  };

  // Format price for display
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: price < 1 ? 4 : 2,
      maximumFractionDigits: price < 1 ? 4 : 2,
    }).format(price);
  };

  // Calculate price change using valid data
  const priceChange =
    validData.length > 1
      ? ((validData[validData.length - 1].price - validData[0].price) /
          validData[0].price) *
        100
      : 0;

  const isPositiveChange = priceChange >= 0;

  // Prepare chart data with theme-aware colors using valid data
  const chartData = {
    labels: validData.map((point) => formatTimestamp(point.timestamp)),
    datasets: [
      {
        label: `${cryptoName} Price`,
        data: validData.map((point) => point.price),
        borderColor: isPositiveChange ? colors.positive : colors.negative,
        backgroundColor: isPositiveChange
          ? colors.positiveLight
          : colors.negativeLight,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: isPositiveChange
          ? colors.positive
          : colors.negative,
        pointHoverBorderColor: isDarkMode ? "#1f2937" : "#ffffff",
        pointHoverBorderWidth: 3,
        pointBorderWidth: 0,
      },
    ],
  };

  // Chart options with theme-aware styling
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    // Add resize observer configuration to prevent null reference errors
    resizeDelay: 50,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    animation: {
      duration: 750,
      easing: "easeInOutQuart" as const,
    },
    // Prevent Chart.js from trying to access DOM during SSR
    onResize: (chart: any, size: any) => {
      if (typeof window === "undefined" || !chart.canvas) return;
      try {
        chart.resize();
      } catch (error) {
        console.warn("Chart resize error:", error);
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: colors.tooltipBg,
        titleColor: colors.textPrimary,
        bodyColor: colors.textPrimary,
        borderColor: colors.tooltipBorder,
        borderWidth: 1,
        displayColors: false,
        cornerRadius: 12,
        padding: 12,
        titleFont: {
          size: 14,
          weight: "bold" as const,
        },
        bodyFont: {
          size: 13,
          weight: "normal" as const,
        },
        callbacks: {
          title: function (context: any) {
            const dataIndex = context[0].dataIndex;
            const timestamp = validData[dataIndex].timestamp;
            return new Date(timestamp).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
          },
          label: function (context: any) {
            return `Price: ${formatPrice(context.parsed.y)}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: colors.textSecondary,
          font: {
            size: 12,
            weight: "normal" as const,
          },
          maxTicksLimit: timeRange === "hourly" ? 6 : 8,
          padding: 8,
        },
      },
      y: {
        display: true,
        position: "right" as const,
        grid: {
          color: colors.gridColor,
          lineWidth: 1,
        },
        border: {
          display: false,
        },
        ticks: {
          color: colors.textSecondary,
          font: {
            size: 12,
            weight: "normal" as const,
          },
          padding: 12,
          callback: function (value: any) {
            return formatPrice(value);
          },
        },
      },
    },
    elements: {
      point: {
        hoverRadius: 10,
        hitRadius: 15,
      },
    },
  };

  return (
    <div
      style={{
        padding: "var(--spacing-section)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
      }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div className="text-center sm:text-left">
          <h3 className="text-heading">
            {cryptoName}{" "}
            <span className="text-muted text-lg">
              ({cryptoSymbol.toUpperCase()})
            </span>
          </h3>
          <div className="flex items-center justify-center sm:justify-start space-x-4 mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {formatPrice(currentPrice)}
            </span>
            <span
              className={`text-sm sm:text-lg font-medium px-3 py-1 rounded-full transition-all duration-300 ${
                isPositiveChange
                  ? "text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30"
                  : "text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30"
              }`}
            >
              {isPositiveChange ? "+" : ""}
              {priceChange.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="text-center sm:text-right">
          <div
            className={`text-sm font-medium mb-1 px-3 py-1 rounded-full transition-colors duration-300 ${
              isDarkMode
                ? "text-blue-400 bg-blue-900/30"
                : "text-blue-600 bg-blue-100"
            }`}
          >
            {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} Chart
          </div>
          <div className="text-muted">{validData.length} data points</div>
        </div>
      </div>

      <div
        style={{ borderRadius: "var(--radius-card)" }}
        className="h-80 relative overflow-hidden"
      >
        <ChartWrapper>
          {isMounted && chartReady ? (
            <Line
              ref={chartRef}
              data={chartData}
              options={options}
              key={`chart-${timeRange}-${validData.length}-${isDarkMode}`}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse text-gray-500 dark:text-gray-400">
                Initializing chart...
              </div>
            </div>
          )}
        </ChartWrapper>
      </div>

      {/* Chart Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div
          style={{
            padding: "var(--spacing-card)",
            borderRadius: "var(--radius-card)",
          }}
          className="text-center bg-gray-50/50 dark:bg-gray-700/30"
        >
          <div className="text-label mb-1 uppercase tracking-wider">High</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {formatPrice(Math.max(...validData.map((d) => d.price)))}
          </div>
        </div>
        <div
          style={{
            padding: "var(--spacing-card)",
            borderRadius: "var(--radius-card)",
          }}
          className="text-center bg-gray-50/50 dark:bg-gray-700/30"
        >
          <div className="text-label mb-1 uppercase tracking-wider">Low</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {formatPrice(Math.min(...validData.map((d) => d.price)))}
          </div>
        </div>
        <div
          style={{
            padding: "var(--spacing-card)",
            borderRadius: "var(--radius-card)",
          }}
          className="text-center bg-gray-50/50 dark:bg-gray-700/30"
        >
          <div className="text-label mb-1 uppercase tracking-wider">First</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {formatPrice(validData[0]?.price || 0)}
          </div>
        </div>
        <div
          style={{
            padding: "var(--spacing-card)",
            borderRadius: "var(--radius-card)",
          }}
          className="text-center bg-gray-50/50 dark:bg-gray-700/30"
        >
          <div className="text-label mb-1 uppercase tracking-wider">Latest</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {formatPrice(validData[validData.length - 1]?.price || 0)}
          </div>
        </div>
      </div>
    </div>
  );
}
