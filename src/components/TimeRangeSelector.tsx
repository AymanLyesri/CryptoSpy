"use client";

import { TimeRange, ChartTimeRangeOption } from "../types/chartData";

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

const timeRangeOptions: ChartTimeRangeOption[] = [
  { value: "hourly", label: "24H", dataPoints: 24 },
  { value: "daily", label: "7D", dataPoints: 30 },
  { value: "weekly", label: "30D", dataPoints: 52 },
  { value: "monthly", label: "1Y", dataPoints: 12 },
];

export default function TimeRangeSelector({
  selectedRange,
  onRangeChange,
}: TimeRangeSelectorProps) {
  return (
    <div
      id="time-range-selector"
      className="inline-flex p-1 rounded-xl backdrop-blur-sm"
      style={{
        background: "var(--bg-overlay)",
        border: "1px solid var(--border-primary)",
      }}
    >
      {timeRangeOptions.map((option) => {
        const isSelected = selectedRange === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onRangeChange(option.value)}
            className={`
              relative px-6 py-2 text-sm font-medium rounded-lg
              transition-all duration-300 ease-out
              ${
                isSelected
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }
            `}
            style={{
              boxShadow: isSelected ? "0 2px 8px rgba(0, 0, 0, 0.1)" : "none",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
