"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Stock, SectorSummary } from "@/types/stock";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PortfolioTableProps {
  stocks: Stock[];
  sectorSummaries: SectorSummary[];
  isLoading: boolean;
}

export default function PortfolioTable({
  stocks,
  sectorSummaries,
  isLoading,
}: PortfolioTableProps) {
  const [expandedSectors, setExpandedSectors] = useState<string[]>([]);

  const toggleSector = (sector: string) => {
    setExpandedSectors(prev =>
      prev.includes(sector)
        ? prev.filter(s => s !== sector)
        : [...prev, sector]
    );
  };

  const groupedStocks = useMemo(() => {
    return sectorSummaries.map(summary => ({
      ...summary,
      isExpanded: expandedSectors.includes(summary.sector),
    }));
  }, [sectorSummaries, expandedSectors]);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Particulars</TableHead>
            <TableHead className="text-right">Purchase Price</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Investment</TableHead>
            <TableHead className="text-right">Portfolio (%)</TableHead>
            <TableHead className="text-center">NSE/BSE</TableHead>
            <TableHead className="text-right">CMP</TableHead>
            <TableHead className="text-right">Present Value</TableHead>
            <TableHead className="text-right">Gain/Loss</TableHead>
            <TableHead className="text-right">P/E Ratio</TableHead>
            <TableHead className="text-right">Latest Earnings</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedStocks.map((sectorGroup) => (
            <React.Fragment key={sectorGroup.sector}>
              {/* Sector Row */}
              <TableRow
                className="bg-muted/50 hover:bg-muted cursor-pointer"
                onClick={() => toggleSector(sectorGroup.sector)}
              >
                <TableCell colSpan={4} className="font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">
                      {sectorGroup.isExpanded ? "▼" : "▶"}
                    </span>
                    <span>{sectorGroup.sector}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right" colSpan={2}>
                  Total Investment: ₹{sectorGroup.totalInvestment.toFixed(2)}
                </TableCell>
                <TableCell className="text-right" colSpan={2}>
                  Present Value: ₹{sectorGroup.totalPresentValue.toFixed(2)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-medium",
                    sectorGroup.gainLoss >= 0 ? "text-green-600" : "text-red-600"
                  )}
                  colSpan={3}
                >
                  {sectorGroup.gainLoss >= 0 ? "+" : ""}
                  ₹{sectorGroup.gainLoss.toFixed(2)}
                </TableCell>
              </TableRow>

              {/* Stock Rows */}
              {sectorGroup.isExpanded &&
                sectorGroup.stocks.map((stock) => (
                  <TableRow key={stock.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{stock.particulars}</TableCell>
                    <TableCell className="text-right">₹{stock.purchasePrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{stock.quantity}</TableCell>
                    <TableCell className="text-right">₹{stock.investment.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{stock.portfolioPercentage.toFixed(2)}%</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{stock.exchange}</Badge>
                    </TableCell>
                    <TableCell className="text-right">₹{stock.cmp.toFixed(2)}</TableCell>
                    <TableCell className="text-right">₹{stock.presentValue.toFixed(2)}</TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium",
                        stock.gainLoss >= 0 ? "text-green-600" : "text-red-600"
                      )}
                    >
                      {stock.gainLoss >= 0 ? "+" : ""}
                      ₹{stock.gainLoss.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">{stock.peRatio.toFixed(1)}</TableCell>
                    <TableCell className="text-right">₹{stock.latestEarnings.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
