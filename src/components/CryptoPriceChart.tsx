'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { PriceDataPoint, TimeRange } from '../types/chartData';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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
  const chartRef = useRef<ChartJS<'line'>>(null);

  // Format timestamp based on time range
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    
    switch (timeRange) {
      case 'hourly':
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      case 'daily':
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      case 'weekly':
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: '2-digit'
        });
      case 'monthly':
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        });
      default:
        return date.toLocaleDateString();
    }
  };

  // Format price for display
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price < 1 ? 4 : 2,
      maximumFractionDigits: price < 1 ? 4 : 2,
    }).format(price);
  };

  // Calculate price change
  const priceChange = data.length > 1 ? 
    ((data[data.length - 1].price - data[0].price) / data[0].price) * 100 : 0;
  
  const isPositiveChange = priceChange >= 0;

  // Prepare chart data
  const chartData = {
    labels: data.map(point => formatTimestamp(point.timestamp)),
    datasets: [
      {
        label: `${cryptoName} Price`,
        data: data.map(point => point.price),
        borderColor: isPositiveChange ? '#10b981' : '#ef4444',
        backgroundColor: isPositiveChange 
          ? 'rgba(16, 185, 129, 0.1)' 
          : 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: isPositiveChange ? '#10b981' : '#ef4444',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: isPositiveChange ? '#10b981' : '#ef4444',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          title: function(context: any) {
            const dataIndex = context[0].dataIndex;
            const timestamp = data[dataIndex].timestamp;
            return new Date(timestamp).toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
          },
          label: function(context: any) {
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
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
          maxTicksLimit: timeRange === 'hourly' ? 8 : 10,
        },
      },
      y: {
        display: true,
        position: 'right' as const,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return formatPrice(value);
          },
        },
      },
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {cryptoName} ({cryptoSymbol.toUpperCase()})
          </h3>
          <div className="flex items-center space-x-4 mt-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(currentPrice)}
            </span>
            <span className={`text-sm font-medium ${
              isPositiveChange ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositiveChange ? '+' : ''}{priceChange.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 mb-1">
            {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} Chart
          </div>
          <div className="text-xs text-gray-400">
            {data.length} data points
          </div>
        </div>
      </div>
      
      <div className="h-80 relative">
        <Line
          ref={chartRef}
          data={chartData}
          options={options}
        />
      </div>
      
      {/* Chart Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">High</div>
          <div className="text-sm font-medium text-gray-900">
            {formatPrice(Math.max(...data.map(d => d.price)))}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Low</div>
          <div className="text-sm font-medium text-gray-900">
            {formatPrice(Math.min(...data.map(d => d.price)))}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">First</div>
          <div className="text-sm font-medium text-gray-900">
            {formatPrice(data[0]?.price || 0)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Latest</div>
          <div className="text-sm font-medium text-gray-900">
            {formatPrice(data[data.length - 1]?.price || 0)}
          </div>
        </div>
      </div>
    </div>
  );
}