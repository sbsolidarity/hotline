const log = require('../log.js')
const util = require('util')

const TWILIO = require('../../config/twilio.json')
const client = require('twilio')(TWILIO.account_sid, TWILIO.auth_token)

module.exports = function sms (request, response) {
  if (request.body.AccountSid !== TWILIO.account_sid) {
    log.error(`Incorrect account SID in Twilio request (${request.body.AccountSid})`)
    return response.status(403).end()
  }

  log.info(`Confirmation callback:\n${util.inspect(request.body)}`)

  response.type('text/plain')
  return response.send('Thank you for contacting SB Solidarity. One of our members will be in touch with you as soon as they are available. If this is an emergency, consider calling 911.')
}
