'use client';

import * as XLSX from 'xlsx';
import type { Stock } from '~/lib/server/excel-parser';

/**
 * Processes an uploaded file and returns the parsed stocks
 * Adapted to match the actual format provided in the Excel file
 * Now with robust error handling.
 */
export async function processUploadedFile(file: File): Promise<Stock[]> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Use xlsx directly without saving to disk
    const workbook = XLSX.read(buffer);

    // Ensure there is at least one sheet
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('The Excel file contains no sheets');
    }

    // Get the first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Ensure the worksheet exists
    if (!worksheet) {
      throw new Error(`Could not find worksheet: ${firstSheetName}`);
    }

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Check if any data was parsed
    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      throw new Error('No data found in the Excel file');
    }

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
        try {
          const id = String(row.__EMPTY);
          const name = row.__EMPTY_1;
          const buyPrice = typeof row.__EMPTY_2 === 'number' ? row.__EMPTY_2 : parseFloat(String(row.__EMPTY_2));
          const quantity = typeof row.__EMPTY_3 === 'number' ? row.__EMPTY_3 : parseFloat(String(row.__EMPTY_3));
          const ticker = row.__EMPTY_6 || "UNKNOWN";
          const cmp = row.__EMPTY_7 || 0;

          // Validate parsed values
          if (isNaN(buyPrice) || isNaN(quantity) || buyPrice <= 0 || quantity <= 0) {
            console.warn(`Skipping invalid stock data at row ${i + 1}: ${name}`);
            continue;
          }

          // Create a stock object if all essential data is present
          if (name && buyPrice > 0 && quantity > 0) {
            stocks.push({
              id,
              name,
              ticker,
              quantity,
              buyPrice,
              sector: currentSector,
              currentPrice: typeof cmp === 'number' ? cmp : 0,
            });
          }
        } catch (rowError) {
          console.error(`Error processing row ${i + 1}:`, rowError);
          // Continue to the next row instead of failing the entire import
        }
      }
    }

    if (stocks.length === 0) {
      throw new Error('No valid stock data found in the Excel file');
    }

    console.log(`Successfully processed ${stocks.length} stocks`);
    return stocks;
  } catch (error) {
    console.error('Error processing file:', error);
    throw new Error(
      `Failed to process Excel file: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
