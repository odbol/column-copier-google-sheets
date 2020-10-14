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

  var toRange = toSheet.getDataRange();
  var headerToColumnIndex = {};
  var toHeaders = toRange.getValues()[0];
  var lastColIdx = 0;
  for (var i = 0; i < toHeaders.length; i++) {
    headerToColumnIndex[toHeaders[i]] = i;
    lastColIdx = Math.max(lastColIdx, i);
  }
  Logger.log(headerToColumnIndex);
  var curRowIdx = 1; // TODO: find first blank/non-synced row

  var range = fromSheet.getDataRange();
  var values = range.getValues();

    Logger.log('toSheet.getLastRow:' + toSheet.getLastRow() + " : rangelength" + toRange.getValues().length + " < " + values.length);
  while (toSheet.getLastRow() - 1 < values.length) {
    var emptyRow = new Array(fromSheet.getLastColumn());
    emptyRow[0] = 'EMPTY';
    emptyRow[emptyRow.length - 1] = 'EMPTY';
    toSheet.appendRow(emptyRow);
    Logger.log('Append emptry row ' + emptyRow.length);
  }
  toRange = toSheet.getDataRange();

  // This logs the spreadsheet in CSV format with a trailing comma
  var fromHeaders = values[0];
  for (var i = 1; i < values.length; i++) {
    var row = "";
    for (var j = 0; j < values[i].length; j++) {
      if (values[i][j]) {
        row = row + values[i][j];
      }
      row = row + ",";

      var colIdx = headerToColumnIndex[fromHeaders[j]];
      if (!colIdx && colIdx !== 0) {
        // new answer, add to end
        // TODO
        colIdx = ++lastColIdx;
        headerToColumnIndex[fromHeaders[j]] = colIdx;
      }
      Logger.log('updating ' + curRowIdx + ':' + colIdx + ' with ' + values[i][j]);
      var cell = toRange.getCell(curRowIdx + 1, colIdx + 1);
      cell.setValue(values[i][j]);
    }
    curRowIdx++;
    Logger.log(row);
  }


}
