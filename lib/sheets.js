const APP = require('../config/application.json')
const GOOGLE = require('../config/google.json')

const google = require('googleapis')
const util = require('util')
const redis = require('redis').createClient()

const auth = new google.auth.OAuth2(
  GOOGLE.client_id,
  GOOGLE.client_secret
)

auth.setCredentials({
  access_token: GOOGLE.access_token,
  refresh_token: GOOGLE.refresh_token
});

const sheets = google.sheets({
  version: 'v4',
  auth: auth
}).spreadsheets

const datetime = new Date()
const title = `${datetime.getMonth() + 1}/${datetime.getFullYear()}`

module.exports = function (report) {
  redis.hget(title, 'id', (err, id) => {
    if (err)
      return console.error(err)

    if (id === null) {
      createAndAddToSheet(report, title, followup)
    } else {
      addToSheet(report, id, followup)
    }
    return redis.quit()
  })
}

function createAndAddToSheet (report, title) {
  const sheet = {
    properties: {
      title: `Reports for ${title}`,
      timeZone: APP.timezone
    }
  }

  sheets.create({ resource: sheet }, (err, response) => {
    if (err)
      return console.error(err)

    return console.log(util.inspect(response))
  })
}

function addToSheet(report, id) {
}

function followup(err, result) {
}
