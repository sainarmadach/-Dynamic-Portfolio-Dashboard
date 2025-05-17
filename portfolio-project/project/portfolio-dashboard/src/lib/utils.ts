import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Stock, SectorSummary, Portfolio } from "@/types/stock";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculatePortfolioStats(stocks: Stock[]): Portfolio {
  // Calculate total investment and present value
  const totalInvestment = stocks.reduce((sum, stock) => sum + stock.investment, 0);
  const totalPresentValue = stocks.reduce((sum, stock) => sum + stock.presentValue, 0);
  const totalGainLoss = totalPresentValue - totalInvestment;

  // Group stocks by sector
  const sectorMap = new Map<string, Stock[]>();
  stocks.forEach(stock => {
    if (!sectorMap.has(stock.sector)) {
      sectorMap.set(stock.sector, []);
    }
    sectorMap.get(stock.sector)!.push(stock);
  });

  // Calculate sector summaries
  const sectorSummaries: SectorSummary[] = Array.from(sectorMap.entries()).map(([sector, sectorStocks]) => {
    const totalInvestment = sectorStocks.reduce((sum, stock) => sum + stock.investment, 0);
    const totalPresentValue = sectorStocks.reduce((sum, stock) => sum + stock.presentValue, 0);
    const gainLoss = totalPresentValue - totalInvestment;

    return {
      sector,
      totalInvestment,
      totalPresentValue,
      gainLoss,
      stocks: sectorStocks,
    };
  });

  return {
    stocks,
    totalInvestment,
    totalPresentValue,
    totalGainLoss,
    sectorSummaries,
    lastUpdated: new Date(),
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

export function calculateGainLossPercentage(investment: number, gainLoss: number): number {
  if (investment === 0) return 0;
  return (gainLoss / investment) * 100;
}
