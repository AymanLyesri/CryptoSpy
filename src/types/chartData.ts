export interface PriceDataPoint {
  timestamp: number;
  price: number;
}

export interface CryptoPriceHistory {
  cryptoId: string;
  hourly: PriceDataPoint[];
  daily: PriceDataPoint[];
  weekly: PriceDataPoint[];
  monthly: PriceDataPoint[];
}

export type TimeRange = 'hourly' | 'daily' | 'weekly' | 'monthly';

export interface ChartTimeRangeOption {
  value: TimeRange;
  label: string;
  dataPoints: number;
}