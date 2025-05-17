'use client';

import { useEffect, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  useReactTable,
  createColumnHelper,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import { usePortfolio } from './portfolio-context';
import type { Stock } from '~/lib/server/excel-parser';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { ChevronDownIcon, ChevronRightIcon, ArrowUpDownIcon } from 'lucide-react';

// Define a row type that includes subRows property to avoid TypeScript errors
interface StockRow extends Stock {
  subRows?: StockRow[];
  isSector?: boolean;
}

const columnHelper = createColumnHelper<StockRow>();

export function PortfolioTable() {
  const { stocks, isLoading, refreshStockData } = usePortfolio();
  const [sorting, setSorting] = useState<SortingState>([]);

  // Group stocks by sector
  const groupedData = useMemo(() => {
    // Create a map to group stocks by sector
    const sectorsMap: Record<string, StockRow[]> = {};

    // Ensure all stocks have subRows property initialized
    const stocksWithSubRows = stocks.map(stock => ({
      ...stock,
      subRows: undefined, // Explicitly initialize subRows property
    }));

    // Group the stocks by sector
    stocksWithSubRows.forEach(stock => {
      const sector = stock.sector || 'Uncategorized';
      if (!sectorsMap[sector]) {
        sectorsMap[sector] = [];
      }
      sectorsMap[sector].push(stock);
    });

    // Create parent rows for each sector
    return Object.entries(sectorsMap).map(([sector, sectorStocks]) => {
      // Calculate sector totals
      const totalQuantity = sectorStocks.reduce((sum, stock) => sum + stock.quantity, 0);
      const totalValue = sectorStocks.reduce((sum, stock) => sum + (stock.totalValue || 0), 0);
      const totalGainLoss = sectorStocks.reduce((sum, stock) => sum + (stock.gainLossAmount || 0), 0);
      const totalCost = sectorStocks.reduce((sum, stock) => sum + (stock.quantity * stock.buyPrice), 0);
      const gainLossPercent = totalCost ? (totalGainLoss / totalCost) * 100 : 0;

      // Create the sector row with subRows property
      return {
        id: `sector-${sector}`,
        name: sector,
        ticker: '',
        quantity: totalQuantity,
        buyPrice: 0,
        sector,
        totalValue,
        gainLossAmount: totalGainLoss,
        gainLossPercent,
        subRows: sectorStocks, // Add the stocks as subRows
        isSector: true,
      } as StockRow;
    });
  }, [stocks]);

  // Simplified columns definition as per the case study
  const columns = useMemo(() => [
    columnHelper.group({
      id: 'stock',
      header: 'Stock',
      columns: [
        columnHelper.accessor('name', {
          header: 'Particulars',
          cell: ({ row, getValue }) => {
            const value = getValue();
            if (row.original.isSector) {
              return (
                <div className="flex items-center font-bold">
                  {row.getIsExpanded() ? (
                    <ChevronDownIcon className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4 mr-2" />
                  )}
                  {value} ({row.original.subRows?.length || 0})
                </div>
              );
            }
            return <span className="pl-6">{value}</span>;
          },
        }),
        columnHelper.accessor('ticker', {
          header: 'NSE/BSE',
          cell: ({ getValue }) => getValue() || '-',
        }),
      ],
    }),
    columnHelper.group({
      id: 'details',
      header: 'Investment Details',
      columns: [
        columnHelper.accessor('buyPrice', {
          header: 'Purchase Price',
          cell: ({ getValue, row }) => {
            const value = getValue();
            return row.original.isSector ? '-' : value.toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR',
            });
          },
        }),
        columnHelper.accessor('quantity', {
          header: 'Qty',
          cell: ({ getValue }) => getValue().toLocaleString(),
        }),
        columnHelper.accessor(row => row.quantity * row.buyPrice, {
          id: 'investment',
          header: 'Investment',
          cell: ({ getValue }) => {
            const value = getValue();
            return value.toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR',
            });
          },
        }),
      ],
    }),
    columnHelper.group({
      id: 'market',
      header: 'Market Data',
      columns: [
        columnHelper.accessor('currentPrice', {
          header: 'CMP',
          cell: ({ getValue, row }) => {
            const value = getValue();
            return row.original.isSector ? '-' : value ? value.toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR',
            }) : 'Loading...';
          },
        }),
        columnHelper.accessor('totalValue', {
          header: 'Present Value',
          cell: ({ getValue }) => {
            const value = getValue();
            return value ? value.toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR',
            }) : 'Loading...';
          },
        }),
      ],
    }),
    columnHelper.group({
      id: 'performance',
      header: 'Performance',
      columns: [
        columnHelper.accessor('gainLossAmount', {
          header: 'Gain/Loss',
          cell: ({ getValue }) => {
            const value = getValue();
            if (!value && value !== 0) return 'Loading...';

            const color = value > 0 ? 'text-green-500' : value < 0 ? 'text-red-500' : '';
            return (
              <span className={color}>
                {value.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  signDisplay: 'always',
                })}
              </span>
            );
          },
        }),
        columnHelper.accessor('gainLossPercent', {
          header: 'G/L %',
          cell: ({ getValue }) => {
            const value = getValue();
            if (!value && value !== 0) return 'Loading...';

            const color = value > 0 ? 'text-green-500' : value < 0 ? 'text-red-500' : '';
            return (
              <span className={color}>
                {value.toFixed(2)}%
              </span>
            );
          },
        }),
      ],
    }),
    columnHelper.group({
      id: 'financials',
      header: 'Financial Data',
      columns: [
        columnHelper.accessor('peRatio', {
          header: 'P/E Ratio',
          cell: ({ getValue, row }) => {
            const value = getValue();
            return row.original.isSector ? '-' : value ? value.toFixed(2) : 'N/A';
          },
        }),
        columnHelper.accessor('lastEarnings', {
          header: 'Latest Earnings',
          cell: ({ getValue, row }) => {
            const value = getValue();
            return row.original.isSector ? '-' : value || 'N/A';
          },
        }),
      ],
    }),
  ], []);

  const table = useReactTable({
    data: groupedData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getRowCanExpand: row => Boolean(row.original?.subRows && row.original.subRows.length > 0),
    getSubRows: row => row.original?.subRows || [],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    enableExpanding: true,
    enableGrouping: true,
    debugTable: process.env.NODE_ENV === 'development',
  });

  // Initially expand all groups
  useEffect(() => {
    if (groupedData.length > 0) {
      table.toggleAllRowsExpanded();
    }
  }, [table, groupedData.length]);

  if (stocks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please upload a portfolio file to see your data.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <div className="flex justify-between p-2 bg-gray-50">
        <h3 className="font-semibold">Portfolio Overview</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => refreshStockData()}
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="animate-pulse text-gray-500">Updating data...</div>
          </div>
        )}
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={header.column.getCanSort() ? 'cursor-pointer select-none flex items-center' : ''}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <ArrowUpDownIcon className="ml-1 h-4 w-4 text-gray-400" />,
                          desc: <ArrowUpDownIcon className="ml-1 h-4 w-4 text-gray-400" />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
              <tr
                key={row.id}
                className={row.original.isSector ? 'bg-gray-50' : ''}
                onClick={() => {
                  if (row.original.isSector) {
                    row.toggleExpanded();
                  }
                }}
              >
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
