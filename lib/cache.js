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
const redis = require('redis').createClient()

module.exports = function (number, callback) {
  return redis.get(number, (err, result) => {
    if (err)
      log.error(`Failed to fetch from cache: ${err}`)

    if (result && result === 'cached') {
      log.info("We've replied to this phone number already in the past 10 minutes.")
      return callback(null, true)
    }

    redis.setex(`${number}`, "600", "cached", (err, _result) => {
      if (err)
        log.error(`Failed to cache phone number: ${err}`)
      else
        log.info('Phone number cached for 10 minutes')
    })

    return callback(null, false)
  })
}
