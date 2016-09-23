var GlobalConfig = {
  /**
   * The suffix that will be appended to the end of the scripts that get created
   * when the data is being sectioned out into separate spreadsheets.
   */
  categorySpecificSpreadsheetSuffix: '-ME-2016-Registrations',

  /**
   * The spreadsheet that contains the survey responses that will ultimately
   * trigger events based on form submissions.
   */
  spreadsheetIdToAttachTo: '1vKAiNCUYOxQZIBM_6dl_0mpodyRexWDWHUetujS6-s4',

  /**
   * Column key to store the unique identifier of each submission.
   */
  uuidColumnKey: 'UUID',

  /**
   * The column that is used to indicate in the master that the entry has been
   * exported to the subsequent sheet.
   */
  exportedColumnKey: 'Exported',

  /**
   * The master sheet name.
   *
   * {String}
   */
  masterSheetName: 'Master',

  /**
   * The aggregate sheet name.
   *
   * {String}
   */
  aggregateSheetName: 'Aggregate',

  /**
   * All of the admins that will be added the ability to edit protected cells.
   *
   * {String[]}
   */
  admins: ['dustin.singleton@cerner.com', 'heemstrs@gmail.com', 'john.w.payton@gmail.com'],
};

//noinspection JSUnusedGlobalSymbols
/**
 * This is a method that can only be called once to add the trigger to the spreadsheet/form.
 * This should not be executed more than once because it will add multiple triggers to the google
 * sheet and the behavior becomes very erradic at that point.
 */
function installTrigger() {
  var currentSpreadSheet = SpreadsheetApp.openById(GlobalConfig.spreadsheetIdToAttachTo);
  ScriptApp.newTrigger('spreadsheetOpened').forSpreadsheet(currentSpreadSheet).onOpen().create();
}

function debugGenerateAggregateSheet() {
  var currentSpreadSheet = SpreadsheetApp.openById(GlobalConfig.spreadsheetIdToAttachTo);
  Main.UIHandler.generateAggregateSheet(currentSpreadSheet);
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} e.source the spreadsheet that was opened.
 */
function spreadsheetOpened(e) {
  Main.UIHandler.createMenus(e.source);
}

function generateAggregateSheet() {
  Main.UIHandler.generateAggregateSheet(SpreadsheetApp.openById(GlobalConfig.spreadsheetIdToAttachTo));
}

function exportResults() {
  Main.SubmissionHandler.reExportResults();
}

function copyCampusInfoToCampusSheets(date) {
  var sheetName = 'Campus Info';
  var originalSheet = SpreadsheetApp.openById(GlobalConfig.spreadsheetIdToAttachTo).getSheetByName(sheetName);
  var spreadsheet = SpreadsheetApp.openById(GlobalConfig.spreadsheetIdToAttachTo);
  var masterSheet = spreadsheet.getSheetByName(GlobalConfig.masterSheetName);
  var allAvailableCategories = Model.CategoryFactory.createAllCategories();
  Model.CategoryFactory.associateSpreadsheetsToAllCategories(allAvailableCategories, masterSheet);
  allAvailableCategories.forEach(function (element) {
    var existingSheet = element.spreadsheet.getSheetByName(sheetName);
    if (existingSheet !== null) {
      element.spreadsheet.deleteSheet(existingSheet);
    }

    var copiedSheet = originalSheet.copyTo(element.spreadsheet).setName(sheetName);
    copiedSheet.getRange(1, 2).setValue(element.campusLocationName);
    copiedSheet.getRange(1, 1, 2, 2).protect().addEditors(GlobalConfig.admins);
    copiedSheet.getParent().addEditors(GlobalConfig.admins);
    if (date) {
      copiedSheet.getRange(2, 2).setValue(date);
    }
  });
};

var Main = Main || {};

