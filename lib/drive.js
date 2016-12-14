const google = require('googleapis')
const log = require('./log.js')
const spread = require('./sheets.js')
const util = require('util')

const drive = google.drive({
  version: 'v3',
  auth: require('./auth.js')
}).files

// @param {object} report The body of a Twilio response
module.exports = function (report, file, callback) {
  const params = {
    resource: {
      description: `Voice message from ${report.From}`,
      name: `${report.RecordingSid}.mp3`
    },
    media: {
      mimeType: 'audio/mpeg',
      body: file
    }
  }

  drive.create(params, (err, response) => {
    if (err)
      return callback(err)

    log.info(util.inspect(response))
    return callback(null, response)
  })
}
