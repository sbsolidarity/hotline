const fs = require('fs')
const log = require('./log.js')
const util = require('util')

const TWILIO = require('../config/twilio.json')

// const client = require('twilio')(TWILIO.account_sid, TWILIO.auth_token)

function audio (request, response) {
}


module.exports = { audio, sms, voice }