Main.SubmissionHandler = (function () {
  var _reExportResults = function () {
    var currentSpreadSheet = SpreadsheetApp.openById(GlobalConfig.spreadsheetIdToAttachTo);

    // always assume first sheet from master contains survey responses
    var masterSheet = currentSpreadSheet.getSheets()[0];
    UUIDGenerator.populateAnyMissingValuesInTheUUIDColumn(masterSheet);

    var allAvailableCategories = Model.CategoryFactory.createAllCategories();

    var processedMasterSheet = DataProcessing.SpreadsheetSplitter.splitSpreadsheetByCategories(
      masterSheet, allAvailableCategories);
    DataProcessing.CategorySpecificSpreadsheetPopulator.populateCategorySpecificSpreadsheets(
      processedMasterSheet);
    DataProcessing.ExportedColumnPopulator.populateExportedColumn(processedMasterSheet);

    var date = new Date();
    currentSpreadSheet.getSheetByName('Campus Info').getRange(2, 2).setValue(date);
    copyCampusInfoToCampusSheets(date);
  };

  return {
    reExportResults: _reExportResults,
  };
})();

Main.UIHandler = (function () {
  /**
   * Adds the menu to the specified spreadsheet.
   *
   * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet
   *      The spreadsheet to create the menu for.
   * @private
   */
  var _createMenus = function (spreadsheet) {
    var menuText = 'Main Event Registration Actions';
    spreadsheet.removeMenu(menuText);
    var menus = [];

    menus.push({ name: 'Update Aggregate Sheet', functionName: 'generateAggregateSheet' });
    menus.push(null);
    menus.push({ name: 'Copy Campus Info To Campus Sheets', functionName: 'copyCampusInfoToCampusSheets' });
    menus.push(null);
    menus.push({ name: 'Re-Export Results', functionName: 'exportResults' });

    spreadsheet.addMenu(menuText, menus);
  };

  var _generateAggregateSheet = function (spreadsheet) {
    var masterSheet = spreadsheet.getSheetByName(GlobalConfig.masterSheetName);
    var aggregateSheet = spreadsheet.getSheetByName(GlobalConfig.aggregateSheetName);
    if (aggregateSheet === null) {
      aggregateSheet = spreadsheet.insertSheet(GlobalConfig.aggregateSheetName, spreadsheet.getNumSheets());
    }

    UUIDGenerator.populateAnyMissingValuesInTheUUIDColumn(masterSheet);
    var allAvailableCategories = Model.CategoryFactory.createAllCategories();
    Model.CategoryFactory.associateSpreadsheetsToAllCategories(allAvailableCategories, masterSheet);

    var firstCategoryHeaders = SheetUtility.getColumnTitlesAsArray(
      allAvailableCategories[0].spreadsheet.getSheetByName('Data'));
    var allValues = [];
    allValues.push(firstCategoryHeaders);

    for (var i = 0; i < allAvailableCategories.length; i++) {
      var categorySheetData = SheetUtility.getSheetData(
        allAvailableCategories[i].spreadsheet.getSheetByName('Data'));

      for (var j = 0; j < categorySheetData.length; j++) {
        allValues.push(categorySheetData[j]);
      }
    }

    aggregateSheet.clearContents();
    aggregateSheet.getRange(1, 1, allValues.length, firstCategoryHeaders.length)
                  .setValues(allValues);
    if (!SheetUtility.doesColumnExist(masterSheet, GlobalConfig.exportedColumnKey)) {
      SheetUtility.createColumn(masterSheet, GlobalConfig.exportedColumnKey);
    }

    aggregateSheet.setFrozenRows(1);
    aggregateSheet.setFrozenColumns(10);

    aggregateSheet.hideColumns(6, 3);
    aggregateSheet.hideColumns(13, 1);
    aggregateSheet.hideColumns(16, 1);
    aggregateSheet.hideColumns(19, 1);
    aggregateSheet.hideColumns(21, 1);
    aggregateSheet.hideColumns(24, 1);
    aggregateSheet.hideColumns(26, 36);

    aggregateSheet.getRange('A2:D').setBackground('#ffe599');
    aggregateSheet.getRange('I2:J').setBackground('#d9d9d9');
    aggregateSheet.getRange(1, 1, 1, aggregateSheet.getLastColumn()).setBackground('#d9d9d9');

    SheetUtility.boldHeaders(aggregateSheet);
    SheetUtility.resizeAllColumns(aggregateSheet);

    return;
  };

  return {
    createMenus: _createMenus,
    generateAggregateSheet: _generateAggregateSheet
  };
})();
