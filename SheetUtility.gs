var SheetUtility = {
  /**
   * Gets the column titles from the specified sheet.
   *
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet the sheet to inspect for the column titles.
   * @returns {String[]} an array representing the column titles.
   */
  getColumnTitlesAsArray: function (sheet) {
    var values = SheetUtility.getColumnTitlesAsRange(sheet).getValues()[0];
    if (values.length === 1 && values[0] === '') {
      return [];
    }

    return values;
  },

  /**
   * Gets the column titles from the specified sheet.
   *
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet the sheet to pull the column titles from.
   * @returns {GoogleAppsScript.Spreadsheet.Range}  The range containing the column headers.
   */
  getColumnTitlesAsRange: function (sheet) {
    // getLastColumn returns a 0 based index, but the getRange methbod is the count of columns
    var lastColumnIndex = sheet.getLastColumn();
    Utility.Debugger.debug('SheetUtility.getColumnTitlesAsArray called, lastColumn value: ' +
                           lastColumnIndex);

    return sheet.getRange(1, 1, 1, lastColumnIndex == 0 ? 1 : lastColumnIndex);
  },

  /**
   * Searches for the specified column name in the given sheet.
   *
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet the sheet to check for the specified column
   *   name.
   * @param {string} columnName the name of the column to search for.
   * @return {number} the index of the column based on the column name specified within the sheet
   *         specified.  This will be 0-based and will return -1 in situations where the index
   *   could
   *         not be found.
   */
  getColumnIndexByName: function (sheet, columnName) {
    return this.getColumnTitlesAsArray(sheet).indexOf(columnName);
  },

  /**
   * Returns an indicator for whether or not the specified column exists (case-sensitively).
   *
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet the sheet to check for the specified column
   *   name.
   * @param {string} columnName the name of the column to search for.
   * @return {boolean} whether or not the specified columnName exists in the specified sheet.
   */
  doesColumnExist: function (sheet, columnName) {
    return this.getColumnIndexByName(sheet, columnName) >= 0;
  },

  createColumn: function (sheet, columnName) {
    var lastColumn = sheet.getLastColumn();
    if (lastColumn === 0) {
      sheet.insertColumns(1);
    } else {
      sheet.insertColumnAfter(lastColumn);
    }

    lastColumn++;
    sheet.getRange(1, lastColumn, 1, 1).setValue(columnName);
  },

  /**
   * Finds the parent folder of the master spreadsheet.  If the master spreadsheet has more than
   * one parent, this method will throw an error because it does not know which folder to consider
   * the parent.
   *
   * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} masterSpreadsheetToGetParentFrom the master
   *   spreadsheet.
   * @returns {GoogleAppsScript.Drive.Folder} the parent folder of the provided master spreadsheet.
   * @private
   */
  getParentFolderOfSpreadsheet: function (spreadsheetToGetParentFrom) {
    var parentFoldersIterator = DriveApp.getFileById(
      spreadsheetToGetParentFrom.getId()).getParents();

    if (!parentFoldersIterator.hasNext()) {
      throw 'Could not find parent folder for spreadsheet ' +
      spreadsheetToGetParentFrom.getName()
      + ', is it in a directory?';
    }

    var parentFolder = parentFoldersIterator.next();
    if (parentFoldersIterator.hasNext()) {
      throw 'Multiple parent folders found for spreadsheet '
      + spreadsheetToGetParentFrom.getName()
      + ', parent folder to use to create other spreadsheets could not be determined '
      + '(given there should only be one parent folder)';
    }

    return parentFolder;
  },

  /**
   * Retrieves all data from the sheet, excluding the headers as a two
   * dimensional array of values.
   *
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet The sheet to pull all of the
   *                                                        data from.
   * @returns {Object[][]} all of the data contained in the master sheet.
   * @private
   */
  getSheetData: function (sheet) {
    var lastColumn = sheet.getLastColumn();
    var lastRow = sheet.getLastRow();

    // if the last column is 0, it means there are now columns.  If lastRow is 1, then
    // that means there is no data, there is only the headers.
    if (lastColumn === 0 || lastRow === 1) {
      return [];
    }

    /*
     * Here we want to substract 1 from the number of rows to retrive (IMPORTANT: the third argument
     * to get range is not the ending row to retrieve, but rather the number of rows to retrieve).
     *
     * Consider the following example:
     *
     * Sheet total rows: 2
     * Sheet header row: row 1
     * Sheet data row: row 2
     * Rows to retrieve: 1
     *
     * So we should call:
     * sheet.getRange(2, 1, 1, <column count>)
     *
     * Another example:
     *
     * Sheet total rows: 10
     * Sheet header row: row 1
     * Sheet data row: row 2 - 10
     * Rows to retrieve: 9
     *
     * So we should call:
     * sheet.getRange(2, 1, 9, <column count>)
     */
    return sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
  },

  /**
   * Auto-resizes all columns on the specified sheet.
   *
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
   *      The sheet to resize all columns on.
   * @private
   */
  resizeAllColumns: function (sheet) {
    for (var i = 1; i <= sheet.getLastColumn(); i++) {
      sheet.autoResizeColumn(i);
    }
  },

};
