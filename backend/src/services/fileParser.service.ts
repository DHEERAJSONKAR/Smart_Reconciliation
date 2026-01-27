import fs from 'fs';
import csv from 'csv-parser';
import ExcelJS from 'exceljs';
import path from 'path';
import logger from '../utils/logger';

export interface ParsedRow {
  transactionId: string;
  referenceNumber: string;
  amount: number;
  date: Date;
  description?: string;
  sourceSystem?: string;
  [key: string]: any;
}

export interface ParseResult {
  rows: ParsedRow[];
  totalRows: number;
  errors: Array<{ row: number; error: string }>;
}

class FileParserService {
  async parseFile(filePath: string): Promise<ParseResult> {
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.csv') {
      return this.parseCsv(filePath);
    } else if (ext === '.xlsx' || ext === '.xls') {
      return this.parseExcel(filePath);
    } else {
      throw new Error(`Unsupported file format: ${ext}`);
    }
  }

  private async parseCsv(filePath: string): Promise<ParseResult> {
    return new Promise((resolve, reject) => {
      const rows: ParsedRow[] = [];
      const errors: Array<{ row: number; error: string }> = [];
      let rowNumber = 0;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data: any) => {
          rowNumber++;
          try {
            const parsedRow = this.parseRow(data, rowNumber);
            if (parsedRow) {
              rows.push(parsedRow);
            }
          } catch (error: any) {
            errors.push({ row: rowNumber, error: error.message });
            logger.warn(`CSV row ${rowNumber} parse error: ${error.message}`);
          }
        })
        .on('end', () => {
          logger.info(`CSV parsing completed: ${rows.length} rows parsed, ${errors.length} errors`);
          resolve({ rows, totalRows: rowNumber, errors });
        })
        .on('error', (error) => {
          logger.error('CSV parsing failed:', error);
          reject(error);
        });
    });
  }

  private async parseExcel(filePath: string): Promise<ParseResult> {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      
      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error('Excel file has no worksheets');
      }

      const rows: ParsedRow[] = [];
      const errors: Array<{ row: number; error: string }> = [];
      
      // Get header row to map column names
      const headerRow = worksheet.getRow(1);
      const headers: string[] = [];
      headerRow.eachCell((cell, colNumber) => {
        headers[colNumber] = String(cell.value || '').trim();
      });

      // Process data rows (skip header)
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row

        try {
          // Convert row to object using headers
          const rowData: any = {};
          row.eachCell((cell, colNumber) => {
            const header = headers[colNumber];
            if (header) {
              rowData[header] = cell.value;
            }
          });

          const parsedRow = this.parseRow(rowData, rowNumber);
          if (parsedRow) {
            rows.push(parsedRow);
          }
        } catch (error: any) {
          errors.push({ row: rowNumber, error: error.message });
          logger.warn(`Excel row ${rowNumber} parse error: ${error.message}`);
        }
      });

      logger.info(`Excel parsing completed: ${rows.length} rows parsed, ${errors.length} errors`);
      return { rows, totalRows: worksheet.rowCount - 1, errors };
    } catch (error) {
      logger.error('Excel parsing failed:', error);
      throw error;
    }
  }

  private parseRow(data: any, rowNumber: number): ParsedRow | null {
    // Normalize column names (handle variations)
    const normalizedData: any = {};
    Object.keys(data).forEach((key) => {
      const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '_');
      normalizedData[normalizedKey] = data[key];
    });

    // Extract required fields with various possible column names
    const transactionId =
      normalizedData.transaction_id ||
      normalizedData.transactionid ||
      normalizedData.txn_id ||
      normalizedData.id;

    const referenceNumber =
      normalizedData.reference_number ||
      normalizedData.referencenumber ||
      normalizedData.reference ||
      normalizedData.ref_number ||
      normalizedData.ref ||
      transactionId; // Fallback to transactionId if reference not provided

    const amount =
      normalizedData.amount ||
      normalizedData.value ||
      normalizedData.transaction_amount;

    const dateStr =
      normalizedData.date ||
      normalizedData.transaction_date ||
      normalizedData.txn_date;

    const description =
      normalizedData.description ||
      normalizedData.desc ||
      normalizedData.narration;

    const sourceSystem =
      normalizedData.source_system ||
      normalizedData.source ||
      normalizedData.system;

    // Validate required fields
    if (!transactionId) {
      throw new Error('Missing transaction ID');
    }
    if (amount === undefined || amount === null || amount === '') {
      throw new Error('Missing amount');
    }
    if (!dateStr) {
      throw new Error('Missing date');
    }

    // Parse and validate amount
    const parsedAmount = parseFloat(String(amount).replace(/,/g, ''));
    if (isNaN(parsedAmount)) {
      throw new Error(`Invalid amount: ${amount}`);
    }

    // Parse date
    const parsedDate = new Date(dateStr);
    if (isNaN(parsedDate.getTime())) {
      throw new Error(`Invalid date: ${dateStr}`);
    }

    return {
      transactionId: String(transactionId).trim(),
      referenceNumber: String(referenceNumber).trim(),
      amount: parsedAmount,
      date: parsedDate,
      description: description ? String(description).trim() : undefined,
      sourceSystem: sourceSystem ? String(sourceSystem).trim() : undefined,
      ...normalizedData,
    };
  }
}

export default new FileParserService();
