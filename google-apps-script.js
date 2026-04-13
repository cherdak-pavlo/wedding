// ============================================
// Google Apps Script for Wedding RSVP
// ============================================
//
// SETUP:
// 1. Create a new Google Sheet
// 2. Open Extensions → Apps Script
// 3. Paste this entire code there
// 4. Click Deploy → New deployment → Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 5. Copy the deployment URL and paste it into script.js (APPS_SCRIPT_URL)
//
// The sheet will have columns:
// A: id | B: guest_name | C: attending | D: transfer | E: wishes | F: submitted_at
//

function doGet(e) {
  var id = e.parameter.id;
  if (!id) {
    return jsonResponse({ error: 'Missing id' });
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();

  // Find all rows with this invitation id
  var guests = [];
  var transfer = 'no';
  var wishes = '';
  var found = false;

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      found = true;
      guests.push({
        name: data[i][1],
        attending: data[i][2]
      });
      transfer = data[i][3];
      wishes = data[i][4];
    }
  }

  if (!found) {
    return jsonResponse({ submitted: false });
  }

  return jsonResponse({
    submitted: true,
    guests: guests,
    transfer: transfer,
    wishes: wishes
  });
}

function doPost(e) {
  var body = JSON.parse(e.postData.contents);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Add header row if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['id', 'guest_name', 'attending', 'transfer', 'wishes', 'submitted_at']);
  }

  // Delete existing rows with this id (for re-submissions)
  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === body.id) {
      sheet.deleteRow(i + 1);
    }
  }

  // Write one row per guest
  var now = new Date().toISOString();
  body.guests.forEach(function(guest) {
    sheet.appendRow([
      body.id,
      guest.name,
      guest.attending,
      body.transfer,
      body.wishes,
      now
    ]);
  });

  return jsonResponse({ success: true });
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
