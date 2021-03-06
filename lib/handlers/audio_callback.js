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

const fetch = require('../fetch_file.js')
const franc = require('franc')
const fs = require('fs')
const log = require('../log.js')
const redis = require('redis').createClient()
const request = require('request')
const addAudioReport = require('../add_audio_report.js')

const TWILIO = require('../../config/twilio.json')

// @param {object} req Incoming HTTP request via Express
// @param {object} res The outgoing HTTP response
module.exports = function audio (req, res) {
  if (req.body.AccountSid !== TWILIO.account_sid) {
    log.error(`Incorrect account SID in Twilio req (${req.body.AccountSid})`)
    return res.status(403).end()
  }

  const filename = req.body.CallSid

  return fetch(`${req.body.RecordingUrl}.mp3`, (err, buffer) => {
    if (err)
      return log.error(err)

    return redis.get(req.body.CallSid, (err, result) => {
      if (err) {
        log.error(`Failed to get language of ${req.body.CallSid}, falling back to transcription.`)
        // See https://github.com/wooorm/franc#usage
        req.body.Language = franc.all(
          req.body.TranscriptionText,
          { 'whitelist': [ 'spa', 'eng' ] }
        )[0][0] || 'spa'
      }
      else
        req.body.Language = result

      return addAudioReport(req.body, buffer, (err, result) => {
        if (err)
          log.error(err)
        else
          log.info('Uploaded voice report to Google Drive')

        return res.end()
      })
    })
  })
}
