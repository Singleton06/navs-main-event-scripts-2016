var Utility = Utility || {};

Utility.CategorySpecificSpreadsheetUtility = (function () {

  /**
   * Retrieves the existing spreadsheet based on th e provided parent folder and spreadsheet name.
   * If no spreadsheet can be found, null will be returned.
   *
   * @param {GoogleAppsScript.Drive.Folder} parentFolder the parent folder to search within when
   *   looking for the spreadsheet.
   * @param {string} spreadsheetName the name of the spreadsheet to retrieve.
   * @returns {null|GoogleAppsScript.Spreadsheet.Spreadsheet} if a spreadsheet can be found, the
   *            spreadsheet will be returned, otherwise null will be returned.
   * @private
   */
  var _getExistingSpreadsheet = function (parentFolder, spreadsheetName) {
    var spreadsheetIterator = parentFolder.getFilesByName(spreadsheetName);
    if (spreadsheetIterator.hasNext()) {
      var spreadsheet = SpreadsheetApp.openById(spreadsheetIterator.next().getId());

      if (spreadsheetIterator.hasNext()) {
        throw 'Found more than one spreadsheet with the same name of [' + spreadsheetName +
        '] within the parent folder [' + parentFolder.getName() + '].';
      }

      return spreadsheet;
    }

    return null;
  };

  /**
   * Constructs the spreadsheet name that will be used specifically for this category.
   *
   * @param {string} spreadsheetCategoryName The category name of the spreadsheet.
   * @returns {string} The full name of the spreadsheet that should be used for this category.
   * @private
   */
  var _constructCategorySpreadsheetName = function (spreadsheetCategoryName) {
    return spreadsheetCategoryName + GlobalConfig.categorySpecificSpreadsheetSuffix;
  };

  /**
   * Removes all parent folders from the specified spreadsheet.  This is useful because by default
   * when app-script creates a new file, it will have a parent as the user's 'My Drive'.
   *
   * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet the spreadsheet to remove all
   *                                                               parent folders from.
   * @private
   */
  var _removeAllParentFoldersFromSpreadsheet = function (spreadsheet) {
    var file = DriveApp.getFileById(spreadsheet.getId());
    var parentFolderIterator = file.getParents();
    while (parentFolderIterator.hasNext()) {
      parentFolderIterator.next().removeFile(file);
    }
  };

  var _getColumnHeaderWeights = function (headers) {
    var columnHeaderWeights = [];
    for (var i = 0; i < headers.length; i++) {
      columnHeaderWeights.push('bold');
    }

    return columnHeaderWeights;
  };

  /**
   * Creates a new spreadsheet in the specified folder with the given name and the starting
   * headers.
   *
   * @param {GoogleAppsScript.Drive.Folder} parentFolder the parent folder to store the newly
   *   created spreadsheet.  All other parents will be removed from the newly created spreadsheet.
   * @param {string} spreadsheetName The name of the spreadsheet to create.
   * @param {Array} headers The headers that will be a part of the newly created spreadsheet.
   *
   * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet} the spreadsheet that was created.
   * @private
   */
  var _createNewSpreadsheet = function (parentFolder, spreadsheetName, headers) {
    var newSpreadsheet = SpreadsheetApp.create(spreadsheetName);
    var dataSheet = newSpreadsheet.getSheets()[0].setName('Data');

    _removeAllParentFoldersFromSpreadsheet(newSpreadsheet);
    parentFolder.addFile(DriveApp.getFileById(newSpreadsheet.getId()));
    newSpreadsheet.appendRow(headers);

    dataSheet.hideColumns(6, 3);
    dataSheet.hideColumns(13, 1);
    dataSheet.hideColumns(16, 4);
    dataSheet.hideColumns(19, 1);
    dataSheet.hideColumns(21, 1);
    dataSheet.hideColumns(24, 1);
    dataSheet.hideColumns(26, 36);

    // hide UUID column
    dataSheet.hideColumns(65, 1);

    dataSheet.getParent().addEditors(GlobalConfig.admins);
    dataSheet.getRange('F:H').protect().addEditors(GlobalConfig.admins);
    dataSheet.getRange('K:BM').protect().addEditors(GlobalConfig.admins);
    dataSheet.getRange('A2:C').setBackground('#ffe599');
    dataSheet.getRange(1, 1, 1, dataSheet.getLastColumn()).setBackground('#d9d9d9');

    // Freeze all the way to column 10 because we hide 3 of the first column
    dataSheet.setFrozenColumns(10);
    dataSheet.setFrozenRows(1);

    SheetUtility.boldHeaders(dataSheet);

    return newSpreadsheet;
  };

  /**
   *
   * @param {String} category the string representing the category.
   * @param {GoogleAppsScript.Drive.Folder} parentFolder the parent folder that contains the
   *   spreadsheet.
   * @param {String[]} headers the headers that the category specific spreadsheet contains.
   * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet} the spreadsheet that is supposed to
   *   contain the category specific information.  Note that this does not necessarily mean at this
   *   point that the spreadsheet contains any category specific information yet.  It could be
   *   empty.
   * @private
   */
  var _retrieveCategorySpecificSpreadsheet = function (category, parentFolder, headers) {
    var spreadsheetName = _constructCategorySpreadsheetName(category);
    var existingSpreadsheet = _getExistingSpreadsheet(parentFolder, spreadsheetName);
    if (existingSpreadsheet === null) {
      return _createNewSpreadsheet(parentFolder, spreadsheetName, headers);
    }

    return existingSpreadsheet;
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

  return {
    constructCategorySpreadsheetName: _constructCategorySpreadsheetName,
    removeAllParentFoldersFromSpreadsheet: _removeAllParentFoldersFromSpreadsheet,
    createNewSpreadsheet: _createNewSpreadsheet,
    retrieveCategorySpecificSpreadsheet: _retrieveCategorySpecificSpreadsheet,
    getExistingSpreadsheet: _getExistingSpreadsheet,
    getCategorySpecificSpreadsheetHeaders: _getCategorySpecificSpreadsheetHeaders
  };

})();
