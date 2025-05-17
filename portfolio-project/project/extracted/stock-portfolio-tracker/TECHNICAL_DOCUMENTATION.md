# Technical Documentation: Stock Portfolio Tracker

This document provides an in-depth explanation of the technical design choices, architecture, and implementation details of the Stock Portfolio Tracker application.

## System Architecture

The application follows a modern web architecture with a clear separation of concerns:

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │  External APIs  │
│  React Frontend │<────>│  Next.js API    │<────>│  (Yahoo/Google) │
│  (Client-side)  │      │  (Server-side)  │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

1. **Frontend Layer**: React components with Tailwind CSS styling
2. **Application Layer**: Next.js API routes and server components
3. **External Services**: Yahoo Finance API and Google Finance web scraping

## Data Fetching Strategy

### Yahoo Finance Integration

We use the `yahoo-finance2` library to fetch real-time stock data including:
- Current market price
- Day high/low values
- Trading volume

Example implementation:
```typescript
async function fetchYahooFinanceData(ticker: string) {
  try {
    const result = await yahooFinance.quoteSummary(ticker, {
      modules: ['price', 'summaryDetail']
    });

    return {
      currentPrice: result.price?.regularMarketPrice,
      // Other data points...
    };
  } catch (error) {
    console.error(`Error fetching Yahoo Finance data for ${ticker}:`, error);
    // Return null values with proper error handling
  }
}
```

### Google Finance Scraping

Since Google Finance doesn't provide an official API, we implemented HTML scraping using Cheerio:

1. We fetch the Google Finance page for a given ticker
2. Parse the HTML structure to locate P/E ratio and earnings data
3. Extract and format the required information

```typescript
async function fetchGoogleFinanceData(ticker: string) {
  try {
    // Format ticker for Google Finance URL
    const googleTicker = ticker.includes(':') ? ticker : `${ticker}:NSE`;

    const response = await fetch(`https://www.google.com/finance/quote/${googleTicker}`);
    const html = await response.text();

    const $ = cheerio.load(html);

    // Extract P/E ratio and earnings using CSS selectors
    // ...
  } catch (error) {
    console.error(`Error fetching Google Finance data for ${ticker}:`, error);
    // Proper error handling with fallback values
  }
}
```

## Caching Implementation

To optimize performance and respect rate limits of external services, we implemented an in-memory caching system:

1. **Cache Structure**: We use a key-value store with ticker symbols as keys and data objects with timestamps as values
2. **Cache Invalidation**: Data is automatically invalidated after 15 seconds
3. **Cache Hit Process**:
   - Check if data exists in cache
   - Verify if the cached data is still valid (< 15 seconds old)
   - Return cached data if valid, or fetch new data if invalid/missing

```typescript
interface CacheItem {
  data: any;
  timestamp: number;
}

const stockDataCache: Record<string, CacheItem> = {};
const CACHE_EXPIRY_MS = 15 * 1000; // 15 seconds

// Cache check logic
const cachedData = stockDataCache[ticker];
const now = Date.now();

if (cachedData && now - cachedData.timestamp < CACHE_EXPIRY_MS) {
  // Cache hit: return cached data
} else {
  // Cache miss: fetch fresh data and update cache
}
```

## Rate Limiting

To prevent overwhelming external APIs, we implemented a request queue with rate limiting:

1. **Request Queue**: All API requests are added to a queue
2. **Rate Limiting**: Requests are processed at a controlled rate (1 request every 200ms)
3. **Queue Processing**: A dedicated function processes the queue, ensuring consistent spacing between requests

```typescript
const REQUEST_QUEUE = [];
let processingQueue = false;
const RATE_LIMIT_MS = 200; // 200ms between requests

async function processQueue() {
  if (processingQueue || REQUEST_QUEUE.length === 0) return;

  processingQueue = true;
  const request = REQUEST_QUEUE.shift();

  // Process request...

  // Wait for rate limit before processing next request
  setTimeout(() => {
    processingQueue = false;
    void processQueue();
  }, RATE_LIMIT_MS);
}
```

## Error Handling Strategy

The application implements comprehensive error handling at multiple levels:

1. **API Request Level**: Each external API call is wrapped in try/catch blocks
   - Failed requests return fallback values instead of throwing errors
   - Errors are logged for debugging but don't disrupt the user experience

2. **Data Processing Level**: Validation checks ensure data integrity
   - Excel parsing validates required fields
   - Type checking prevents runtime errors from malformed data

3. **UI Level**: Graceful degradation when data is unavailable
   - Loading states inform users when data is being fetched
   - Fallback UI components when data cannot be retrieved

```typescript
// Example of multi-layered error handling
try {
  const stockData = await getStockData(ticker);
  // Process data
} catch (error) {
  console.error('Error fetching stock data:', error);
  // UI shows fallback or error message
} finally {
  // Always clear loading state
  setIsLoading(false);
}
```

## Excel Parsing Implementation

The Excel parsing functionality is implemented entirely server-side to maintain security and performance:

1. **File Handling**: Files are uploaded to a temporary location
2. **Data Extraction**: Using the `xlsx` library to convert Excel to JSON
3. **Data Mapping**: Mapping Excel columns to our internal data model
   - Particulars → name
   - NSE/BSE → ticker
   - Qty → quantity
   - Sector is preserved as-is

```typescript
export async function parseExcelFile(filePath: string): Promise<Stock[]> {
  try {
    const buffer = await readFile(filePath);
    const workbook = xlsx.read(buffer);

    // Convert to JSON and map fields
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    // Map the Excel fields to our stock model
    const stocks: Stock[] = jsonData.map((row: any) => ({
      name: row.Particulars,
      ticker: row['NSE/BSE'],
      quantity: Number(row.Qty),
      buyPrice: Number(row['Buy Price']),
      sector: row.Sector,
    }));

    return stocks;
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
}
```

## Performance Optimizations

Several performance optimizations have been implemented:

1. **Memoization**: React's `useMemo` and `useCallback` to prevent unnecessary re-renders
2. **Efficient Data Refresh**: Batch updates to minimize rendering cycles
3. **Conditional Rendering**: Components only render when they have data to display
4. **Debounced Updates**: Prevent UI thrashing during rapid data changes

## Security Considerations

1. **Input Validation**: All user inputs and file uploads are validated
2. **Data Sanitization**: Preventing XSS by sanitizing data before rendering
3. **Rate Limiting**: Protecting against potential API abuse
4. **Error Concealment**: Not exposing detailed error messages to clients

## Future Enhancements

Potential areas for future development:

1. **Persistent Storage**: Database integration for saving portfolios
2. **Authentication**: User accounts for private portfolios
3. **Additional Data Sources**: Integration with more financial data providers
4. **Advanced Analytics**: Portfolio risk assessment and optimization recommendations
5. **Export Functionality**: Allow exporting reports in various formats (PDF, CSV)
