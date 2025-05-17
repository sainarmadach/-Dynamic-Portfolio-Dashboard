'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Stock } from '~/lib/server/excel-parser';
import { getStockData } from '~/lib/client/finance-api';

// Define the context type
interface PortfolioContextType {
  stocks: Stock[];
  isLoading: boolean;
  error: string | null;
  setStocks: (stocks: Stock[]) => void;
  refreshStockData: () => Promise<void>;
  sectorTotals: Record<string, { totalValue: number; totalGainLoss: number }>;
  totalPortfolioValue: number;
  totalPortfolioGainLoss: number;
}

// Create the context with a default value
const PortfolioContext = createContext<PortfolioContextType>({
  stocks: [],
  isLoading: false,
  error: null,
  setStocks: () => {},
  refreshStockData: async () => {},
  sectorTotals: {},
  totalPortfolioValue: 0,
  totalPortfolioGainLoss: 0,
});

// Export the provider component
export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sectorTotals, setSectorTotals] = useState<Record<string, { totalValue: number; totalGainLoss: number }>>({});
  const [totalPortfolioValue, setTotalPortfolioValue] = useState<number>(0);
  const [totalPortfolioGainLoss, setTotalPortfolioGainLoss] = useState<number>(0);

  // Use a ref for the interval ID to prevent it from being part of the dependency array
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to calculate derived values
  const calculateDerivedValues = useCallback((stocksData: Stock[]) => {
    try {
      const updatedStocks = stocksData.map(stock => {
        // Ensure stock has all necessary properties
        if (!stock) return null;

        // Get current price with fallback
        const currentPrice = stock.currentPrice || 0;

        // Calculate total value with safety checks
        const totalValue = currentPrice > 0 && stock.quantity > 0
          ? stock.quantity * currentPrice
          : stock.quantity * stock.buyPrice; // Fallback to original investment

        // Calculate gain/loss with safety checks
        const originalValue = stock.quantity * stock.buyPrice;
        const gainLossAmount = totalValue - originalValue;

        // Calculate percentage with division by zero check
        const gainLossPercent = originalValue > 0
          ? (gainLossAmount / originalValue) * 100
          : 0;

        return {
          ...stock,
          totalValue,
          gainLossAmount,
          gainLossPercent,
        };
      }).filter(Boolean) as Stock[]; // Filter out any null items

      // For typesafety, initialize sector totals directly
      const newSectorTotals: Record<string, { totalValue: number; totalGainLoss: number }> = {};
      let newTotalPortfolioValue = 0;
      let newTotalPortfolioGainLoss = 0;

      // Calculate totals with safety checks
      updatedStocks.forEach(stock => {
        // Skip invalid stocks
        if (!stock || !stock.sector) return;

        const sector = stock.sector;

        // Ensure the sector exists in our totals object
        if (!newSectorTotals[sector]) {
          newSectorTotals[sector] = { totalValue: 0, totalGainLoss: 0 };
        }

        // Update sector totals
        const stockTotalValue = stock.totalValue || 0;
        const stockGainLoss = stock.gainLossAmount || 0;

        newSectorTotals[sector].totalValue += stockTotalValue;
        newSectorTotals[sector].totalGainLoss += stockGainLoss;

        // Update grand totals
        newTotalPortfolioValue += stockTotalValue;
        newTotalPortfolioGainLoss += stockGainLoss;
      });

      // Update state
      setSectorTotals(newSectorTotals);
      setTotalPortfolioValue(newTotalPortfolioValue);
      setTotalPortfolioGainLoss(newTotalPortfolioGainLoss);

      return updatedStocks;
    } catch (err) {
      console.error('Error calculating derived values:', err);
      // Return the original data if there's an error
      return stocksData;
    }
  }, []);

  // Function to refresh stock data
  const refreshStockData = useCallback(async () => {
    if (stocks.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const updatedStocks = await Promise.all(
        stocks.map(async (stock) => {
          try {
            // Skip invalid stocks
            if (!stock || !stock.ticker) return stock;

            const stockData = await getStockData(stock.ticker);

            return {
              ...stock,
              currentPrice: stockData.currentPrice || stock.currentPrice || stock.buyPrice,
              peRatio: stockData.peRatio || stock.peRatio || 0,
              lastEarnings: stockData.lastEarnings || stock.lastEarnings || 'N/A',
            };
          } catch (err) {
            console.error(`Error fetching data for ${stock?.ticker || 'unknown stock'}:`, err);
            // Return the stock unchanged if there's an error
            return stock;
          }
        })
      );

      // Calculate derived values and update the state
      const stocksWithDerivedValues = calculateDerivedValues(updatedStocks);
      setStocks(stocksWithDerivedValues);
    } catch (err) {
      console.error('Error refreshing stock data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while refreshing stock data');
    } finally {
      setIsLoading(false);
    }
  }, [stocks, calculateDerivedValues]);

  // Set up automatic refresh every 15 seconds
  useEffect(() => {
    if (stocks.length === 0) return;

    // Clear any existing interval when dependencies change
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }

    // Perform initial refresh
    void refreshStockData();

    // Set up interval for refreshes
    refreshIntervalRef.current = setInterval(() => {
      void refreshStockData();
    }, 15000); // 15 seconds

    // Clean up interval on unmount or when dependencies change
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [stocks.length, refreshStockData]);

  // When stocks are set for the first time, calculate derived values
  const handleSetStocks = useCallback((newStocks: Stock[]) => {
    // Safety check
    if (!Array.isArray(newStocks)) {
      console.error('Expected an array of stocks but received:', newStocks);
      setError('Invalid stock data received');
      return;
    }

    // Filter out invalid stock objects
    const validStocks = newStocks.filter(stock =>
      stock &&
      typeof stock === 'object' &&
      typeof stock.name === 'string' &&
      typeof stock.buyPrice === 'number' &&
      typeof stock.quantity === 'number' &&
      stock.buyPrice > 0 &&
      stock.quantity > 0
    );

    // Reset loading and error states
    setIsLoading(false);
    setError(null);

    // Calculate derived values for valid stocks
    const stocksWithDerivedValues = calculateDerivedValues(validStocks);
    setStocks(stocksWithDerivedValues);
  }, [calculateDerivedValues]);

  return (
    <PortfolioContext.Provider
      value={{
        stocks,
        isLoading,
        error,
        setStocks: handleSetStocks,
        refreshStockData,
        sectorTotals,
        totalPortfolioValue,
        totalPortfolioGainLoss
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

// Export hook for using the context
export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}
