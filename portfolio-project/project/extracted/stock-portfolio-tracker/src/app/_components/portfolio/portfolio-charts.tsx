'use client';

import { usePortfolio } from './portfolio-context';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import * as XLSX from 'xlsx';

// Register the required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

// Function to generate a random color
function generateRandomColor(index: number) {
  const colors = [
    '#38bdf8', // light blue
    '#22c55e', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
    '#14b8a6', // teal
    '#6366f1', // indigo
  ];

  return colors[index % colors.length];
}

export function PortfolioCharts() {
  const { stocks, sectorTotals } = usePortfolio();

  // Prepare data for the sector distribution chart
  const sectorChartData = useMemo(() => {
    const sectors = Object.keys(sectorTotals);
    const values = sectors.map(sector => {
      // Ensure the sector exists in the totals and has a totalValue
      return sectorTotals[sector]?.totalValue || 0;
    });
    const backgroundColors = sectors.map((_, index) => generateRandomColor(index));

    return {
      labels: sectors,
      datasets: [
        {
          data: values,
          backgroundColor: backgroundColors,
          borderColor: 'white',
          borderWidth: 1,
        },
      ],
    };
  }, [sectorTotals]);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 12,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.raw;
            const total = Array.isArray(context.dataset.data)
              ? context.dataset.data.reduce((a: number, b: number) => a + b, 0)
              : 0;
            const percentage = total > 0 ? (value / total) * 100 : 0;
            return `${label}: ₹${value.toLocaleString('en-IN')} (${percentage.toFixed(1)}%)`;
          },
        },
      },
    },
  };

  // If there's no data yet, return a placeholder
  if (stocks.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sector Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <Doughnut data={sectorChartData} options={chartOptions} />
        </div>
      </CardContent>
    </Card>
  );
}
