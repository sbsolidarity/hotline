const franc = require('franc')
const google = require('googleapis')
const log = require('./log.js')
const spread = require('./sheets.js')
const util = require('util')

const GOOGLE = require('../config/google.json')
const LANG = require('../config/lang.json')
const TWILIO = require('../config/twilio.json')
const client = require('twilio')(TWILIO.account_sid, TWILIO.auth_token)

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
    report.FileId = response.id

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
    body: ''
  }

  if (report.TranscriptionStatus === 'failed') {
    log.error(`Transcription of ${report.CallSid} failed.`)
    followupText.body = LANG.voice.error.esp
    return client.sendMessage(followupText, (err, r) => {
      if (err)
        return callback(err)
      return callback(null, r)
    })
  }

  spread(report, (err, result) => {
    if (err)
      followupText.body = LANG.voice.error[report.Language]
    else
      followupText.body = LANG.voice.confirmation[report.Language]

    client.sendMessage(followupText, (err, r) => {
      if (err)
        return callback(err)

      return callback(null, r)
    })
  })
}
