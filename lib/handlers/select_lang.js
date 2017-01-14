const fs = require('fs')
const log = require('../log.js')
const util = require('util')
const redis = require('redis').createClient()

const APP = require('../../config/application.json')
const TWILIO = require('../../config/twilio.json')
const LANG = require('../../config/lang.json')

// @param {object} req Incoming HTTP request via Express
// @param {object} res The outgoing HTTP response
module.exports = function voice (req, res) {
  if (req.body.AccountSid !== TWILIO.account_sid) {
    log.error(`Incorrect account SID in Twilio req (${req.body.AccountSid})`)
    return res.status(403).end()
  }

  const selected_lang = req.body.Digits === "2" ? "eng" : "spa"
  const alice = selected_lang === "spa" ? "es-MX" : "en-US"

  redis.set(req.body.CallSid, selected_lang, (err, result) => {
    if (err)
      log.error(`Failed to set language (${selected_lang}) of ${req.body.CallSid}`)
  })

  // https://www.twilio.com/docs/api/twiml/your_response
  const twiml = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<Response>' +
      `<Say voice="alice" language="${alice}">${LANG.voice.instructions[selected_lang]}</Say>` +
      `<Record action="${APP.hostname}${TWILIO.confirmation_callback}" ` +
        `transcribeCallback="${APP.hostname}${TWILIO.audio_callback}" ` +
        'finishOnKey="*#"/>' +
    '</Response>'

  log.info(`Recording message from ${req.body.From}`)

  return res.send(twiml)
}
