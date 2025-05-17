import axios from 'axios';
import { Stock } from '@/types/stock';

// Simulating API fetching for Yahoo Finance since it doesn't have an official API
export async function fetchStockPriceFromYahoo(symbol: string, exchange: 'NSE' | 'BSE'): Promise<number | null> {
  try {
    // In a real application, you would implement a proper scraping solution or use an unofficial API
    // For this demo, we'll simulate API response with a very small price fluctuation
    // Only return a change 40% of the time to reduce volatility
    return Math.random() > 0.6
      ? null
      : (Math.random() * 1.5) + 0.5; // Very small changes between 0.5 and 2
  } catch (error) {
    console.error(`Error fetching Yahoo Finance data for ${symbol}:`, error);
    return null;
  }
}

// Simulating API fetching for Google Finance
export async function fetchFinancialDataFromGoogle(symbol: string, exchange: 'NSE' | 'BSE'): Promise<{ peRatio: number | null; latestEarnings: number | null }> {
  try {
    // In a real application, you would implement a proper scraping solution or use an unofficial API
    // For this demo, we'll simulate API response with very small fluctuations
    // Only update P/E ratio and earnings 20% of the time to improve stability
    const shouldUpdate = Math.random() > 0.8;

    const peRatio = shouldUpdate ? parseFloat((15 + Math.random() * 10).toFixed(1)) : null; // Smaller range of values
    const latestEarnings = shouldUpdate ? parseFloat((10 + Math.random() * 20).toFixed(1)) : null; // Smaller range of values

    return { peRatio, latestEarnings };
  } catch (error) {
    console.error(`Error fetching Google Finance data for ${symbol}:`, error);
    return { peRatio: null, latestEarnings: null };
  }
}

// Function to update all stocks with the latest data
export async function updateStocksWithLiveData(stocks: Stock[]): Promise<Stock[]> {
  // In a real-world scenario, we would batch these requests or use a proper API
  // For this demo, we'll update each stock one by one
  const updatedStocks = await Promise.all(
    stocks.map(async (stock) => {
      const symbol = `${stock.particulars.replace(/\s+/g, '')}.${stock.exchange}`;

      // Fetch price from Yahoo Finance (simulated)
      const priceChange = await fetchStockPriceFromYahoo(symbol, stock.exchange);

      // Fetch PE Ratio and Latest Earnings from Google Finance (simulated)
      const { peRatio, latestEarnings } = await fetchFinancialDataFromGoogle(symbol, stock.exchange);

      // Calculate new CMP with a much smaller random fluctuation
      const newCMP = priceChange !== null
        ? stock.cmp + (stock.cmp * priceChange / 500) * (Math.random() > 0.6 ? 1 : -1) // Using larger divisor for even smaller changes
        : stock.cmp;

      // Ensure CMP doesn't go below a reasonable value (90% of original purchase price)
      const finalCMP = Math.max(newCMP, stock.purchasePrice * 0.9);

      // Calculate updated values
      const presentValue = finalCMP * stock.quantity;
      const gainLoss = presentValue - stock.investment;

      return {
        ...stock,
        cmp: parseFloat(finalCMP.toFixed(2)),
        presentValue: parseFloat(presentValue.toFixed(2)),
        gainLoss: parseFloat(gainLoss.toFixed(2)),
        peRatio: peRatio !== null ? peRatio : stock.peRatio,
        latestEarnings: latestEarnings !== null ? latestEarnings : stock.latestEarnings,
      };
    })
  );

  return updatedStocks;
}
