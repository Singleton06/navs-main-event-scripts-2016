var DataProcessing = DataProcessing || {};

DataProcessing.CategorySpecificSpreadsheetPopulator = (function () {

  /**
   * Uses the category specific sheet to determine which range should be retrieved from the
   * spreadsheet for adding.
   *
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet the sheet to get the range from.
   * @param {Object[]} dataToExport the data to be exported to the specificed sheet.
   * @returns {GoogleAppsScript.Spreadsheet.Range} the range where the data should be added.
   * @private
   */
  var _getDataRangeFromCategorySpecificSheet = function (sheet, dataToExport) {
    // Given that we are appending data, we want to start 1 row after the current last row
    var sheetRowStart = sheet.getLastRow() + 1;
    var rowCount = dataToExport.length;
    var dataColumnCount = dataToExport[0].length;

    var sheetDataRange = sheet.getRange(sheetRowStart, 1, rowCount, dataColumnCount);
    return sheetDataRange;
  };

  /**
   * Takes the processed master sheet and populates the data into all of the category specific
   * sheets.
   *
   * @param {Model.ProcessedMasterSheet} processedMasterSheet the processed master sheet to use to
   *   populate category specific sheets.
   * @private
   */
  var _populateCategorySpecificSpreadsheets = function (processedMasterSheet) {
    processedMasterSheet.categories.forEach(function (category) {
      var categorySpecificSheet =
        processedMasterSheet.categorySpecificSpreadsheets[category.categoryName];

      if (categorySpecificSheet === undefined || categorySpecificSheet.dataToExport === []) {
        return;
      }

      var sheet = categorySpecificSheet.spreadsheet.getSheets()[0];
      var sheetDataRange =
        _getDataRangeFromCategorySpecificSheet(sheet, categorySpecificSheet.dataToExport);

      sheetDataRange.setValues(categorySpecificSheet.dataToExport);
    });
  };

  return {
    populateCategorySpecificSpreadsheets: _populateCategorySpecificSpreadsheets
  };
})();
