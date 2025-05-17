"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { updateStocksWithLiveData } from "@/lib/api/financeApi";
import { Stock, SectorSummary } from "@/types/stock";
import { sampleStocks } from "@/lib/data/sampleData";
import PortfolioTable from "./PortfolioTable";
import PortfolioChart from "./PortfolioChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Portfolio() {
  const [stocks, setStocks] = useState<Stock[]>(sampleStocks);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const [countdown, setCountdown] = useState<number>(15);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const { toast } = useToast();

  // Handle client-side initialization
  useEffect(() => {
    setIsClient(true);
    const now = new Date();
    setLastUpdated(now.toLocaleTimeString());
  }, []);

  // Calculate portfolio summary data (memoized for performance)
  const portfolio = useMemo(() => {
    const totalInvestment = stocks.reduce((acc, stock) => acc + stock.investment, 0);
    const totalPresentValue = stocks.reduce((acc, stock) => acc + stock.presentValue, 0);
    const totalGainLoss = totalPresentValue - totalInvestment;

    // Dynamically update portfolioPercentage for each stock
    const stocksWithDynamicPercentage = stocks.map(stock => ({
      ...stock,
      portfolioPercentage: totalPresentValue > 0 ? (stock.presentValue / totalPresentValue) * 100 : 0,
    }));

    // Group stocks by sector and calculate sector summaries
    const sectorMap = new Map<string, Stock[]>();

    stocksWithDynamicPercentage.forEach(stock => {
      const sector = stock.sector;
      if (!sectorMap.has(sector)) {
        sectorMap.set(sector, []);
      }
      sectorMap.get(sector)?.push(stock);
    });

    const sectorSummaries: SectorSummary[] = [];

    sectorMap.forEach((sectorStocks, sector) => {
      const totalInvestment = sectorStocks.reduce((acc, stock) => acc + stock.investment, 0);
      const totalPresentValue = sectorStocks.reduce((acc, stock) => acc + stock.presentValue, 0);
      const gainLoss = totalPresentValue - totalInvestment;

      sectorSummaries.push({
        sector,
        totalInvestment,
        totalPresentValue,
        gainLoss,
        stocks: sectorStocks, // these stocks will have updated portfolioPercentage
      });
    });

    return {
      stocks: stocksWithDynamicPercentage, // Use stocksWithDynamicPercentage
      totalInvestment,
      totalPresentValue,
      totalGainLoss,
      sectorSummaries,
      lastUpdated,
    };
  }, [stocks, lastUpdated]);

  // Stable function to update stock data
  // Dependencies: toast, isClient. `stocks` and `autoRefresh` are accessed via state, not as deps.
  const refreshStockData = useCallback(async () => {
    if (!isClient) return;

    setIsLoading(true);
    try {
      // Pass current stocks state directly to the API function
      const currentStocks = stocks; // Or get from a ref if needed for extreme cases
      const updatedStocks = await updateStocksWithLiveData(currentStocks);
      setStocks(updatedStocks);
      setLastUpdated(new Date().toLocaleTimeString());

      // Only show toast if manually refreshed (not auto-refresh)
      // Access autoRefresh directly from state
      if (!autoRefresh) {
        toast({
          title: "Data updated",
          description: "Portfolio data has been refreshed",
        });
      }
    } catch (error) {
      console.error("Error updating stock data:", error);
      toast({
        variant: "destructive",
        title: "Error updating data",
        description: "Failed to refresh portfolio data",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isClient, toast]); // Removed stocks and autoRefresh from dependencies

  // Toggle auto-refresh function
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => {
      const newState = !prev;
      // If turning on auto-refresh, reset the countdown immediately
      if (newState) {
        setCountdown(15);
      }
      return newState;
    });
  }, []); // No dependencies, as it only uses setAutoRefresh and setCountdown

  // Main auto-refresh controller
  useEffect(() => {
    if (!isClient) return;

    // Initial data fetch only if it hasn't been done yet (e.g., by checking if stocks is sampleStocks)
    // This ensures it runs once on mount.
    if (stocks === sampleStocks) { // Or some other flag to indicate initial fetch
        refreshStockData();
    }

    setCountdown(15); // Reset countdown when autoRefresh state changes or on mount

    let countdownTimer: NodeJS.Timeout | null = null;
    let refreshTimer: NodeJS.Timeout | null = null;

    if (autoRefresh) {
      countdownTimer = setInterval(() => {
        setCountdown(prev => (prev <= 1 ? 15 : prev - 1));
      }, 1000);

      refreshTimer = setInterval(() => {
        console.log("Auto-refreshing data...");
        refreshStockData();
      }, 15000);

      console.log("Auto-refresh timers initialized");
    }

    return () => {
      if (countdownTimer) {
        clearInterval(countdownTimer);
        console.log("Countdown timer cleared");
      }
      if (refreshTimer) {
        clearInterval(refreshTimer);
        console.log("Refresh timer cleared");
      }
    };
    // refreshStockData is stable due to useCallback with minimal dependencies.
  }, [isClient, autoRefresh, refreshStockData]);

  // Handle manual refresh
  const handleManualRefresh = useCallback(() => {
    refreshStockData();
    console.log("Manual refresh triggered");
    if (autoRefresh) { // Access autoRefresh directly from state
      setCountdown(15);
      console.log("Countdown reset to 15 seconds");
    }
  }, [refreshStockData, autoRefresh]); // refreshStockData is stable

  // Only render full content on client-side to avoid hydration mismatch
  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">...</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 flex items-center justify-center">
              Loading portfolio data...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{portfolio.totalInvestment.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Present Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{portfolio.totalPresentValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Gain/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${portfolio.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolio.totalGainLoss >= 0 ? '+' : ''}
              ₹{portfolio.totalGainLoss.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {((portfolio.totalGainLoss / portfolio.totalInvestment) * 100).toFixed(2)}% return
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sector Allocation Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sector Allocation</CardTitle>
          <CardDescription>
            Distribution of your portfolio across different sectors
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <PortfolioChart sectorSummaries={portfolio.sectorSummaries} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Portfolio Holdings</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={toggleAutoRefresh}
                    className="mr-1"
                  />
                  Auto-refresh
                </label>
                <button
                  onClick={handleManualRefresh}
                  className="px-3 py-1 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Refresh Now"}
                </button>
              </div>
              <div className="text-sm text-muted-foreground">
                {autoRefresh
                  ? `Next update in ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}`
                  : "Auto-refresh disabled"} | Last update: {lastUpdated}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PortfolioTable
            stocks={portfolio.stocks}
            sectorSummaries={portfolio.sectorSummaries}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Built-in toast system handles notifications */}
    </div>
  );
}
