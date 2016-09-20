var UUIDGenerator = {
  uuidKey: 'UUID',

  populateAnyMissingValuesInTheUUIDColumn: function (sheet) {
    if (!SheetUtility.doesColumnExist(sheet, this.uuidKey)) {
      UUIDGenerator.createUUIDColumn(sheet);
    }

    // if we're going to populate all of the rows, we need to get the last one
    // from the whole sheet (instead of from the UUID column, given that the
    // column might be missing some)
    var lastRow = sheet.getLastRow();
    var uuidColumnIndex = SheetUtility.getColumnIndexByName(sheet, this.uuidKey);
    var uuidGenerated = false;
    var range = sheet.getRange(1, uuidColumnIndex + 1, lastRow);
    var uuidData = range.getValues();

    for (var i = 0; i < uuidData.length; i++) {
      if (uuidData[i][0] === '') {
        uuidData[i][0] = Utilities.getUuid();
        uuidGenerated = true;
      }
    }

    // TODO: instead of resetting on the entire column, this could be simplified to only populate
    // the rows that are important.  This will likely cut down on a large number of updates
    if (uuidGenerated) {
      range.setValues(uuidData);
    }
  },

  createUUIDColumn: function (sheet) {
    var lastColumn = sheet.getLastColumn();
    var columnTitles = SheetUtility.getColumnTitlesAsArray(sheet);
    columnTitles.push(this.uuidKey);
    sheet.getRange(1, 1, 1, lastColumn + 1).setValues([columnTitles]);
  },
};
