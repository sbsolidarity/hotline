const cache = require('../cache.js')
const franc = require('franc')
const fs = require('fs')
const log = require('../log.js')
const spread = require('../sheets.js')
const util = require('util')

const TWILIO = require('../../config/twilio.json')
const LANG = require('../../config/lang.json')

// @param {object} req Incoming HTTP request via Express
// @param {object} res The outgoing HTTP response
module.exports = function sms (req, res) {
  if (req.body.AccountSid !== TWILIO.account_sid) {
    log.error(`Incorrect account SID in Twilio req (${req.body.AccountSid})`)
    return res.status(403).end()
  }
  log.info('SMS received.')

  res.type('text/plain')

  // See https://github.com/wooorm/franc#usage
  const language = franc.all(
    req.body.Body,
    { 'whitelist': ['spa', 'eng'] }
  )[0][0]

  // Set the language of the report before passing it along
  req.body.Language = language

  return spread(req.body, (err, result) => {
    if (err) {
      log.error(err)
      return res.send(LANG.sms.error[language])
    }

    log.info('SMS report added to spreadsheet')

    return cache(req.body.From, (err, cached) => {
      if (err)
        return log.error(err)

      // If already cached
      if (cached)
        return res.end()

      return res.send(LANG.sms.confirmation[language])
    })
  })
}
