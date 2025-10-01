'use client';

import { useEffect, useState } from 'react';
import { CoinGeckoService } from '../services/coinGeckoApi';

export default function DebugPanel() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  const runTests = async () => {
    try {
      console.log('Running API tests...');
      
      // Test 1: Get popular cryptos
      const popularCryptos = await CoinGeckoService.getPopularCryptos(5);
      console.log('Popular cryptos test:', popularCryptos);
      
      if (popularCryptos.length > 0) {
        // Test 2: Get price history for first crypto
        const firstCrypto = popularCryptos[0];
        console.log('Testing price history for:', firstCrypto.name);
        
        const priceHistory = await CoinGeckoService.getCryptoPriceHistory(firstCrypto.id);
        console.log('Price history test:', priceHistory);
        
        setDebugInfo({
          popularCryptos: popularCryptos.length,
          firstCrypto: firstCrypto.name,
          priceHistory: {
            cryptoId: priceHistory.cryptoId,
            hourly: priceHistory.hourly?.length || 0,
            daily: priceHistory.daily?.length || 0,
            weekly: priceHistory.weekly?.length || 0,
            monthly: priceHistory.monthly?.length || 0,
            sampleData: priceHistory.daily?.slice(0, 3) || []
          },
          apiStats: CoinGeckoService.getApiStats()
        });
      }
    } catch (error) {
      console.error('API test failed:', error);
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  useEffect(() => {
    // Run tests when component mounts
    runTests();
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{ borderRadius: 'var(--radius-button)' }}
        className="fixed top-4 left-4 bg-blue-500 text-white text-sm z-50 px-3 py-1 transition-all duration-300 hover:bg-blue-600"
      >
        Debug
      </button>
    );
  }

  return (
    <div style={{ 
      padding: 'var(--spacing-card)', 
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-card)',
      maxWidth: '28rem',
      maxHeight: '24rem'
    }} className="fixed top-4 left-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 overflow-auto z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-subheading">Debug Info</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          ✕
        </button>
      </div>
      
      {debugInfo ? (
        <pre style={{ borderRadius: 'var(--radius-button)' }} className="text-xs bg-gray-100 dark:bg-gray-700 p-2 overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      ) : (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <div className="text-muted">Running tests...</div>
        </div>
      )}
      
      <button
        onClick={runTests}
        style={{ borderRadius: 'var(--radius-button)' }}
        className="mt-3 w-full bg-blue-500 text-white py-1 px-3 text-sm hover:bg-blue-600 transition-colors duration-200"
      >
        Run Tests Again
      </button>
    </div>
  );
}