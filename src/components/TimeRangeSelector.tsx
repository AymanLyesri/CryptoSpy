'use client';

import { TimeRange, ChartTimeRangeOption } from '../types/chartData';

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

const timeRangeOptions: ChartTimeRangeOption[] = [
  { value: 'hourly', label: '24H', dataPoints: 24 },
  { value: 'daily', label: '30D', dataPoints: 30 },
  { value: 'weekly', label: '1Y', dataPoints: 52 },
  { value: 'monthly', label: 'All', dataPoints: 12 },
];

export default function TimeRangeSelector({
  selectedRange,
  onRangeChange,
}: TimeRangeSelectorProps) {
  return (
    <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
      {timeRangeOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onRangeChange(option.value)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            selectedRange === option.value
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}