# Stock Portfolio Tracker

A comprehensive Next.js + Node.js application for tracking and visualizing your stock portfolio performance. The application ingests Excel files containing stock portfolio details, fetches real-time stock data from Yahoo Finance and Google Finance, and provides rich visualization and analysis of portfolio performance.

## 🌟 Features

- **Excel File Ingestion**: Upload your portfolio Excel files with stock details
- **Real-time Data**: Fetches current market price from Yahoo Finance and PE ratios + earnings data from Google Finance
- **Live Updates**: Automatically refreshes stock data every 15 seconds
- **Performance Metrics**: Calculates present value, gain/loss amount, and gain/loss percentage
- **Sector Grouping**: Groups stocks by sector with sector-level totals
- **Data Visualization**: Includes sector distribution charts
- **Responsive Design**: Works on all device sizes with Tailwind CSS

## 📋 Requirements

- Node.js 18+ (LTS)
- Bun package manager (recommended)
- (Optional) PostgreSQL for production deployment

## 🚀 Getting Started

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/stock-portfolio-tracker.git
   cd stock-portfolio-tracker
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Create required directories:
   ```bash
   mkdir -p uploads
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

### Running in Development

Start the development server:
```bash
bun run dev
```

This will start the application at [http://localhost:3000](http://localhost:3000).

### Building for Production

Build the application:
```bash
bun run build
```

Start the production server:
```bash
bun run start
```

## 🔧 Environment Variables

The application uses the following environment variables:

```
# Database (optional)
DATABASE_URL="postgresql://user:password@localhost:5432/portfolio_db"

# NextAuth (kept for compatibility)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# API Rate Limiting (optional)
RATE_LIMIT_REQUESTS=50
RATE_LIMIT_WINDOW_MS=60000
```

## 📋 Excel Format

The application expects Excel files with the following columns:

| Particulars | NSE/BSE | Qty | Buy Price | Sector |
|-------------|---------|-----|----------|--------|
| Stock Name  | Ticker  | 100 | 500.00   | Tech   |

- **Particulars**: Name of the stock (mapped to `name`)
- **NSE/BSE**: Stock ticker symbol (mapped to `ticker`)
- **Qty**: Quantity of shares (mapped to `quantity`)
- **Buy Price**: Purchase price per share
- **Sector**: Industry sector of the stock

## 🌐 Deployment

### Deploying to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Set the required environment variables
4. Deploy

### Deploying to Netlify

1. Build the application: `bun run build`
2. Deploy the `out` directory using the Netlify CLI or drag and drop in the Netlify dashboard

## 🔍 Code Structure

- `/src/lib/server`: Server-side code, including Excel parsing
- `/src/lib/client`: Client-side utilities
- `/src/app/_components/portfolio`: Portfolio-related components
- `/src/app/api`: API routes

## 📜 License

MIT License
