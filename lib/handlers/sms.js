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

const cache = require('../cache.js')
const franc = require('franc')
const fs = require('fs')
const log = require('../log.js')
const spread = require('../sheets.js')
const uploadMms = require('../upload_mms.js')
const util = require('util')

const GOOGLE = require('../../config/google.json')
const LANG = require('../../config/lang.json')
const TWILIO = require('../../config/twilio.json')

// @param {object} req Incoming HTTP request via Express
// @param {object} res The outgoing HTTP response
module.exports = function sms (req, res) {
  if (req.body.AccountSid !== TWILIO.account_sid) {
    log.error(`Incorrect account SID in Twilio req (${req.body.AccountSid})`)
    return res.status(403).end()
  }
  log.info('SMS received.')

  res.type('text/plain')

  // See https://github.com/wooorm/franc#usage
  const language = franc.all(
    req.body.Body,
    { 'whitelist': ['spa', 'eng'] }
  )[0][0]

  log.info(`SMS is probably ${language}`)

  // Set the language of the report before passing it along
  req.body.Language = language

  // if (req.body.NumMedia !== '0') {
  return uploadMms(req.body, (err, report) => {
    if (err)
      log.error(err)

    return spread(report, (err, result) => {
      if (err) {
        log.error(err)
        return res.send(LANG.sms.error[language])
      }

      log.info('SMS report added to spreadsheet')

      return cache(report.From, (err, cached) => {
        if (err)
          return log.error(err)

        // If already cached
        if (cached)
          return res.end()

        return res.send(LANG.sms.confirmation[language])
      })
    })
  })
}
