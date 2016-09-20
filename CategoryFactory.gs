var Model = Model || {};

Model.CategoryFactory = (function () {

  var _associateSpreadsheetsToAllCategories = function (categories, masterSheet) {
    var masterSheetHeaders = SheetUtility.getColumnTitlesAsArray(masterSheet);
    var categorySpecificHeaders =
      Utility.CategorySpecificSpreadsheetUtility.getCategorySpecificSpreadsheetHeaders(
        masterSheetHeaders);
    var parentFolder = SheetUtility.getParentFolderOfSpreadsheet(masterSheet.getParent());

    categories.forEach(function (element) {
      element.spreadsheet =
        Utility.CategorySpecificSpreadsheetUtility.retrieveCategorySpecificSpreadsheet(
          element.categoryName,
          parentFolder,
          categorySpecificHeaders);

    });
  };

  var _createAllCategories = function () {
    var categories = [];
    categories.push(new Model.CampusLocationCategory('CedarRapids', 'Cedar Rapids'));
    categories.push(new Model.CampusLocationCategory('CentralMethodistUniversity', 'Central Methodist University'));
    categories.push(new Model.CampusLocationCategory('CreightonUniversity', 'Creighton University'));
    categories.push(new Model.CampusLocationCategory('DMACC', 'DMACC'));
    categories.push(new Model.CampusLocationCategory('DordtCollege', 'Dordt College'));
    categories.push(new Model.CampusLocationCategory('DrakeUniversity', 'Drake University'));
    categories.push(new Model.CampusLocationCategory('IowaStateUniversity', 'Iowa State University'));
    categories.push(new Model.CampusLocationCategory('KansasStateUniversity', 'Kansas State University'));
    categories.push(new Model.CampusLocationCategory('MidlandUniversity', 'Midland University'));
    categories.push(new Model.CampusLocationCategory('MissouriWesternStateUniversity',
      'Missouri Western State University'));
    categories.push(new Model.CampusLocationCategory('NorthwestMissouriStateUniversity',
      'Northwest Missouri State University'));
    categories.push(new Model.CampusLocationCategory('TaborCollege&SterlingCollege',
      'Tabor College & Sterling College'));
    categories.push(new Model.CampusLocationCategory('UniversityofCentralMissouri', 'University of Central Missouri'));
    categories.push(new Model.CampusLocationCategory('UniversityofKansas', 'University of Kansas'));
    categories.push(new Model.CampusLocationCategory('UniversityofMissouri', 'University of Missouri'));
    categories.push(new Model.CampusLocationCategory('UniversityofNebraska-Kearney', 'University of Nebraska-Kearney'));
    categories.push(new Model.CampusLocationCategory('UniversityofNebraska-Lincoln', 'University of Nebraska-Lincoln'));
    categories.push(new Model.CampusLocationCategory('UniversityofNorthernIowa', 'University of Northern Iowa'));
    categories.push(new Model.CampusLocationCategory('WichitaStateUniversity', 'Wichita State University'));
    categories.push(new Model.CampusLocationCategory('Other', 'Other'));

    return categories;
  };

  return {
    createAllCategories: _createAllCategories,
    associateSpreadsheetsToAllCategories: _associateSpreadsheetsToAllCategories
  };
})();
