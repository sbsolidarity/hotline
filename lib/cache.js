const log = require('./log.js')
const redis = require('redis').createClient()

module.exports = function (number, callback) {
  return redis.get(number, (err, result) => {
    if (err)
      log.error(`Failed to fetch from cache: ${err}`)

    if (result && result === 'cached')
      return callback(null, true)

    redis.setex(`${number}`, "600", "cached", (err, _result) => {
      if (err)
        log.error(`Failed to cache phone number: ${err}`)
      else
        log.info('Phone number cached for 10 minutes')
    })

    return callback(null, false)
  })
}
