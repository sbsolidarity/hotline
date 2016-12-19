const franc = require('franc')
const fs = require('fs')
const log = require('../log.js')
const request = require('request')
const upload = require('../drive.js')
const util = require('util')

const TWILIO = require('../../config/twilio.json')

// @param {object} req Incoming HTTP request via Express
// @param {object} res The outgoing HTTP response
module.exports = function audio (req, res) {
  if (req.body.AccountSid !== TWILIO.account_sid) {
    log.error(`Incorrect account SID in Twilio req (${req.body.AccountSid})`)
    return res.status(403).end()
  }

  const filename = req.body.CallSid

  let data = [];
  return request(`${req.body.RecordingUrl}.mp3`)
    .on('error', (err) => {
      return log.error(`Failed to download recording: ${util.inspect(err)}`)
    })
    .on('data', (chunk) => {
      data = data.concat(chunk)
    })
    .on('end', (err) => {
      if (err)
        return log.error(err)

      // See https://github.com/wooorm/franc#usage
      const language = franc.all(
        req.body.TranscriptionText,
        { 'whitelist': [ 'esp', 'eng' ] }
      )[0][0] || 'esp'

      // Set the language of the report before passing it along
      req.body.Language = language

      return upload(req.body, Buffer.concat(data), (err, result) => {
        if (err)
          log.error(util.inspect(err))
        else
          log.info('Uploaded voice report to Google Drive')

        return res.end()
      })
  })
}
