const fs = require('fs')
const log = require('../log.js')
const util = require('util')

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

  // https://www.twilio.com/docs/api/twiml/your_response
  const twiml = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<Response>' +
      `<Gather action="${APP.hostname}${TWILIO.select_lang_callback}" finishOnKey="12">` +
        `<Say voice="alice" language="es-MX">${LANG.voice.welcome.spa}</Say>` +
        `<Say voice="alice" language="en-US">${LANG.voice.welcome.eng}</Say>` +
        `<Say voice="alice" language="es-MX">${LANG.voice.prompt.spa}</Say>` +
        `<Say voice="alice" language="en-US">${LANG.voice.prompt.eng}</Say>` +
      '</Gather>' +
      `<Redirect method="POST">${APP.hostname}${TWILIO.select_lang_callback}</Redirect>` +
    '</Response>'

  log.info('Receiving call...')
  return res.send(twiml)
}
