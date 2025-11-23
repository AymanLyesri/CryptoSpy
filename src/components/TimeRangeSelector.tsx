"use client";

import { TimeRange, ChartTimeRangeOption } from "../types/chartData";
import { unifiedStyles } from "@/utils/themeUtils";

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

const timeRangeOptions: ChartTimeRangeOption[] = [
  { value: "hourly", label: "24H", dataPoints: 24 },
  { value: "daily", label: "30D", dataPoints: 30 },
  { value: "weekly", label: "1Y", dataPoints: 52 },
  { value: "monthly", label: "All", dataPoints: 12 },
];

export default function TimeRangeSelector({
  selectedRange,
  onRangeChange,
}: TimeRangeSelectorProps) {
  return (
    <div
      className={`
      ${unifiedStyles.card.base}
      flex space-x-1 
      bg-gray-100/80 dark:bg-gray-800/50 
      backdrop-blur-sm border border-gray-200 dark:border-gray-700
      !p-1
    `}
    >
      {timeRangeOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onRangeChange(option.value)}
          className={`
            ${unifiedStyles.button.secondary}
            text-sm font-medium transition-all duration-300
            ${
              selectedRange === option.value
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-lg transform scale-105"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-gray-700/50 !border-transparent !shadow-none"
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
