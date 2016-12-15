const fs = require('fs')
const log = require('../log.js')
const util = require('util')
const spread = require('../sheets.js')

const APP = require('../../config/application.json')
const TWILIO = require('../../config/twilio.json')
const redis = require('redis').createClient()

module.exports = function sms (req, res) {
  if (req.body.AccountSid !== TWILIO.account_sid) {
    log.error(`Incorrect account SID in Twilio req (${req.body.AccountSid})`)
    return res.status(403).end()
  }

  log.info(`Confirmation callback:\n${util.inspect(req.body)}`)

  // Cache the report so that when the recording is ready and the
  // audio_callback runs, we can include the Google Drive URL in the
  // spreadsheet
  return redis.hmset(
    req.CallSid,
    "from", req.body.From,
    "message", req.bosy.Body,
    "id", req.body.RecordingSid,
    (err, reply) => {
      if (err)
        return log.error(err)

      return res.end()
    })
}
