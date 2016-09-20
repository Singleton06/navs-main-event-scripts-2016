var Model = Model || {};

/**
 * Model object representing a spreadsheet's data that is specific to a single category.  This
 * sheet can be used to contain information that will at a later time be added to this specific
 * sheet.
 *
 * @param {String} category The category name that the category specific spreadsheet pertains to.
 * @param {GoogleAppsScript.Drive.Folder} parentFolder the parent folder that should contain the
 *   spreadsheet.
 * @param {String[]} headers the headers that the category specific spreadsheet should contain.
 * @constructor
 */
Model.CategorySpecificSpreadsheet = function (category, parentFolder, headers) {
  Utility.Debugger.debug('CategorySpecificSpreadsheet constructor called with values: category: ['
                         + category + '] parentFolder with name: [' + parentFolder.getName()
                         + '] headers: [' + headers + ']');

  /**
   * The category name that the category specific spreadsheet pertains to.
   *
   * @type {String}
   */
  this.category = category;

  /**
   * The spreadsheet that is supposed to contain the category specific information.  Note that this
   * does not necessarily mean at this point that the spreadsheet contains any category specific
   * information yet.  It could be empty.
   *
   * @type {GoogleAppsScript.Spreadsheet.Spreadsheet}
   */
  this.spreadsheet =
    Utility.CategorySpecificSpreadsheetUtility.retrieveCategorySpecificSpreadsheet(category,
                                                                                   parentFolder,
                                                                                   headers);

  /**
   * An array of all of the data that will need to be exported.  This will start off as an empty
   * array, but can be used as a place to collection information specific to this category
   * that can be added to the spreadsheet.
   *
   * @type {Object[]}
   */
  this.dataToExport = [];
};
