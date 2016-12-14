const fs = require('fs')
const log = require('../log.js')
const request = require('request')

const TWILIO = require('../../config/twilio.json')

module.exports = function audio (req, res) {
  if (request.body.AccountSid !== TWILIO.account_sid) {
    log.error(`Incorrect account SID in Twilio request (${request.body.AccountSid})`)
    return res.status(403).end()
  }

  request(`${req.body.RecordingUrl}.mp3`, (err, response, body) => {
    if (err)
      return log.error(err)

    if (response.statusCode !== 200)
      return log.error(`Status code ${response.statusCode} received for ${req.body.RecordingUrl}.mp3`)

    saveFile({ id: request.body.RecordingId, data: body }, (err, result) => {
      if (err)
        return log.error(err)

      return log.info(`Audio saved to ${result}`)
    })
  })
}

function saveFile(options, callback) {
  if (!fs.existsSync(`../audio/${options.id}`))
    fs.mkdirSync(`../audio/${options.id}`)

  fs.writeFile(`../audio/${options.id}/${options.id}.mp3`, options.data, { encoding: 'binary' }, (err) => {
    if (err)
      return callback(err)

    return callback(null, `audio/${options.id}/${options.id}.mp3`)
  })
}
