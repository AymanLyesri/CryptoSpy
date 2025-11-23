"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { PriceDataPoint, TimeRange } from "../types/chartData";
import ChartWrapper from "./ChartWrapper";
import { formatters } from "../utils/themeUtils";

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

  // No need for complex theme detection - CSS variables handle this automatically

  // Early return if not mounted or chart not ready (prevents SSR issues)
  if (!isMounted || !chartReady) {
    return (
      <div className="unified-card">
        <div className="text-center py-12">
          <div className="loading-pulse">
            <div className="text-muted text-lg mb-4">Loading chart...</div>
            <div className="loading-spinner mx-auto mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  // Early return if no valid data
  if (!data || data.length === 0) {
    return (
      <div className="unified-card">
        <div className="text-center py-12">
          <div className="loading-pulse">
            <div className="text-muted text-lg mb-4">Loading chart data...</div>
            <div className="loading-spinner mx-auto mb-4"></div>
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
      <div className="unified-card">
        <div className="text-center py-12">
          <div className="trend-negative text-lg mb-4">Invalid chart data</div>
          <div className="text-muted text-sm">
            Price data contains invalid values
          </div>
        </div>
      </div>
    );
  }

  // Function to get actual CSS variable values at runtime
  const getCSSVariableValue = (variableName: string): string => {
    if (typeof window === "undefined") return "#000000"; // SSR fallback
    return (
      getComputedStyle(document.documentElement)
        .getPropertyValue(variableName)
        .trim() || "#000000"
    );
  };

  // Convert RGB color to RGBA with opacity
  const rgbToRgba = (rgb: string, opacity: number): string => {
    // Handle both "rgb(r, g, b)" and "#rrggbb" formats
    if (rgb.startsWith("rgb(")) {
      return rgb.replace("rgb(", "rgba(").replace(")", `, ${opacity})`);
    } else if (rgb.startsWith("#")) {
      // Convert hex to rgba
      const hex = rgb.replace("#", "");
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return `${rgb}${Math.round(opacity * 255)
      .toString(16)
      .padStart(2, "0")}`; // fallback for other formats
  };

  // Get actual resolved colors for Chart.js
  const getResolvedChartColors = () => {
    const successColor = getCSSVariableValue("--color-success-600");
    const errorColor = getCSSVariableValue("--color-error-600");

    return {
      positive: successColor,
      negative: errorColor,
      positiveLight: rgbToRgba(successColor, 0.1),
      negativeLight: rgbToRgba(errorColor, 0.1),
      textPrimary: getCSSVariableValue("--text-primary"),
      textSecondary: getCSSVariableValue("--text-secondary"),
      gridColor: getCSSVariableValue("--text-muted"),
      tooltipBg: getCSSVariableValue("--bg-card"),
      tooltipBorder: getCSSVariableValue("--border-primary"),
    };
  };

  const resolvedColors = getResolvedChartColors();

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

  // Use unified formatter from themeUtils
  const formatPrice = formatters.price;

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
        borderColor: isPositiveChange
          ? resolvedColors.positive
          : resolvedColors.negative,
        backgroundColor: isPositiveChange
          ? resolvedColors.positiveLight
          : resolvedColors.negativeLight,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: isPositiveChange
          ? resolvedColors.positive
          : resolvedColors.negative,
        pointHoverBorderColor: "var(--bg-card)",
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
        backgroundColor: resolvedColors.tooltipBg,
        titleColor: resolvedColors.textPrimary,
        bodyColor: resolvedColors.textPrimary,
        borderColor: resolvedColors.tooltipBorder,
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
          color: resolvedColors.textSecondary,
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
          color: resolvedColors.gridColor,
          lineWidth: 1,
        },
        border: {
          display: false,
        },
        ticks: {
          color: resolvedColors.textSecondary,
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
    <div className="unified-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div className="text-center sm:text-left">
          <h3
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{ color: resolvedColors.textPrimary }}
          >
            {cryptoName}{" "}
            <span
              className="text-lg"
              style={{ color: resolvedColors.textSecondary }}
            >
              ({cryptoSymbol.toUpperCase()})
            </span>
          </h3>
          <div className="flex items-center justify-center sm:justify-start space-x-4">
            <span
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: resolvedColors.textPrimary }}
            >
              {formatPrice(currentPrice)}
            </span>
            <span
              className={`unified-badge ${
                isPositiveChange
                  ? "unified-badge--success"
                  : "unified-badge--error"
              }`}
            >
              {isPositiveChange ? "+" : ""}
              {priceChange.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="text-center sm:text-right">
          <div
            className="text-sm font-medium mb-1 px-3 py-1 rounded-full transition-colors duration-300"
            style={{
              color: getCSSVariableValue("--color-primary-600"),
              backgroundColor: getCSSVariableValue("--bg-tertiary"),
              border: `1px solid ${getCSSVariableValue("--color-primary-600")}`,
            }}
          >
            {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} Chart
          </div>
          <div style={{ color: resolvedColors.textSecondary }}>
            {validData.length} data points
          </div>
        </div>
      </div>

      <div className="h-80 relative overflow-hidden rounded-lg">
        <ChartWrapper>
          {isMounted && chartReady ? (
            <Line
              ref={chartRef}
              data={chartData}
              options={options}
              key={`chart-${timeRange}-${validData.length}`}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div
                style={{ color: resolvedColors.textSecondary }}
                className="loading-pulse"
              >
                Initializing chart...
              </div>
            </div>
          )}
        </ChartWrapper>
      </div>

      {/* Chart Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="unified-card unified-card--compact text-center">
          <div
            className="text-xs font-semibold mb-1 uppercase tracking-wider"
            style={{ color: resolvedColors.textSecondary }}
          >
            High
          </div>
          <div
            className="text-lg font-bold"
            style={{ color: resolvedColors.textPrimary }}
          >
            {formatPrice(Math.max(...validData.map((d) => d.price)))}
          </div>
        </div>
        <div className="unified-card unified-card--compact text-center">
          <div
            className="text-xs font-semibold mb-1 uppercase tracking-wider"
            style={{ color: resolvedColors.textSecondary }}
          >
            Low
          </div>
          <div
            className="text-lg font-bold"
            style={{ color: resolvedColors.textPrimary }}
          >
            {formatPrice(Math.min(...validData.map((d) => d.price)))}
          </div>
        </div>
        <div className="unified-card unified-card--compact text-center">
          <div
            className="text-xs font-semibold mb-1 uppercase tracking-wider"
            style={{ color: resolvedColors.textSecondary }}
          >
            First
          </div>
          <div
            className="text-lg font-bold"
            style={{ color: resolvedColors.textPrimary }}
          >
            {formatPrice(validData[0]?.price || 0)}
          </div>
        </div>
        <div className="unified-card unified-card--compact text-center">
          <div
            className="text-xs font-semibold mb-1 uppercase tracking-wider"
            style={{ color: resolvedColors.textSecondary }}
          >
            Latest
          </div>
          <div
            className="text-lg font-bold"
            style={{ color: resolvedColors.textPrimary }}
          >
            {formatPrice(validData[validData.length - 1]?.price || 0)}
          </div>
        </div>
      </div>
    </div>
  );
}
