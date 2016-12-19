const moment = require('moment-timezone')
const APP = require('../config/application.json')

module.exports = {
  error: function (message) {
    const t = moment().tz(APP.timezone).format('YYYY-MM-DD HH:mm:ss')
    console.error(`[ERROR] ${t}: ${message}`)
  },
  info: function (message) {
    const t = moment().tz(APP.timezone).format('YYYY-MM-DD HH:mm:ss')
    console.log(`${t}: ${message}`)
  }
};
