// Owner: Arsath
// utils/ExcelUtils.js

'use strict';

/**
 * ExcelUtils — read and write test-data Excel workbooks.
 *
 * Built on the `xlsx` (SheetJS) package already declared in package.json.
 * Provides a minimal but complete API for the data-driven testing patterns
 * used in this project:
 *
 *   ExcelUtils.readSheet(filePath, sheetName)
 *     → returns the sheet as an array of plain objects (first row = headers).
 *
 *   ExcelUtils.readRow(filePath, sheetName, rowIndex)
 *     → returns a single row object (0-based after the header row).
 *
 *   ExcelUtils.writeSheet(filePath, sheetName, data)
 *     → writes (or overwrites) a sheet with an array of objects.
 *
 *   ExcelUtils.appendRow(filePath, sheetName, rowObject)
 *     → appends one row to an existing sheet (creates file/sheet if absent).
 *
 *   ExcelUtils.getSheetNames(filePath)
 *     → returns all sheet names in the workbook.
 *
 *   ExcelUtils.cellValue(filePath, sheetName, cellAddress)
 *     → returns the raw value of a single cell (e.g. 'B2').
 *
 * Test-data file convention:
 *   Place Excel files under `test-data/` (e.g. `test-data/login.xlsx`).
 *   Each sheet's first row must contain column headers.
 *   Each subsequent row is returned as a plain JS object keyed by those headers.
 *
 * Example — data-driven login test:
 *
 *   const rows = ExcelUtils.readSheet('test-data/login.xlsx', 'ValidUsers');
 *   for (const row of rows) {
 *     await loginPage.login(row.username, row.password);
 *   }
 *
 * Author: Arsath
 */

const XLSX = require('xlsx');
const fs   = require('fs');
const path = require('path');

// =============================================================================
//  Internal helpers
// =============================================================================

/**
 * Load a workbook from disk.  Throws a clear error if the file does not exist.
 *
 * @param {string} filePath
 * @returns {import('xlsx').WorkBook}
 */
function _loadWorkbook(filePath) {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`ExcelUtils: file not found → ${resolved}`);
  }
  return XLSX.readFile(resolved);
}

/**
 * Retrieve a worksheet by name; throw if it does not exist in the workbook.
 *
 * @param {import('xlsx').WorkBook} wb
 * @param {string} sheetName
 * @returns {import('xlsx').WorkSheet}
 */
function _getSheet(wb, sheetName) {
  const ws = wb.Sheets[sheetName];
  if (!ws) {
    throw new Error(
      `ExcelUtils: sheet "${sheetName}" not found. Available sheets: ${wb.SheetNames.join(', ')}`
    );
  }
  return ws;
}

// =============================================================================
//  Public API
// =============================================================================

const ExcelUtils = {

  /**
   * Read an entire worksheet and return every data row as a plain object,
   * using the first row as property names (header row).
   *
   * Empty rows are automatically filtered out.
   *
   * @param {string} filePath    path to the .xlsx file (absolute or relative to cwd)
   * @param {string} sheetName   exact name of the worksheet tab
   * @returns {Record<string, string|number|boolean>[]}
   */
  readSheet(filePath, sheetName) {
    const wb   = _loadWorkbook(filePath);
    const ws   = _getSheet(wb, sheetName);
    /** @type {Record<string, unknown>[]} */
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
    // Filter out rows where every value is an empty string
    return rows.filter((row) => Object.values(row).some((v) => v !== ''));
  },

  /**
   * Read a single data row by 0-based index (after the header row).
   *
   * @param {string} filePath
   * @param {string} sheetName
   * @param {number} rowIndex    0 = first data row (row 2 in the spreadsheet)
   * @returns {Record<string, string|number|boolean>}
   */
  readRow(filePath, sheetName, rowIndex) {
    const rows = this.readSheet(filePath, sheetName);
    if (rowIndex < 0 || rowIndex >= rows.length) {
      throw new RangeError(
        `ExcelUtils: row index ${rowIndex} is out of range (sheet has ${rows.length} data row(s))`
      );
    }
    return rows[rowIndex];
  },

  /**
   * Write an array of objects to a named sheet in the workbook.
   * If the file exists the sheet is replaced; all other sheets are preserved.
   * If the file does not exist it is created.
   *
   * @param {string} filePath
   * @param {string} sheetName
   * @param {Record<string, unknown>[]} data
   * @returns {void}
   */
  writeSheet(filePath, sheetName, data) {
    const resolved = path.resolve(filePath);

    // Load existing workbook, or create a fresh one
    let wb;
    if (fs.existsSync(resolved)) {
      wb = XLSX.readFile(resolved);
    } else {
      // Ensure parent directory exists
      fs.mkdirSync(path.dirname(resolved), { recursive: true });
      wb = XLSX.utils.book_new();
    }

    const ws = XLSX.utils.json_to_sheet(data);

    // Replace or append the sheet
    if (wb.SheetNames.includes(sheetName)) {
      wb.Sheets[sheetName] = ws;
    } else {
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }

    XLSX.writeFile(wb, resolved);
  },

  /**
   * Append a single row object to an existing sheet.
   * Creates the file and/or sheet if they do not already exist.
   *
   * @param {string} filePath
   * @param {string} sheetName
   * @param {Record<string, unknown>} rowObject
   * @returns {void}
   */
  appendRow(filePath, sheetName, rowObject) {
    const existingRows = fs.existsSync(path.resolve(filePath))
      ? (() => {
          try { return this.readSheet(filePath, sheetName); }
          catch { return []; }
        })()
      : [];

    this.writeSheet(filePath, sheetName, [...existingRows, rowObject]);
  },

  /**
   * Return the list of sheet names in the given workbook.
   *
   * @param {string} filePath
   * @returns {string[]}
   */
  getSheetNames(filePath) {
    const wb = _loadWorkbook(filePath);
    return [...wb.SheetNames];
  },

  /**
   * Return the raw value of a single cell (e.g. `'B2'`).
   * Returns `undefined` if the cell does not exist.
   *
   * @param {string} filePath
   * @param {string} sheetName
   * @param {string} cellAddress  e.g. 'A1', 'C3'
   * @returns {string|number|boolean|undefined}
   */
  cellValue(filePath, sheetName, cellAddress) {
    const wb   = _loadWorkbook(filePath);
    const ws   = _getSheet(wb, sheetName);
    const cell = ws[cellAddress.toUpperCase()];
    return cell ? cell.v : undefined;
  },
};

module.exports = { ExcelUtils };
