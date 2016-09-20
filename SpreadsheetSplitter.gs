var DataProcessing = DataProcessing || {};

/**
 * Utility meant for splitting a single sheet out into separate spreadsheets based on a specific
 * category.
 */
DataProcessing.SpreadsheetSplitter = (function () {

  var _getFirstCategoryThatMatches = function (allAvailableCategories, headers, currentRow) {
    for (var i = 0; i < allAvailableCategories.length; i++) {
      if (allAvailableCategories[i].matches(headers, currentRow)) {
        return allAvailableCategories[i];
      }
    }

    return null;
  };

  /**
   * Splits the provided data into separate subsheets based on the specified categories.
   *
   * @param {GoogleAppsScript.Spreadsheet.Sheet} masterSheet the master sheet containing all of the
   *   data that will be split into multiple category specific sheets.  Note that this method will
   *   not change data in the masterSheet, but may add additional columns for tracking purposes.
   * @param {Object[]} allAvailableCategories
   *   Specifies all of the available categories to determine if the row within the master sheet
   *   will match the categories criteria.
   *
   * @returns {Model.ProcessedMasterSheet} a processed master sheet containing all of the
   *   information needed to export the data from the master sheet.
   */
  var _splitSpreadsheetsByCategories = function (masterSheet, allAvailableCategories) {
    _createExportedColumnIfMissing(masterSheet);
    var masterSheetData = new Model.MasterSheet(masterSheet);
    Utility.Debugger.debug('All master sheet data to be processed ' + masterSheetData.allData);

    var categorySpecificSpreadsheetHeaders = _getCategorySpecificSpreadsheetHeaders(
      masterSheetData.headers);
    var categorySpecificSpreadsheets = {};
    var allCategoriesForExporting = [];
    var lastExportedRowIndex = -1;

    masterSheetData.allData.forEach(function (currentRow, currentRowIndex) {

      if (!currentRow[masterSheetData.exportedColumnIndex]) {
        var categoryForRow = _getFirstCategoryThatMatches(allAvailableCategories,
                                                          masterSheetData.headers, currentRow);
        if (categoryForRow === null) {
          return;
        }

        if (categorySpecificSpreadsheets[categoryForRow.categoryName] === undefined) {
          allCategoriesForExporting.push(categoryForRow);

          categorySpecificSpreadsheets[categoryForRow.categoryName] =
            new Model.CategorySpecificSpreadsheet(categoryForRow.categoryName,
              masterSheetData.parentFolder, categorySpecificSpreadsheetHeaders);
        }

        categorySpecificSpreadsheets[categoryForRow.categoryName].dataToExport.push(
          currentRow.filter(function (element, index) {
            return index !== masterSheetData.exportedColumnIndex;
          }));

        // we always add 1 to the currentRowIndex because we are starting our range of
        // data by ignoring the headers.
        lastExportedRowIndex = Math.max(lastExportedRowIndex, currentRowIndex + 1);
      }
    });

    return new Model.ProcessedMasterSheet(categorySpecificSpreadsheets, allCategoriesForExporting,
      lastExportedRowIndex, masterSheetData);
  };

  /**
   * Takes the headers from the master sheet and pulls out the relevant headers for category
   * specific spreadsheets.
   *
   * @param {Array} masterSheetHeaders the headers that show up in the master.  This array is not
   *   modified.
   * @private
   */
  var _getCategorySpecificSpreadsheetHeaders = function (masterSheetHeaders) {
    return masterSheetHeaders.filter(function (element) {
      return element !== GlobalConfig.exportedColumnKey;
    });
  };

  /**
   * Adds a column to the specified master sheet to track whether or not the item was exported.
   *
   * @param {GoogleAppsScript.Spreadsheet.Sheet} masterSheet the master sheet to add the
   *   exported column to.
   * @private
   */
  var _createExportedColumnIfMissing = function (masterSheet) {
    if (SheetUtility.getColumnIndexByName(masterSheet, GlobalConfig.exportedColumnKey) == -1) {
      SheetUtility.createColumn(masterSheet, GlobalConfig.exportedColumnKey);
    }
  };

  return {
    splitSpreadsheetByCategories: _splitSpreadsheetsByCategories,
  };
})();
