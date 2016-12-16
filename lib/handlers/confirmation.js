const fs = require('fs')
const log = require('../log.js')
const util = require('util')
const spread = require('../sheets.js')

const APP = require('../../config/application.json')
const TWILIO = require('../../config/twilio.json')

// @param {object} req Incoming HTTP request via Express
// @param {object} res The outgoing HTTP response
module.exports = function sms (req, res) {
  log.info(`User hung up the phone:\n${util.inspect(req.body)}`)
  return res.end()
}
