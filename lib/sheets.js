const APP = require('../config/application.json')
const GOOGLE = require('../config/google.json')

const google = require('googleapis')
const util = require('util')
const redis = require('redis').createClient()
const log = require('./log.js')

const sheets = google.sheets({
  version: 'v4',
  auth: require('./auth.js')
}).spreadsheets

const drive = google.drive({
  version: 'v3',
  auth: require('./auth.js')
}).files

const datetime = new Date()
const title = `${datetime.getMonth() + 1}/${datetime.getFullYear()}`

// @param {object} report The body of a Twilio response
module.exports = function (report, callback) {
  drive.list((err, list) => {
    // Find the existing spreadsheet for this month
    const thisMonth = list.files.filter(value => {
      return value.name === `Reports for ${title}`
    })

    if (thisMonth.length === 0) {
      // If there isn't a spreadsheet for this month, make one
      return createAndAddToSheet(report, title, callback)
    } else {
      return addToSheet(report, thisMonth[0].id, callback)
    }
  })
}

// @param {object} report The body of a Twilio response
// @param {string} title The title of the new
function createAndAddToSheet (report, title, callback) {
  const sheet = {
    properties: {
      title: `Reports for ${title}`,
      timeZone: APP.timezone
    },
    sheets: [
      { data: [
        { startRow: 0,
          startColumn: 0,
          rowData: [
            { values: [
              { userEnteredValue: { stringValue: 'Time' } },
              { userEnteredValue: { stringValue: 'From' } },
              { userEnteredValue: { stringValue: 'Message' } },
              { userEnteredValue: { stringValue: 'Id' } }
            ]}
          ]
        }
      ]}
    ]
  }

  sheets.create({ resource: sheet }, (err, response) => {
    if (err)
      return callback(err)

    log.info(`Created new spreadsheet for ${title}`)

    return moveSheetThenAddRow(response.spreadsheetId, report, (err, result) => {
      if (err)
        return callback(err)

      return callback(null, result)
    })
  })
}

function moveSheetThenAddRow(sheetId, report, callback) {
  // Move the new spreadsheet into the "Reports" folder
  const move = {
    fileId: sheetId,
    addParents: GOOGLE.reports_folder_id
  }
  return drive.update(move, (err, result) => {
    if (err)
      return callback(err)

    log.info('Moved the spreadsheet to the Reports folder')

    return addToSheet(report, sheetId, callback)
  })
}

function addToSheet(report, id, callback) {
  const appendData = {
    spreadsheetId: id,
    range: 'A1',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [
        [
          datetime,
          report.From,
          report.Body,
          (report.MessageSid || report.RecordingSid)
        ]
      ]
    }
  }

  sheets.values.append(appendData, (err, response) => {
    if (err)
      return callback(err)

    log.info(`Adding the report to the spreadsheet for ${title}`)

    return callback(null, response)
  })
}
