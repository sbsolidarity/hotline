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

const moment = require('moment-timezone')
const APP = require('../config/application.json')

module.exports = {
  error: function (error) {
    const t = moment().tz(APP.timezone).format('YYYY-MM-DD HH:mm:ss')

    if (error instanceof Error) {
      if (error.message) {
        const msg = `${t}: ${error}`
        if (error.moreInfo)
          console.error(`${msg} (${error.moreInfo})`)
        else
          console.error(msg)
      }
      else {
        console.error(`${t}: ${error}`)
      }
      console.error(error.stack)
    }
    else {
      console.error(`${t}: ${error}`)
    }
  },
  info: function (message) {
    const t = moment().tz(APP.timezone).format('YYYY-MM-DD HH:mm:ss')
    console.log(`${t}: ${message}`)
  }
};
