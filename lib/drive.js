const google = require('googleapis')
const log = require('./log.js')
const redis = require('redis').createClient()
const spread = require('./sheets.js')
const util = require('util')

const TWILIO = require('../../config/twilio.json')
const client = require('twilio')(TWILIO.account_sid, TWILIO.auth_token)

const drive = google.drive({
  version: 'v3',
  auth: require('./auth.js')
}).files


// @param {object} report The body of a Twilio response
module.exports = function (report, file, callback) {
  const params = {
    resource: {
      description: `Voice message from ${report.From}`,
      name: `${report.RecordingSid}.mp3`
    },
    media: {
      mimeType: 'audio/mpeg',
      body: file
    }
  }

  drive.create(params, (err, response) => {
    if (err)
      return callback(err)

    return drive.get({ fileId: response.id }, (err, metadata) => {
      if (err)
        return callback(err)

      return redis.get(report.CallSid, (err, reply) => {
        if (err)
          return callback(err)

        const newReport = {
          From: reply.from,
          Body: reply.message,
          RecordingSid: reply.id,
          RecordingUrl: metadata.webViewLink
        }

        return spread(newReport, (err, result) => {
          const message = {
            to: reply.from,
            from: TWILIO.phone_number,
            body: 'Thank you for reporting this incident. One of our members will be in touch with you as soon as they are available.'
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
      })
    })
  })
}
