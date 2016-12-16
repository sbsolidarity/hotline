const franc = require('franc')
const fs = require('fs')
const log = require('../log.js')
const util = require('util')
const spread = require('../sheets.js')

const APP = require('../../config/application.json')
const TWILIO = require('../../config/twilio.json')
const LANG = require('../../config/lang.json')

// @param {object} req Incoming HTTP request via Express
// @param {object} res The outgoing HTTP response
module.exports = function sms (req, res) {
  log.info(`SMS received:\n${util.inspect(req.body)}`)
  res.type('text/plain')

  const language = franc.all(
    req.body.Body,
    { 'whitelist': ['esp', 'eng'] }
  )[0][0]

  // Set the language of the report before passing it along
  req.body.Language = language

  return spread(req.body, (err, result) => {
    if (err) {
      log.error(err)
      return res.send(`${LANG.sms.error[language]} ${APP.email}.`)
    }

    log.info('SMS report added to spreadsheet')

    return res.send(LANG.sms.confirmation[language])
  })
}
