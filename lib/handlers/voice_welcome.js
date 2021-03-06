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
const redis = require('redis').createClient()
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

  return redis.sismember('blocks', req.body.From, (err, reply) => {
    if (err)
      return log.error(err)

    if (reply) {
      log.info(`Ignoring call from blocked number ${req.body.From}`)
      return res.send('<?xml version="1.0" encoding="UTF-8"?>' +
                      '<Response><Reject /></Response>')
    }

    // https://www.twilio.com/docs/api/twiml/your_response
    const twiml = '<?xml version="1.0" encoding="UTF-8"?>' +
          '<Response>' +
          `<Gather action="${APP.hostname}${TWILIO.select_lang_callback}" numDigits="1">` +
          `<Play>/audio/welcome_spa.mp3</Play>` +
          `<Play>/audio/welcome_eng.mp3</Play>` +
          `<Play>/audio/prompt_spa.mp3</Play>` +
          `<Play>/audio/prompt_eng.mp3</Play>` +
          '</Gather>' +
          `<Redirect method="POST">${APP.hostname}${TWILIO.select_lang_callback}</Redirect>` +
          '</Response>'

    log.info('Receiving call...')
    return res.send(twiml)
  })
}
