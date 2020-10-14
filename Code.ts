/* Menu Options */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Column Sync')
      .addItem("Sync form responses to Recruiter tab", 'syncColumns')
      .addToUi();
}

function syncColumns() {
  var spreadsheetName = "Form Responses (Transformed - Do not modify!)"
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var fromSheet = activeSpreadsheet.getSheetByName("Form Responses 4");
  var toSheet = activeSpreadsheet.getSheetByName("TESTSHEET");

  var range = fromSheet.getDataRange();
  var values = range.getValues();
  var fromHeaders = values[0];

  var toRange = toSheet.getDataRange();
  var headerToColumnIndex = {};
  var toHeaders = toRange.getValues()[0];
  var lastColIdx = 0;
  for (var i = 0; i < toHeaders.length; i++) {
    headerToColumnIndex[toHeaders[i]] = i;
    lastColIdx = Math.max(lastColIdx, i);
  }

  // get new headers and create rows to match
  var headerValues = [];
  for (var i = 0; i < values.length; i++) {
    for (var j = 0; j < values[i].length; j++) {
        var colIdx = headerToColumnIndex[fromHeaders[j]];
        if (!colIdx && colIdx !== 0) {
            // new answer, add to end
            colIdx = ++lastColIdx;
            headerToColumnIndex[fromHeaders[j]] = colIdx;
            Logger.log('Adding new column header ' + fromHeaders[j]);
        }
      }
    }
  for (var header in headerToColumnIndex) {
    headerValues[headerToColumnIndex[header]] = header;
  }
  // TODO: set color on new headers so we can tell if there's something weird.
  toSheet.getRange(1, 1, 1, headerValues.length).setValues([headerValues]);

  while (toSheet.getLastRow() - 1 < values.length) {
    // Add
    var emptyRow = new Array(fromSheet.getLastColumn() + toSheet.getLastColumn());
    emptyRow[0] = 'EMPTY';
    emptyRow[emptyRow.length - 1] = 'EMPTY';
    toSheet.appendRow(emptyRow);
    Logger.log('Append emptry row ' + emptyRow.length);
  }

  Logger.log(headerToColumnIndex);
  var curRowIdx = 1; // TODO: find first blank/non-synced row

  toRange = toSheet.getRange(1, 1, toSheet.getMaxRows(), toSheet.getMaxColumns());
  Logger.log('toRange.getLastRow:' + toRange.getLastRow() + " : getLastColumn" + toRange.getLastColumn());

  // Sync data
  var toValues = toRange.getValues();
  Logger.log('toValues:' + toValues.length + " : " + toValues[0].length);
  for (var i = curRowIdx; i < values.length; i++) {
      var row = "";
      for (var j = 0; j < values[i].length; j++) {
          if (values[i][j]) {
              row = row + values[i][j];
          }
          row = row + ",";
          var colIdx = headerToColumnIndex[fromHeaders[j]];
          Logger.log('updating ' + curRowIdx + ':' + colIdx + ' with ' + values[i][j]);
          // var cell = toRange.getCell(curRowIdx + 1, colIdx + 1);
          // Logger.log('updating cell ' + cell.getValue());
          toValues[curRowIdx][colIdx] = values[i][j];
      }
      curRowIdx++;
      Logger.log(row);
  }


  toSheet.getRange(1, 1, toValues.length, toValues[0].length).setValues(toValues);

}
