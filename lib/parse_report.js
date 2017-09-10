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

const log = require('./log.js')
const uploadMms = require('./upload_mms.js')
const franc = require('franc')
const cache = require('./cache.js')
const addToSheet = require('./add_to_sheet.js')

const LANG = require('../config/lang.json')

module.exports = function (req, callback) {
  // See https://github.com/wooorm/franc#usage
  const language = franc.all(
    req.body.Body,
    { 'whitelist': ['spa', 'eng'] }
  )[0][0]

  log.info(`SMS is probably ${language}`)

  // Set the language of the report before passing it along
  req.body.Language = language

  uploadMms(req.body, (err, report) => {
    if (err)
      return callback(err)

    return addToSheet(report, (err, result) => {
      if (err) {
        log.error(err)
        return callback(null, LANG.sms.error[language])
      }

      log.info('SMS report added to spreadsheet')

      return cache(report.From, (err, cached) => {
        if (err)
          return callback(err)

        // If already cached
        if (cached)
          return callback(null)

        return callback(null, LANG.sms.confirmation[language])
      })
    })
  })
}
