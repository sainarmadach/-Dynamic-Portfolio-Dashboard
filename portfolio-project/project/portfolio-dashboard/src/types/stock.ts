export interface Stock {
  id: string;
  particulars: string;
  purchasePrice: number;
  quantity: number;
  investment: number;
  portfolioPercentage: number;
  exchange: 'NSE' | 'BSE';
  cmp: number;
  presentValue: number;
  gainLoss: number;
  peRatio: number;
  latestEarnings: number;
  sector: string;
}

export type StockWithUpdates = Stock & {
  isLoading?: boolean;
  error?: string;
};

export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  gainLoss: number;
  stocks: Stock[];
}

export interface Portfolio {
  stocks: StockWithUpdates[];
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  sectorSummaries: SectorSummary[];
  lastUpdated: Date;
}
