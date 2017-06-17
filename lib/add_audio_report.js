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

const cache = require('./cache.js')
const google = require('googleapis')
const log = require('./log.js')
const spread = require('./sheets.js')

const GOOGLE = require('../config/google.json')
const LANG = require('../config/lang.json')
const TWILIO = require('../config/twilio.json')

const Twil = require('twilio')
const client = new Twil(TWILIO.account_sid, TWILIO.auth_token)

const drive = google.drive({
  version: 'v3',
  auth: require('./auth.js')
}).files

// @param {object} report An object with `From', `Body', and either
//   `MessageSid' or `CallSid'; usually this is the body of a Twilio
//   response
// @param {Buffer} file
// @param {function} callback
module.exports = function (report, file, callback) {
  const params = {
    media: {
      mimeType: 'audio/mpeg',
      body: file
    },
    resource: {
      description: `Voice message from ${report.From}: ${report.TranscriptionText}`,
      name: `${report.CallSid}.mp3`,
      parents: [GOOGLE.recordings_folder_id]
    }
  }

  // https://developers.google.com/drive/v3/reference/files/create
  drive.create(params, (err, response) => {
    if (err)
      return callback(err)

    // Add the Google Drive file ID to the report, so it can be linked
    // in the spreadsheet
    report.recordingId = response.id

    return addRecordingToSheet(report, (err, result) => {
      if (err)
        return callback(err)

      log.info('Added voice report to spreadsheet')

      return callback(null, result)
    })
  })
}

// @param {object} report
// @param {function} callback
function addRecordingToSheet(report, callback) {
  const followupText = {
    to: report.From,
    from: report.To,
    body: LANG.voice.confirmation[report.Language]
  }

  if (report.TranscriptionStatus === 'failed')
    log.error(`Transcription of ${report.CallSid} failed.`)

  spread(report, (err, result) => {
    if (err) {
      followupText.body = LANG.voice.error[report.Language]
      return client.messages.create(followupText, (err, r) => {
        if (err)
          return callback(err)
        return callback(null, r)
      })
    }

    return cache(report.From, (err, cached) => {
      if (err)
        return callback(err)

      // If already cached
      if (cached)
        return callback(null, result)

      return client.messages.create(followupText, (err, r) => {
        if (err)
          return callback(err)

        return callback(null, r)
      })
    })
  })
}
