// This file is part of SBS.
//
// SBS is free software: you can redistribute it and/or modify it
// under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// SBS is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
// or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General
// Public License for more details.
//
// You should have received a copy of the GNU Affero General Public
// License along with SBS.  If not, see
// <http://www.gnu.org/licenses/>.

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

  log.info('Recording message...')

  return res.send(twiml)
}
