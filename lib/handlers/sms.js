const fs = require('fs')
const log = require('../log.js')
const util = require('util')
const spread = require('../sheets.js')

const APP = require('../../config/application.json')
const TWILIO = require('../../config/twilio.json')

module.exports = function sms (req, res) {
  if (req.body.AccountSid !== TWILIO.account_sid) {
    log.error(`Incorrect account SID in Twilio req (${req.body.AccountSid})`)
    return res.status(403).end()
  }

  log.info(`SMS received:\n${util.inspect(req.body)}`)
  res.type('text/plain')

  spread(req.body, (err, result) => {
    if (err) {
      log.error(err)
      return res.send(`Thank you for reporting this incident. Our system is currently offine. Please try again later or email us at ${APP.email}.`)
    }

    console.log(util.inspect(result))

    return res.send('Thank you for reporting this incident. One of our members will be in touch with you as soon as they are available.')
  })
}
