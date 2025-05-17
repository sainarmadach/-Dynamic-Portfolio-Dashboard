import * as XLSX from 'xlsx';
import { readFileSync } from 'fs';

// Read the Excel file
const excelPath = './uploads/Sample_Portfolio.xlsx';
const buffer = readFileSync(excelPath);
const workbook = XLSX.read(buffer);

// Assuming the first sheet contains the data
const firstSheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[firstSheetName];

// Convert to JSON
const jsonData = XLSX.utils.sheet_to_json(worksheet);

// Print the first row to see the column headers
console.log('Sheet Name:', firstSheetName);
console.log('First Row Sample:', jsonData[0]);
console.log('All Column Names:', Object.keys(jsonData[0]).join(', '));
console.log('Total Rows:', jsonData.length);
