const APP = require('../config/application.json')
const GOOGLE = require('../config/google.json')

const google = require('googleapis')
const util = require('util')
const redis = require('redis').createClient()

const auth = new google.auth.OAuth2(
  GOOGLE.client_id,
  GOOGLE.client_secret
)

auth.setCredentials({
  access_token: GOOGLE.access_token,
  refresh_token: GOOGLE.refresh_token,
  expiry_date: GOOGLE.expiry_date
});

// auth.refreshAccessToken((err, tokens) => {
//   if (err)
//     return console.error(err)
//   return true
// })

const sheets = google.sheets({
  version: 'v4',
  auth: auth
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
