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
