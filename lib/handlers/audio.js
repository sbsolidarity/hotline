const fs = require('fs')
const log = require('../log.js')
const request = require('request')

const TWILIO = require('../../config/twilio.json')

module.exports = function audio (req, res) {
  if (req.body.AccountSid !== TWILIO.account_sid) {
    log.error(`Incorrect account SID in Twilio req (${req.body.AccountSid})`)
    return res.status(403).end()
  }

  const filename = req.body.RecordingSid
  fs.mkdirSync(`./audio/${filename}`)

  request(`${req.body.RecordingUrl}.mp3`)
    .on('error', (err) => {
      return log.error(err)
    })
    .on('response', (r) => {
      if (r.statusCode !== 200)
        return log.error(`Status code ${r.statusCode} received for ${req.body.RecordingUrl}`)
    })
    .pipe(fs.createWriteStream(`./audio/${filename}/${filename}.mp3`))
}
