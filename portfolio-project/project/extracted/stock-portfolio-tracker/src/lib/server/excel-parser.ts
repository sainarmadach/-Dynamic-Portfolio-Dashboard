import { readFile } from 'fs/promises';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import 'server-only';

// Define the schema for a stock in the portfolio
export const StockSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  ticker: z.string(),
  quantity: z.number(),
  buyPrice: z.number(),
  sector: z.string().default("Uncategorized"),
  // Fields that will be populated by API calls
  currentPrice: z.number().optional(),
  peRatio: z.number().optional(),
  lastEarnings: z.string().optional(),
  totalValue: z.number().optional(),
  gainLossAmount: z.number().optional(),
  gainLossPercent: z.number().optional(),
});

export type Stock = z.infer<typeof StockSchema>;

/**
 * Parses an Excel file and converts it to a list of stocks
 * Adapts to the actual format provided in the file
 */
export async function parseExcelFile(filePath: string): Promise<Stock[]> {
  try {
    const buffer = await readFile(filePath);
    const workbook = XLSX.read(buffer);

    // Get the first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Stocks array to be populated
    const stocks: Stock[] = [];

    // Current sector tracker
    let currentSector = "Uncategorized";

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];

      // Skip empty rows
      if (!row) continue;

      // Try to identify sector rows (they typically have "Sector" in their name and no ticker)
      if (
        row.__EMPTY_1 &&
        typeof row.__EMPTY_1 === 'string' &&
        row.__EMPTY_1.includes('Sector') &&
        !row.__EMPTY_6
      ) {
        currentSector = row.__EMPTY_1;
        continue;
      }

      // Skip rows without essential data or summary rows
      if (
        !row.__EMPTY_1 ||
        typeof row.__EMPTY_1 !== 'string' ||
        row.__EMPTY_1 === '' ||
        row.__EMPTY_1.includes('Total') ||
        !row.__EMPTY_2 ||
        !row.__EMPTY_3
      ) {
        continue;
      }

      // Check if this is a valid stock row (has an index number)
      const hasIndexNumber = row.__EMPTY !== undefined && !isNaN(Number(row.__EMPTY));

      if (hasIndexNumber) {
        const id = String(row.__EMPTY);
        const name = row.__EMPTY_1;
        const buyPrice = typeof row.__EMPTY_2 === 'number' ? row.__EMPTY_2 : parseFloat(String(row.__EMPTY_2));
        const quantity = typeof row.__EMPTY_3 === 'number' ? row.__EMPTY_3 : parseFloat(String(row.__EMPTY_3));
        const ticker = row.__EMPTY_6 || "UNKNOWN";
        const cmp = row.__EMPTY_7 || 0;

        // Create a stock object if all essential data is present
        if (name && buyPrice > 0 && quantity > 0) {
          stocks.push({
            id,
            name,
            ticker,
            quantity,
            buyPrice,
            sector: currentSector,
            currentPrice: cmp,
          });
        }
      }
    }

    if (stocks.length === 0) {
      throw new Error('No valid stock data found in the Excel file');
    }

    return stocks;
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error(
      `Failed to parse Excel file: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
