# Dynamic Portfolio Dashboard

A real-time investment portfolio tracker built with Next.js, TypeScript, Tailwind CSS, and Node.js.

## Overview

This application allows investors to track their portfolio performance with data fetched from financial APIs. It displays key metrics like Current Market Price (CMP), P/E Ratio, and Latest Earnings for each stock, with automatic updates every 15 seconds.

## Features

- **Live Data**: Fetches current stock prices from Yahoo Finance and financial metrics from Google Finance (simulated data for demo)
- **Controlled Updates**: Automatically refreshes stock data every 15 seconds with a visible countdown timer
- **Portfolio Table**: Displays comprehensive stock information including purchase price, quantity, investment value, portfolio percentage (dynamic), current value, and gain/loss
- **Sector Grouping**: Organizes stocks by sector with expandable/collapsible sections
- **Visual Indicators**: Color-codes gains (green) and losses (red) for easy identification
- **Sector Allocation Chart**: Visual representation of portfolio distribution across sectors
- **Responsive Design**: Works on devices of all sizes

## Technical Implementation

- **Frontend**: Next.js (React framework) with TypeScript and Tailwind CSS
- **State Management**: React Hooks (useState, useEffect, useMemo, useCallback)
- **Data Fetching**: Simulated API calls for Yahoo Finance and Google Finance within the frontend for demo purposes.
- **Data Visualization**: Recharts for the sector allocation pie chart
- **UI Components**: Custom components using shadcn/ui library
- **Styling**: Tailwind CSS for responsive design
- **Performance**: Optimized with memoization and proper React patterns

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or bun (package manager)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Start the development server:
   ```bash
   bun run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

1. **Data Sources**: The application simulates fetching data from Yahoo Finance (for stock prices) and Google Finance (for P/E ratios and earnings)
2. **Update Cycle**: Every 15 seconds, the app refreshes stock data with a visible countdown timer
3. **Sector Analysis**: Stocks are grouped by sector with sector-level summaries
4. **Portfolio Summary**: The dashboard shows total investment, current value, and overall gain/loss
5. **Data Visualization**: A pie chart illustrates the distribution of investments across different sectors

## API Integration

The application is designed to work with:

- Yahoo Finance (for Current Market Price)
- Google Finance (for P/E Ratio and Latest Earnings)

Note: This demo uses simulated API responses since these services don't have official public APIs. In a real application, web scraping or unofficial libraries would be used to fetch actual data.

## Technical Challenges and Solutions

- **API Simulation**: Created realistic random fluctuations to mimic market behavior
- **Data Updates**: Implemented a custom countdown timer with controlled update frequency
- **Hydration Handling**: Resolved server/client hydration mismatches with proper client-side detection
- **Interactive UI**: Built expandable/collapsible sections for better organization of stock data
- **Performance**: Used React best practices to prevent unnecessary re-renders

## License

This project is for demonstration purposes as part of a case study assignment.

Created for Octa Byte AI Pvt Ltd. Case Study.
