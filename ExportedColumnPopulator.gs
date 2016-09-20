var DataProcessing = DataProcessing || {};

DataProcessing.ExportedColumnPopulator = (function () {

  /**
   * Given the size of data to create, an array will be created and returned that can be used to
   * set on the exported column of all {@code true} values given that the Master sheet's last
   * exported column should be considered exported.
   *
   * @param {number} size The size of the data to generate.
   * @returns {boolean[]} an array of true values to indicate that the rows were processed.
   * @private
   */
  var _dataToPopulate = function (size) {
    var data = [];
    for (var index = 0; index < size; index++) {
      data[index] = [true];
    }

    return data;
  };

  /**
   * Populates the exported column on the master sheet based on the data contained within the
   * {@link Model.ProcessedMasterSheet}.
   *
   * @param {Model.ProcessedMasterSheet} processedMasterSheet the processed master sheet to read
   *   from when determining what fields to populate.
   */
  var _populateExportedColumn = function (processedMasterSheet) {
    var lastProcessedRowIndex = processedMasterSheet.lastProcessedRowIndex;
    if (lastProcessedRowIndex === -1) {
      return;
    }

    lastProcessedRowIndex = lastProcessedRowIndex === 0 ? 1 : lastProcessedRowIndex;

    var exportedColumnIndex = processedMasterSheet.masterSheet.exportedColumnIndex + 1;
    var sheet = processedMasterSheet.masterSheet.sheet;

    var data = _dataToPopulate(lastProcessedRowIndex);
    sheet.getRange(2, exportedColumnIndex, lastProcessedRowIndex, 1).setValues(data);
  };

  return {
    populateExportedColumn: _populateExportedColumn
  };
})();
