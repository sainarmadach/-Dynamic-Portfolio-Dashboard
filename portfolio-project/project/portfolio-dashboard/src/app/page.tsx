import { Suspense } from "react";
import Portfolio from "@/components/Portfolio";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col px-6 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Portfolio Dashboard</h1>
        <p className="text-muted-foreground">
          Track your investments in real-time with data from Yahoo Finance and Google Finance
        </p>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>About This Dashboard</CardTitle>
          <CardDescription>
            This dynamic portfolio dashboard displays real-time investment data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              This dashboard demonstrates a financial portfolio tracker that:
            </p>
            <ul className="list-disc pl-6 text-sm text-muted-foreground">
              <li>Fetches real-time stock prices from Yahoo Finance (simulated)</li>
              <li>Retrieves P/E Ratio and Latest Earnings from Google Finance (simulated)</li>
              <li>Updates data automatically every 60 seconds</li>
              <li>Groups stocks by sector with expandable sections</li>
              <li>Calculates investment summaries at portfolio and sector levels</li>
              <li>Visually highlights gains and losses with color coding</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Suspense fallback={<div>Loading portfolio data...</div>}>
        <Portfolio />
      </Suspense>
    </main>
  );
}
