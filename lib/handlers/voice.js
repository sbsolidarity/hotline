const fs = require('fs')
const log = require('../log.js')
const util = require('util')

const TWILIO = require('../../config/twilio.json')

module.exports = function voice (req, res) {
  if (req.body.AccountSid !== TWILIO.account_sid) {
    log.error(`Incorrect account SID in Twilio req (${req.body.AccountSid})`)
    return res.status(403).end()
  }

  const twiml = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<Res>' +
      '<Say>' +
        'Thank you for contacting the Santa Barbara Solidarity Network. To make a report, leave a message at the tone. Please include details about the time and place of the incident, as well as any people involved. One of our members will be in touch with you as soon as they are available. If this is an emergency, consider calling 911.' +
      '</Say>' +
    `<Record action="${TWILIO.hostname}${TWILIO.confirm_callback}" ` +
            `recordingStatusCallback="${TWILIO.hostname}${TWILIO.audio_callback}" ` +
            'finishOnKey="*#"/>' +
    '</Res>'


  log.info(`Voice call received:\n${util.inspect(req.body)}`)

  return res.send(twiml)
}
