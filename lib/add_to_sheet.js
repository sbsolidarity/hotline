// This file is part of SBS.
//
// SBS is free software: you can redistribute it and/or modify it
// under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// SBS is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
// or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General
// Public License for more details.
//
// You should have received a copy of the GNU Affero General Public
// License along with SBS.  If not, see
// <http://www.gnu.org/licenses/>.

const APP = require('../config/application.json')
const GOOGLE = require('../config/google.json')
const RESPONDERS = require('../config/responders.json')

const google = require('googleapis')
const log = require('./log.js')
const moment = require('moment-timezone')
const notifyResponders = require('./notify_responders.js')
const util = require('util')

const sheets = google.sheets({
  version: 'v4',
  auth: require('./auth.js')
}).spreadsheets

const drive = google.drive({
  version: 'v3',
  auth: require('./auth.js')
}).files

// @param {object} report An object with `From', `Body', and either
//   `MessageSid' or `CallSid'; usually this is the body of a Twilio
//   response
// @param {function} callback
module.exports = function (report, callback) {
  const datetime = moment().tz(APP.timezone)
  const title = `${datetime.month() + 1}/${datetime.year()}`

  drive.list((err, list) => {
    if (err)
      return callback(err)

    // Find the existing spreadsheet for this month
    const thisMonth = list.files.filter(value => {
      return value.name === `Reports for ${title}`
    })

    if (thisMonth.length === 0) {
      // If there isn't a spreadsheet for this month, make one
      return createAndAddToSheet(
        { report: report,
          title: title,
          time: datetime }, callback)
    } else {
      return addToSheet(
        { report: report,
          id: thisMonth[0].id,
          time: datetime }, callback)
    }
  })
}

// @param {object} options
// @param {object} options.report
// @param {string} options.title The title of the new spreadsheet
// @param {moment} options.time The time of the report
// @param {function} callback
function createAndAddToSheet (options, callback) {
  // https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets#Spreadsheet
  const sheet = {
    properties: {
      title: `Reports for ${options.title}`,
      timeZone: APP.timezone
    },
    sheets: [
      { data: [
        { startRow: 0,
          startColumn: 0,
          rowData: [
            { values: [
              { userEnteredValue: { stringValue: 'Date and Time' } },
              { userEnteredValue: { stringValue: 'From' } },
              { userEnteredValue: { stringValue: 'Message' } },
              { userEnteredValue: { stringValue: 'Language' } },
              { userEnteredValue: { stringValue: 'ID' } },
              { userEnteredValue: { stringValue: 'Voice Message' } },
              { userEnteredValue: { stringValue: 'Attachments' } }
            ]}
          ]
        }
      ]}
    ]
  }

  // https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/create
  sheets.create({ resource: sheet }, (err, response) => {
    if (err)
      return callback(err)

    log.info(`Created new spreadsheet for ${options.title}`)

    return moveSheetThenAddRow(
      { report: options.report,
        id: response.spreadsheetId,
        time: options.time }, (err, result) => {
          if (err)
            return callback(err)

          return callback(null, result)
        })
  })
}

// @param {object} options
// @param {string} options.id The ID of the new spreadsheet
// @param {object} options.report
// @param {moment} options.time
// @param {function} callback
function moveSheetThenAddRow(options, callback) {
  // Move the new spreadsheet into the "Reports" folder
  const move = {
    fileId: options.id,
    addParents: GOOGLE.reports_folder_id
  }

  // https://developers.google.com/drive/v3/reference/files/update
  return drive.update(move, (err, result) => {
    if (err)
      return callback(err)

    log.info('Moved the spreadsheet to the Reports folder')

    return addToSheet(
      { report: options.report,
        id: options.id,
        time: options.time }, callback)
  })
}

// @param {object} options
// @param {object} options.report
// @param {string} options.id The spreadsheetId of the sheet we're appending to
// @param {moment} options.time
// @param {function} callback
function addToSheet(options, callback) {
  const report = options.report

  const voiceMessage = report.recordingId ? `https://drive.google.com/file/d/${report.recordingId}/view` : ''

  const appendData = {
    spreadsheetId: options.id,
    range: 'A1',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [
        [
          options.time.tz(APP.timezone).format('YYYY-MM-DD HH:mm:ss'),
          report.From,
          (report.Body || report.TranscriptionText),
          (report.Language === 'spa' ? "Spanish" : "English"),
          (report.MessageSid || report.CallSid),
          voiceMessage,
          (report.mediaUrl || '')
        ]
      ]
    }
  }

  // https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/append
  sheets.values.append(appendData, (err, response) => {
    if (err)
      return callback(err)

    log.info(`Adding the report to spreadsheet ${options.id}`)

    // Don't notify the person sending the report
    const notifyUs = RESPONDERS.filter(num => { return num !== report.From })

    return notifyResponders(notifyUs, (err) => {
      if (err)
        log.error(err)

      return callback(null, response)
    })
  })
}
