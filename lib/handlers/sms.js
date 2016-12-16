const fs = require('fs')
const log = require('../log.js')
const util = require('util')
const spread = require('../sheets.js')

const APP = require('../../config/application.json')
const TWILIO = require('../../config/twilio.json')

// @param {object} req Incoming HTTP request via Express
// @param {object} res The outgoing HTTP response
module.exports = function sms (req, res) {
  log.info(`SMS received:\n${util.inspect(req.body)}`)
  res.type('text/plain')

  return spread(req.body, (err, result) => {
    if (err) {
      log.error(err)
      return res.send(`Thank you for reporting this incident. Our system is currently offine. Please try again later or email us at ${APP.email}.`)
    }

    log.info('SMS report added to spreadsheet')

    return res.send('Thank you for reporting this incident. One of our members will be in touch with you as soon as they are available.')
  })
}
