const APP = require('../config/application.json')
const GOOGLE = require('../config/google.json')

const google = require('googleapis')
const util = require('util')
const redis = require('redis').createClient()

const sheets = google.sheets({
  version: 'v4',
  auth: require('./auth.js')
}).spreadsheets

const datetime = new Date()
const title = `${datetime.getMonth() + 1}/${datetime.getFullYear()}`

// @param {object} report The body of a Twilio response
module.exports = function (report, callback) {
  redis.hget(title, 'id', (err, id) => {
    if (err)
      return console.error(err)

    if (id === null) {
      return createAndAddToSheet(report, title, callback)
    } else {
      return addToSheet(report, id, callback)
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
              { userEnteredValue: { stringValue: 'Id' } },
              { userEnteredValue: { stringValue: 'URL' } }
            ]}
          ]
        }
      ]}
    ]
  }

  sheets.create({ resource: sheet }, (err, response) => {
    if (err)
      return callback(err)

    console.log(util.inspect(response))

    return redis.hset(title, 'id', response.spreadsheetId, (err, exitcode) => {
      if (err)
        return callback(err)

      return addToSheet(report, response.spreadsheetId, callback)
    })
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
          (report.MessageSid || report.RecordingSid),
          report.recordingUrl || ''
        ]
      ]
    }
  }

  sheets.values.append(appendData, (err, response) => {
    if (err)
      return callback(err)

    return callback(null, response)
  })
}
