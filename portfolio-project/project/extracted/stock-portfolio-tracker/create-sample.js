import * as XLSX from 'xlsx';
import { writeFileSync } from 'fs';

// Create a workbook
const wb = XLSX.utils.book_new();

// Create data with the specific format
const data = [
  { "__EMPTY": "No", "__EMPTY_1": "Particulars", "__EMPTY_2": "Purchase Price", "__EMPTY_3": "Qty", "__EMPTY_4": "Investment", "__EMPTY_5": "Portfolio (%)", "__EMPTY_6": "NSE/BSE", "__EMPTY_7": "CMP", "__EMPTY_8": "Present value", "__EMPTY_9": "Gain/Loss", "__EMPTY_10": "Gain/Loss\r\n(%)" },
  { "__EMPTY_1": "Financial Sector", "__EMPTY_4": 328450.0, "__EMPTY_5": 0.21285627260119502, "__EMPTY_8": 386328.7, "__EMPTY_9": 57878.7, "__EMPTY_10": 0.17621768914598873 },
  { "__EMPTY": 1.0, "__EMPTY_1": "HDFC Bank", "__EMPTY_2": 1490.0, "__EMPTY_3": 50.0, "__EMPTY_4": 74500.0, "__EMPTY_5": 0.04828068902051767, "__EMPTY_6": "HDFCBANK", "__EMPTY_7": 1700.15, "__EMPTY_8": 85007.5, "__EMPTY_9": 10507.5, "__EMPTY_10": 0.14104026845637585 },
  { "__EMPTY": 2.0, "__EMPTY_1": "Bajaj Finance", "__EMPTY_2": 6466.0, "__EMPTY_3": 15.0, "__EMPTY_4": 96990.0, "__EMPTY_5": 0.06285562453825516, "__EMPTY_6": "BAJFINANCE", "__EMPTY_7": 8419.6, "__EMPTY_8": 126294.0, "__EMPTY_9": 29304.0, "__EMPTY_10": 0.3021342406433653 },
  { "__EMPTY": 3.0, "__EMPTY_1": "ICICI Bank", "__EMPTY_2": 780.0, "__EMPTY_3": 84.0, "__EMPTY_4": 65520.0, "__EMPTY_5": 0.04246108382046064, "__EMPTY_6": "532174", "__EMPTY_7": 1215.5, "__EMPTY_8": 102102.0, "__EMPTY_9": 36582.0, "__EMPTY_10": 0.5583333333333333 },
  { "__EMPTY_1": "Tech Sector", "__EMPTY_4": 337820.0, "__EMPTY_5": 0.21892862234780242, "__EMPTY_8": 319697.3, "__EMPTY_9": -18122.700000000004, "__EMPTY_10": -0.05364602451009415 },
  { "__EMPTY": 1.0, "__EMPTY_1": "Affle India", "__EMPTY_2": 1151.0, "__EMPTY_3": 50.0, "__EMPTY_4": 57550.0, "__EMPTY_5": 0.03729602218967506, "__EMPTY_6": "AFFLE", "__EMPTY_7": 1459.6, "__EMPTY_8": 72980.0, "__EMPTY_9": 15430.0, "__EMPTY_10": 0.2681146828844483 },
  { "__EMPTY": 2.0, "__EMPTY_1": "LTI Mindtree", "__EMPTY_2": 4775.0, "__EMPTY_3": 16.0, "__EMPTY_4": 76400.0, "__EMPTY_5": 0.04951200860627584, "__EMPTY_6": "LTIM", "__EMPTY_7": 4793.8, "__EMPTY_8": 76700.8, "__EMPTY_9": 300.8000000000029, "__EMPTY_10": 0.003937172774869148 },
  { "__EMPTY": 3.0, "__EMPTY_1": "KPIT Tech", "__EMPTY_2": 672.0, "__EMPTY_3": 61.0, "__EMPTY_4": 40992.0, "__EMPTY_5": 0.026565396031262557, "__EMPTY_6": "542651", "__EMPTY_7": 1293.1, "__EMPTY_8": 78879.09999999999, "__EMPTY_9": 37887.09999999999, "__EMPTY_10": 0.9242559523809522 },
  { "__EMPTY_1": "Consumer", "__EMPTY_4": 263565.0, "__EMPTY_5": 0.17080670874755355, "__EMPTY_8": 277958.7, "__EMPTY_9": 14393.699999999997, "__EMPTY_10": 0.05461157589209492 },
  { "__EMPTY": 1.0, "__EMPTY_1": "Dmart", "__EMPTY_2": 3777.0, "__EMPTY_3": 27.0, "__EMPTY_4": 101979.0, "__EMPTY_5": 0.06608881054528015, "__EMPTY_6": "DMART", "__EMPTY_7": 3451.1, "__EMPTY_8": 93179.7, "__EMPTY_9": -8799.300000000003, "__EMPTY_10": -0.08628541170240935 }
];

// Convert data to worksheet
const ws = XLSX.utils.json_to_sheet(data);

// Add worksheet to workbook
XLSX.utils.book_append_sheet(wb, ws, "Portfolio");

// Write to file
const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
writeFileSync("./uploads/Custom_Portfolio.xlsx", buffer);

console.log("Sample Excel file created at ./uploads/Custom_Portfolio.xlsx");
