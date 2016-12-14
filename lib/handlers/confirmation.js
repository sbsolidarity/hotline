const fs = require('fs')
const log = require('../log.js')
const util = require('util')

const TWILIO = require('../../config/twilio.json')
const client = require('twilio')(TWILIO.account_sid, TWILIO.auth_token)

module.exports = function sms (req, res) {
  if (req.body.AccountSid !== TWILIO.account_sid) {
    log.error(`Incorrect account SID in Twilio req (${req.body.AccountSid})`)
    return res.status(403).end()
  }

  log.info(`Confirmation callback:\n${util.inspect(req.body)}`)

  client.sendMessage({
    to: req.body.From,
    from: TWILIO.phone_number,
    body: 'Thank you for contacting SB Solidarity. One of our members will be in touch with you as soon as they are available.'
  }, (err, _result) => {
    if (err) {
      log.error(err)
      return res.status(500).end()
    }

    return res.end()
  })
}
