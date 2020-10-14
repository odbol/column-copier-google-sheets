/* Menu Options */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Column Sync')
      .addItem("Sync form responses to Recruiter tab", 'syncColumns')
      .addSeparator()
      .addSubMenu(
        ui.createMenu("Admin")
          .addItem("Set up columns", 'prepareInterstitialSheet')
      )
      .addToUi();
}

function getFromSheet(): GoogleAppsScript.Spreadsheet.Sheet {
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return activeSpreadsheet.getSheetByName("Form Responses 4");
}

function getToSheet(): GoogleAppsScript.Spreadsheet.Sheet {
  var spreadsheetName = "Form Responses (Transformed - Do not modify!)"
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return activeSpreadsheet.getSheetByName("TESTSHEET");
}

function fillSheetWithEmptyRows(numRows: number, toSheet: GoogleAppsScript.Spreadsheet.Sheet, fromSheet: GoogleAppsScript.Spreadsheet.Sheet) {
  // Ensure we have enough rows!
  const numRowsToAdd = numRows - toSheet.getLastRow();
  if (numRowsToAdd < 0) return;

  // Because Sheets API is stupid, we need to insert a bunch of empty rows,
  // then fill the last one with actual values so it can set the values on the empty ones later.
  toSheet.insertRowsAfter(toSheet.getLastRow(), numRowsToAdd);
  var emptyRow = new Array(fromSheet.getLastColumn() + toSheet.getLastColumn());
  emptyRow[0] = 'EMPTY';
  emptyRow[emptyRow.length - 1] = 'EMPTY';
  toSheet.getRange(numRows, 1, 1, emptyRow.length).setValues([emptyRow]);
}

function createHeaderToColumnIndex(toSheet: GoogleAppsScript.Spreadsheet.Sheet, fromSheet: GoogleAppsScript.Spreadsheet.Sheet) {
  var range = fromSheet.getDataRange();
  var values = range.getValues();
  var fromHeaders = values[0];

  var toRange = toSheet.getDataRange();
  var headerToColumnIndex = {};
  var toHeaders = toRange.getValues()[0];
  var lastOriginalToColIdx = 0;
  for (var i = 0; i < toHeaders.length; i++) {
    if (toHeaders[i] && toHeaders[i].length > 0) {
      headerToColumnIndex[toHeaders[i]] = i;
      lastOriginalToColIdx = Math.max(lastOriginalToColIdx, i);
    }
  }

  // get new headers and create rows to match
  var headerValues = [];
  var lastColIdx = lastOriginalToColIdx;
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
  const headerRange = toSheet.getRange(1, 1, 1, headerValues.length);
  headerRange.setValues([headerValues]);
  // Set color on new headers so we can tell if there's something weird.
  const firstNewColIdex = lastOriginalToColIdx + 1;
  if (headerValues.length - firstNewColIdex > 0) {
    toSheet.getRange(1, firstNewColIdex + 1, 1, headerValues.length - firstNewColIdex).setBackgroundRGB(255, 210, 255);
  }

  Logger.log(headerToColumnIndex);

  return headerToColumnIndex;
}


function syncColumns() {
  var fromSheet = getFromSheet();
  var toSheet = getToSheet();


  var range = fromSheet.getDataRange();
  var values = range.getValues();
  var fromHeaders = values[0];

  var headerToColumnIndex = createHeaderToColumnIndex(toSheet, fromSheet);

  var curRowIdx = 1; // TODO: find first blank/non-synced row?

  var toRange = toSheet.getRange(1, 1, toSheet.getMaxRows(), toSheet.getMaxColumns());
  Logger.log('toRange.getLastRow:' + toRange.getLastRow() + " : getLastColumn" + toRange.getLastColumn());

  // Sync data
  var toValues = toRange.getValues();
  Logger.log('toValues:' + toValues.length + " : " + toValues[0].length);
  for (var i = curRowIdx; i < values.length; i++) {
    for (var j = 0; j < values[i].length; j++) {
      var colIdx = headerToColumnIndex[fromHeaders[j]];
      Logger.log('updating ' + curRowIdx + ':' + colIdx + ' with ' + values[i][j]);
      toValues[curRowIdx][colIdx] = values[i][j];
    }
    curRowIdx++;
  }


  toSheet.getRange(1, 1, toValues.length, toValues[0].length).setValues(toValues);

}


function prepareInterstitialSheet() {
  var fromSheet = getFromSheet();
  var toSheet = getToSheet();

  fillSheetWithEmptyRows(10000, toSheet, fromSheet);

  createHeaderToColumnIndex(toSheet, fromSheet)
}
