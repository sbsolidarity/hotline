const fs = require('fs')
const log = require('../log.js')
const request = require('request')
const upload = require('../drive.js')
const util = require('util')

const TWILIO = require('../../config/twilio.json')

// @param {object} req Incoming HTTP request via Express
// @param {object} res The outgoing HTTP response
module.exports = function audio (req, res) {
  const filename = req.body.RecordingSid

  let data = [];
  return request(`${req.body.RecordingUrl}.mp3`)
    .on('error', (err) => {
      return log.error(`Failed to download recording: ${err}`)
    })
    .on('data', (chunk) => {
      data = data.concat(chunk)
    })
    .on('end', (err) => {
      if (err)
        return log.error(err)

      return upload(req.body, Buffer.concat(data), (err, result) => {
        if (err)
          return log.error(`Failed to upload to Google Drive: ${err}`)

        log.info('Uploaded voice report to Google Drive')
        return res.end()
      })
  })
}
