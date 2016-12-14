const fs = require('fs')
const log = require('../log.js')
const util = require('util')

const APP = require('../../config/application.json')
const TWILIO = require('../../config/twilio.json')

module.exports = function voice (req, res) {
  if (req.body.AccountSid !== TWILIO.account_sid) {
    log.error(`Incorrect account SID in Twilio req (${req.body.AccountSid})`)
    return res.status(403).end()
  }

  const twiml = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<Response>' +
      '<Say voice="alice">' +
        'Thank you for contacting the Santa Barbara Solidarity Network. If you are making a report, please include details about the time and place of the incident, as well as any people involved. One of our members will be in touch with you as soon as they are available.' +
      '</Say>' +
    `<Record action="${APP.hostname}${TWILIO.confirmation_callback}" ` +
            `recordingStatusCallback="${APP.hostname}${TWILIO.audio_callback}" ` +
            'finishOnKey="*#"/>' +
    '</Response>'


  log.info(`Voice call received:\n${util.inspect(req.body)}`)

  return res.send(twiml)
}
