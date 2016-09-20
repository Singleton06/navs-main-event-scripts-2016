var Model = Model || {};

/**
 * Constructs a new category specifically for categories based off of the campus location.
 *
 * @param {String} categoryName
 *      The category name, used when identifying the category and even creating a spreadsheet
 *      for it.
 * @param {String} campusLocationName
 *      The name of the campus location that this specific category will match to.
 * @constructor
 */
Model.CampusLocationCategory = function (categoryName, campusLocationName) {

  /**
   * Determines whether or not the current entry matches the specified value.
   *
   * @param {String[]} headers
   *    The headers, which will help to associate the values in the rowToMatch parameter with the
   *    meaning of the values.  Basically, the 0th value in the headers would match the 0th value
   *    in the rowToMatch.
   * @param rowToMatch
   *    The row that the current match is being performed on.  This value and the corresponding
   *    header should be checked to determined if the value matches.
   *
   * @return {boolean} true if the entry in the rowToMatch parameter should be included in this
   *    category, false otherwise.
   */
  this.matches = function (headers, rowToMatch) {
    var campusLocationHeaderIndex = headers.indexOf('Campus Location');

    // sanity check, if the index is missing, we just indicate that it is not a match.
    if (campusLocationHeaderIndex === -1) {
      return false;
    }

    var campusLocationValue = rowToMatch[campusLocationHeaderIndex];

    return this.campusLocationName === campusLocationValue;
  };

  /**
   * The category name, used when identifying the category and even creating a spreadsheet
   * for it.
   *
   * @type {String}
   */
  this.categoryName = categoryName;

  /**
   *  The name of the campus location that this specific category will match to.
   *
   * @type {String}
   */
  this.campusLocationName = campusLocationName;

  /**
   * The spreadsheet associated to this category.  This value might not be initialized and should
   * be accessed defensively.
   *
   * @type {null|GoogleAppsScript.Spreadsheet.Spreadsheet}
   */
  this.spreadsheet = null;
};
