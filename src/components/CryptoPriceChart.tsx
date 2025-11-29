"use client";

import { useState, useMemo, useEffect } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { PriceDataPoint, TimeRange } from "../types/chartData";
import { formatters } from "../utils/themeUtils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface CryptoPriceChartProps {
  data: PriceDataPoint[];
  timeRange: TimeRange;
  cryptoName: string;
  cryptoSymbol: string;
  currentPrice: number;
}

// Helper to get CSS variable values
const getCSSVariable = (variable: string): string => {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
};

export default function CryptoPriceChart({
  data,
  timeRange,
  cryptoName,
  cryptoSymbol,
  currentPrice,
}: CryptoPriceChartProps) {
  // State for theme-reactive colors
  const [chartColors, setChartColors] = useState({
    success: "hsl(142, 76%, 36%)",
    error: "hsl(0, 84%, 60%)",
  });

  // Update colors when theme changes
  useEffect(() => {
    const updateColors = () => {
      const successColor = getCSSVariable("--color-success-600");
      const errorColor = getCSSVariable("--color-error-600");

      setChartColors({
        success: successColor || "hsl(142, 76%, 36%)",
        error: errorColor || "hsl(0, 84%, 60%)",
      });
    };

    updateColors();

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          updateColors();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

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

  // Transform ALL data once - don't recalculate based on timeRange
  const allChartData = useMemo(
    () =>
      validData.map((point) => ({
        date: formatTimestamp(point.timestamp),
        price: point.price,
        timestamp: point.timestamp,
      })),
    [validData] // Only recalculate when validData changes, not timeRange
  );

  // Filter data based on timeRange - this allows smooth transitions
  const filteredData = useMemo(() => {
    if (allChartData.length === 0) return allChartData;

    // Get the latest timestamp as reference
    const latestTimestamp = allChartData[allChartData.length - 1].timestamp;
    const latestDate = new Date(latestTimestamp);

    // Calculate start date based on time range
    const startDate = new Date(latestDate);
    switch (timeRange) {
      case "hourly":
        startDate.setHours(latestDate.getHours() - 24);
        break;
      case "daily":
        startDate.setDate(latestDate.getDate() - 7);
        break;
      case "weekly":
        startDate.setDate(latestDate.getDate() - 30);
        break;
      case "monthly":
        startDate.setMonth(latestDate.getMonth() - 12);
        break;
      default:
        return allChartData;
    }

    // Filter data points that are within the time range
    return allChartData.filter((item) => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= startDate;
    });
  }, [allChartData, timeRange]);

  // Calculate price change using filtered data
  const priceChange =
    filteredData.length > 1
      ? ((filteredData[filteredData.length - 1].price - filteredData[0].price) /
          filteredData[0].price) *
        100
      : 0;

  const isPositiveChange = priceChange >= 0;

  // Memoize chart color based on price change and theme colors
  const chartColor = useMemo(
    () => (isPositiveChange ? chartColors.success : chartColors.error),
    [isPositiveChange, chartColors]
  );

  // Chart configuration with dynamic colors
  const chartConfig = useMemo(
    () => ({
      price: {
        label: "Price",
        color: chartColor,
      },
    }),
    [chartColor]
  );

  // Calculate Y-axis domain based on filtered data
  const yAxisDomain = useMemo((): [number, number] => {
    if (filteredData.length === 0) return [0, 100];

    const prices = filteredData.map((d) => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Add 2% padding for better visualization
    const padding = (maxPrice - minPrice) * 0.02;

    return [Math.max(0, minPrice - padding), maxPrice + padding];
  }, [filteredData]);

  return (
    <section className="unified-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div className="text-center sm:text-left">
          <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">
            {cryptoName}{" "}
            <span className="text-lg text-muted-foreground">
              ({cryptoSymbol.toUpperCase()})
            </span>
          </h3>
          <div className="flex items-center justify-center sm:justify-start space-x-4">
            <span className="text-2xl sm:text-3xl font-bold text-foreground">
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
          <div className="text-sm font-medium mb-1 px-3 py-1 rounded-full transition-colors duration-300 bg-primary/10 text-primary border border-primary">
            {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} Chart
          </div>
          <div className="text-muted-foreground">
            {filteredData.length} data points
          </div>
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-80 w-full">
        <AreaChart
          data={filteredData}
          margin={{
            left: 12,
            right: 12,
            top: 12,
            bottom: 12,
          }}
        >
          <defs>
            <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={chartColor} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tickFormatter={(value) => value}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickCount={6}
            orientation="right"
            domain={yAxisDomain}
            tickFormatter={(value) => formatPrice(value)}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(value, payload) => {
                  if (payload && payload.length > 0) {
                    const timestamp = payload[0].payload.timestamp;
                    return new Date(timestamp).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                  }
                  return value;
                }}
                formatter={(value) => formatPrice(Number(value))}
                indicator="dot"
              />
            }
          />
          <Area
            dataKey="price"
            type="monotone"
            fill="url(#fillPrice)"
            fillOpacity={0.4}
            stroke={chartColor}
            strokeWidth={2}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ChartContainer>

      {/* Chart Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-6 border-t border-border">
        <div className="unified-card unified-card--compact text-center">
          <div className="text-xs font-semibold mb-1 uppercase tracking-wider text-muted-foreground">
            High
          </div>
          <div className="text-lg font-bold text-foreground">
            {formatPrice(Math.max(...filteredData.map((d) => d.price)))}
          </div>
        </div>
        <div className="unified-card unified-card--compact text-center">
          <div className="text-xs font-semibold mb-1 uppercase tracking-wider text-muted-foreground">
            Low
          </div>
          <div className="text-lg font-bold text-foreground">
            {formatPrice(Math.min(...filteredData.map((d) => d.price)))}
          </div>
        </div>
        <div className="unified-card unified-card--compact text-center">
          <div className="text-xs font-semibold mb-1 uppercase tracking-wider text-muted-foreground">
            First
          </div>
          <div className="text-lg font-bold text-foreground">
            {formatPrice(filteredData[0]?.price || 0)}
          </div>
        </div>
        <div className="unified-card unified-card--compact text-center">
          <div className="text-xs font-semibold mb-1 uppercase tracking-wider text-muted-foreground">
            Latest
          </div>
          <div className="text-lg font-bold text-foreground">
            {formatPrice(filteredData[filteredData.length - 1]?.price || 0)}
          </div>
        </div>
      </div>
    </section>
  );
}
