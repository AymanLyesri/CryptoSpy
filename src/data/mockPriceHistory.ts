import { CryptoPriceHistory, PriceDataPoint } from '../types/chartData';

// Generate mock price data for demonstration
const generatePriceData = (
  basePrice: number,
  dataPoints: number,
  timeInterval: number,
  volatility: number = 0.05
): PriceDataPoint[] => {
  const data: PriceDataPoint[] = [];
  let currentPrice = basePrice;
  const now = Date.now();

  for (let i = dataPoints - 1; i >= 0; i--) {
    // Add some realistic price movement
    const change = (Math.random() - 0.5) * 2 * volatility;
    const trend = Math.sin(i / dataPoints * Math.PI * 2) * 0.02; // Add slight trend
    currentPrice = currentPrice * (1 + change + trend);
    
    data.unshift({
      timestamp: now - (i * timeInterval),
      price: Math.max(currentPrice, basePrice * 0.5), // Prevent negative prices
    });
  }

  return data;
};

// Mock historical data for cryptocurrencies
export const mockPriceHistory: Record<string, CryptoPriceHistory> = {
  bitcoin: {
    cryptoId: 'bitcoin',
    hourly: generatePriceData(43250.50, 24, 60 * 60 * 1000, 0.02), // 24 hours, hourly
    daily: generatePriceData(43250.50, 30, 24 * 60 * 60 * 1000, 0.05), // 30 days, daily
    weekly: generatePriceData(43250.50, 52, 7 * 24 * 60 * 60 * 1000, 0.08), // 52 weeks
    monthly: generatePriceData(43250.50, 12, 30 * 24 * 60 * 60 * 1000, 0.12), // 12 months
  },
  ethereum: {
    cryptoId: 'ethereum',
    hourly: generatePriceData(2680.75, 24, 60 * 60 * 1000, 0.03),
    daily: generatePriceData(2680.75, 30, 24 * 60 * 60 * 1000, 0.06),
    weekly: generatePriceData(2680.75, 52, 7 * 24 * 60 * 60 * 1000, 0.09),
    monthly: generatePriceData(2680.75, 12, 30 * 24 * 60 * 60 * 1000, 0.13),
  },
  binancecoin: {
    cryptoId: 'binancecoin',
    hourly: generatePriceData(315.20, 24, 60 * 60 * 1000, 0.025),
    daily: generatePriceData(315.20, 30, 24 * 60 * 60 * 1000, 0.055),
    weekly: generatePriceData(315.20, 52, 7 * 24 * 60 * 60 * 1000, 0.085),
    monthly: generatePriceData(315.20, 12, 30 * 24 * 60 * 60 * 1000, 0.125),
  },
  cardano: {
    cryptoId: 'cardano',
    hourly: generatePriceData(0.52, 24, 60 * 60 * 1000, 0.04),
    daily: generatePriceData(0.52, 30, 24 * 60 * 60 * 1000, 0.07),
    weekly: generatePriceData(0.52, 52, 7 * 24 * 60 * 60 * 1000, 0.10),
    monthly: generatePriceData(0.52, 12, 30 * 24 * 60 * 60 * 1000, 0.15),
  },
  solana: {
    cryptoId: 'solana',
    hourly: generatePriceData(98.45, 24, 60 * 60 * 1000, 0.035),
    daily: generatePriceData(98.45, 30, 24 * 60 * 60 * 1000, 0.065),
    weekly: generatePriceData(98.45, 52, 7 * 24 * 60 * 60 * 1000, 0.095),
    monthly: generatePriceData(98.45, 12, 30 * 24 * 60 * 60 * 1000, 0.14),
  },
  polkadot: {
    cryptoId: 'polkadot',
    hourly: generatePriceData(7.23, 24, 60 * 60 * 1000, 0.03),
    daily: generatePriceData(7.23, 30, 24 * 60 * 60 * 1000, 0.06),
    weekly: generatePriceData(7.23, 52, 7 * 24 * 60 * 60 * 1000, 0.09),
    monthly: generatePriceData(7.23, 12, 30 * 24 * 60 * 60 * 1000, 0.13),
  },
  chainlink: {
    cryptoId: 'chainlink',
    hourly: generatePriceData(14.85, 24, 60 * 60 * 1000, 0.03),
    daily: generatePriceData(14.85, 30, 24 * 60 * 60 * 1000, 0.06),
    weekly: generatePriceData(14.85, 52, 7 * 24 * 60 * 60 * 1000, 0.09),
    monthly: generatePriceData(14.85, 12, 30 * 24 * 60 * 60 * 1000, 0.13),
  },
  litecoin: {
    cryptoId: 'litecoin',
    hourly: generatePriceData(72.30, 24, 60 * 60 * 1000, 0.025),
    daily: generatePriceData(72.30, 30, 24 * 60 * 60 * 1000, 0.055),
    weekly: generatePriceData(72.30, 52, 7 * 24 * 60 * 60 * 1000, 0.085),
    monthly: generatePriceData(72.30, 12, 30 * 24 * 60 * 60 * 1000, 0.125),
  },
  uniswap: {
    cryptoId: 'uniswap',
    hourly: generatePriceData(6.78, 24, 60 * 60 * 1000, 0.04),
    daily: generatePriceData(6.78, 30, 24 * 60 * 60 * 1000, 0.07),
    weekly: generatePriceData(6.78, 52, 7 * 24 * 60 * 60 * 1000, 0.10),
    monthly: generatePriceData(6.78, 12, 30 * 24 * 60 * 60 * 1000, 0.15),
  },
  'avalanche-2': {
    cryptoId: 'avalanche-2',
    hourly: generatePriceData(36.25, 24, 60 * 60 * 1000, 0.035),
    daily: generatePriceData(36.25, 30, 24 * 60 * 60 * 1000, 0.065),
    weekly: generatePriceData(36.25, 52, 7 * 24 * 60 * 60 * 1000, 0.095),
    monthly: generatePriceData(36.25, 12, 30 * 24 * 60 * 60 * 1000, 0.14),
  },
};