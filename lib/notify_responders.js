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

const APP = require('../config/application.json')
const TWILIO = require('../config/twilio.json')

const async = require('async')
const log = require('./log.js')
const moment = require('moment-timezone')
const Twil = require('twilio')
const client = new Twil(TWILIO.account_sid, TWILIO.auth_token)

module.exports = function(numbers, callback) {
  async.each(numbers, sendTo, (err) => {
    if (err) {
      log.error('Error while notifying responders.')
      return callback(err)
    }

    log.info('Notifications sent to all responders.')
    return callback(null)
  })
}

function sendTo(num, callback) {
  const month = moment().tz(APP.timezone).format('MMMM')

  const msg = {
    to: num,
    from: TWILIO.phone_number,
    body: `A new report has been added to the ${month} spreadsheet.  Please do not reply to this message.`
  }

  client.messages.create(msg, (err, response) => {
    if (err)
      return callback(err)

    return callback(null)
  })
}
