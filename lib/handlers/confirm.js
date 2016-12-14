const fs = require('fs')
const log = require('../log.js')
const util = require('util')

const TWILIO = require('../../config/twilio.json')

module.exports = function sms (request, response) {
  if (request.body.AccountSid !== TWILIO.account_sid) {
    log.error(`Incorrect account SID in Twilio request (${request.body.AccountSid})`)
    return response.status(403).end()
  }
