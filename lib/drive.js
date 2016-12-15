const google = require('googleapis')
const log = require('./log.js')
const redis = require('redis').createClient()
const spread = require('./sheets.js')
const util = require('util')

const APP = require('../config/application.json')
const GOOGLE = require('../config/google.json')
const TWILIO = require('../config/twilio.json')
const client = require('twilio')(TWILIO.account_sid, TWILIO.auth_token)

const drive = google.drive({
  version: 'v3',
  auth: require('./auth.js')
}).files

// @param {object} report The body of a Twilio response
// @param {Buffer} file
// @param {function} callback
module.exports = function (report, file, callback) {
  const params = {
    media: {
      mimeType: 'audio/mpeg',
      body: file
    },
    resource: {
      description: `Voice message from ${report.From}`,
      name: `${report.CallSid}.mp3`,
      parents: [GOOGLE.recordings_folder_id]
    }
  }

  drive.create(params, (err, response) => {
    if (err)
      return callback(err)

    return redis.hgetall(report.CallSid, (err, red) => {
      if (err)
        return callback(err)

      const newReport = {
        From: red.from,
        Body: '',
        RecordingSid: red.id
      }

      log.info(util.inspect(newReport))

      return addRecordingToSheet(newReport, (err, result) => {
        if (err)
          return callback(err)

        log.info('Added voice report to spreadsheet')

        return callback(null, result)
      })
    })
  })
}

function addRecordingToSheet(report, callback) {
  spread(report, (err, result) => {
    const message = {
      to: report.From,
      from: TWILIO.phone_number,
      body: 'Thank you for contacting SB Solidarity. Someone will be in touch with you shortly.'
    }

    if (err) {
      log.error(err)
      message.body = `Thank you for reporting this incident. Our system is currently offine. Please try again later or email us at ${APP.email}.`
    }

    client.sendMessage(message, (err, r) => {
      if (err)
        return callback(err)

      return callback(null, r)
    })
  })
}
