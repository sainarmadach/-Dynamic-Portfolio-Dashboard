'use client';

import { FileUpload } from './file-upload';
import { PortfolioTable } from './portfolio-table';
import { PortfolioCharts } from './portfolio-charts';
import { PortfolioProvider, usePortfolio } from './portfolio-context';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

// Summary component to show portfolio totals
function PortfolioSummary() {
  const { totalPortfolioValue, totalPortfolioGainLoss } = usePortfolio();

  const gainLossColor = totalPortfolioGainLoss > 0
    ? 'text-green-500'
    : totalPortfolioGainLoss < 0
      ? 'text-red-500'
      : '';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Total Portfolio Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalPortfolioValue.toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR',
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Total Gain/Loss
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${gainLossColor}`}>
            {totalPortfolioGainLoss.toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR',
              signDisplay: 'always',
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Inner component that uses the Portfolio context
function Dashboard() {
  const { stocks } = usePortfolio();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Stock Portfolio Dashboard</h1>

      <FileUpload />

      {stocks.length > 0 && (
        <>
          <PortfolioSummary />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <PortfolioTable />
            </div>
            <div>
              <PortfolioCharts />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Wrapper component that provides the context
export function PortfolioDashboard() {
  return (
    <PortfolioProvider>
      <Dashboard />
    </PortfolioProvider>
  );
}
