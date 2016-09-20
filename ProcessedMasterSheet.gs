var Model = Model || {};

/**
 * Constructs a new processed master sheet object, which will contain all information needed to
 * understand the master sheet, the categories of data that it contains (which need to be
 * exported), etc.
 *
 * @param {Object} categorySpecificSpreadsheets the object containing the
 *   CategorySpecificSpreadsheet objects, where the property name is the category identifier.
 * @param {Object[]} categories an array of all categories contained in the
 *                              categorySpecificSpreadsheets object. The category objects will
 *                              contain a method to indicate whether or not the category matches
 *                              and a property of 'categoryName'.
 * @param {Number} lastProcessedRowIndex the last row of the master sheet that was processed.  This
 *   will help to determine just how far the processing occurred within the master sheet given that
 *   at any time an additional entry could be added.  This value will be 0 based.  If there
 *   were no rows that were processed, this value should be set to -1.
 * @param {Model.MasterSheet} masterSheet the reference to the master sheet that
 *   all of the other fields were populated from.
 *
 * @see {@link Model.CategorySpecificSpreadsheet}
 * @constructor
 */
Model.ProcessedMasterSheet = function (categorySpecificSpreadsheets, categories,
                                       lastProcessedRowIndex, masterSheet) {
  this.categorySpecificSpreadsheets = categorySpecificSpreadsheets;
  this.categories = categories;
  this.lastProcessedRowIndex = lastProcessedRowIndex;
  this.masterSheet = masterSheet;
};
