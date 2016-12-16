const fs = require('fs')
const log = require('../log.js')
const util = require('util')

const APP = require('../../config/application.json')
const TWILIO = require('../../config/twilio.json')
const LANG = require('../../config/lang.json')

// @param {object} req Incoming HTTP request via Express
// @param {object} res The outgoing HTTP response
module.exports = function voice (req, res) {
  // https://www.twilio.com/docs/api/twiml/your_response
  const twiml = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<Response>' +
      '<Say voice="alice" language="es-MX">' +
        LANG.voice.welcome.esp +
      '</Say>' +
      '<Say voice="alice" language="en-US">' +
        LANG.voice.welcome.eng +
      '</Say>' +
    `<Record action="${APP.hostname}${TWILIO.confirmation_callback}" ` +
            `transcribeCallback="${APP.hostname}${TWILIO.audio_callback}" ` +
            'finishOnKey="*#"/>' +
    '</Response>'

  log.info(`Voice call received:\n${util.inspect(req.body)}`)

  return res.send(twiml)
}
