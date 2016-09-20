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

  // TODO: refactor this, possibly just remove it
  var _setFormulasForData = function (sheet, dataToExport) {
    var formulaBaseRowIndex = sheet.getLastRow() + 1;
    var followUpTypeIndex = 20;
    var lcStudyLeaderIndex = 25;
    var regionIndex = 26;
    var ministryAreaIndex = 27;

    dataToExport.forEach(function (row, index) {
      var formulaRowIndex = formulaBaseRowIndex + index;

      row[followUpTypeIndex] = '= if(Q' + formulaRowIndex + '="yes", "Bridge, ", "") & '
        + 'if(R' + formulaRowIndex + '="yes", "BS, ", "") & if(S' +
        formulaRowIndex + '="yes", "E-List, ", "")';
      row[lcStudyLeaderIndex] =
        '=iferror(VLOOKUP(V' + formulaRowIndex + ', LeadershipCommunity!A2:F, 4), "")';
      row[regionIndex] =
        '=iferror(VLOOKUP(V' + formulaRowIndex + ', LeadershipCommunity!A2:F, 5), "")';
      row[ministryAreaIndex] =
        '=iferror(VLOOKUP(V' + formulaRowIndex + ', LeadershipCommunity!A2:F, 6), "")';
    });
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
      _setFormulasForData(sheet, categorySpecificSheet.dataToExport);
      var sheetDataRange =
        _getDataRangeFromCategorySpecificSheet(sheet, categorySpecificSheet.dataToExport);

      sheetDataRange.setValues(categorySpecificSheet.dataToExport);

      var assignmentIdentifierRange = categorySpecificSheet.spreadsheet.getRange(
        'LeadershipCommunity!A2:A');
      var assignmentIdentifiersRule = SpreadsheetApp.newDataValidation()
                                                    .requireValueInRange(assignmentIdentifierRange)
                                                    .build();
      sheet.getRange('V2:V').setDataValidation(assignmentIdentifiersRule);
    });
  };

  return {
    populateCategorySpecificSpreadsheets: _populateCategorySpecificSpreadsheets
  };
})();
