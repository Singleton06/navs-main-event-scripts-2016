var Model = Model || {};

/**
 * Constructor to create a new MasterSheet object.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} masterSheet the master sheet to pull all of the
 *                                                         configuration from to construct the
 *                                                         MasterSheet object.
 * @constructor
 * @classdesc The MasterSheet object represents data that all of the sub-sheets will be populated
 *   from.  Essentially, this is the sheet where all data is initially dropped into and will then
 *   be separated out in category specific sheets.
 */
Model.MasterSheet = function (masterSheet) {

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
  var _getParentFolderOfMasterSpreadsheet = function (masterSpreadsheetToGetParentFrom) {
    var parentFoldersIterator = DriveApp.getFileById(
      masterSpreadsheetToGetParentFrom.getId()).getParents();

    if (!parentFoldersIterator.hasNext()) {
      throw 'Could not find parent folder for spreadsheet ' +
      masterSpreadsheetToGetParentFrom.getName()
      + ', is it in a directory?';
    }

    var parentFolder = parentFoldersIterator.next();
    if (parentFoldersIterator.hasNext()) {
      throw 'Multiple parent folders found for spreadsheet '
      + masterSpreadsheetToGetParentFrom.getName()
      + ', parent folder to use to create other spreadsheets could not be determined '
      + '(given there should only be one parent folder)';
    }

    return parentFolder;
  };

  /**
   * Retrieves all data from the master spreadsheet, excluding the headers as a two
   * dimensional array of values.
   *
   * @param masterSheet {GoogleAppsScript.Spreadsheet.Sheet} The master sheet to pull all of the
   *                                                        data from.
   * @returns {Object[][]} all of the data contained in the master sheet.
   * @private
   */
  var _getMasterSpreadsheetData = function (masterSheet) {
    var lastColumn = masterSheet.getLastColumn();
    var lastRow = masterSheet.getLastRow();

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
    return masterSheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
  };

  /**
   * A reference to the sheet object that the MasterSheet object was built from.
   *
   * @property
   * @type {GoogleAppsScript.Spreadsheet.Sheet}
   */
  this.sheet = masterSheet;

  /**
   * A reference to the spreadsheet containing the MasterSheet object.
   *
   * @type {GoogleAppsScript.Spreadsheet.Spreadsheet}
   */
  this.spreadsheet = masterSheet.getParent();

  /**
   * An array of the headers that are on the master sheet.  These will be indexed starting with a 0
   * value (such that the 0th entry corresponds to the 1st entry in the sheet).
   *
   * @type {Array}
   */
  this.headers = SheetUtility.getColumnTitlesAsArray(masterSheet);

  /**
   * Represents the exported column index, which is used for determining whether or not a submission
   * within the master sheet has already been exported into sub-sheets.  This value will be 0 based.
   *
   * @type {number}
   */
  this.exportedColumnIndex = this.headers.indexOf(GlobalConfig.exportedColumnKey);

  /**
   * 2-dimensional array representing all of the information in the MasterSheet.  This information
   * will not include headers (and will assume that the first column only is the headers).  The
   * missing entries can be found in the headers field.
   *
   * @type {Object[][]}
   */
  this.allData = _getMasterSpreadsheetData(masterSheet);

  /**
   * The parent folder that contains the master sheet.  There will only be one parent for the master
   * sheet.
   *
   * @type {GoogleAppsScript.Drive.Folder}
   */
  this.parentFolder = _getParentFolderOfMasterSpreadsheet(this.spreadsheet);
};
