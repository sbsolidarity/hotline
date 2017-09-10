// This file is part of SBS.
//
// SBS is free software: you can redistribute it and/or modify it
// under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// SBS is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
// or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General
// Public License for more details.
//
// You should have received a copy of the GNU Affero General Public
// License along with SBS.  If not, see
// <http://www.gnu.org/licenses/>.

const block = require('../block.js')
const listBlocks = require('../list_blocks.js')
const log = require('../log.js')
const parseReport = require('../parse_report.js')
const redis = require('redis').createClient()
const unblock = require('../unblock.js')

const RESPONDERS = require('../../config/responders.json')
const TWILIO = require('../../config/twilio.json')

// @param {object} req Incoming HTTP request via Express
// @param {object} res The outgoing HTTP response
module.exports = function sms (req, res) {
  if (req.body.AccountSid !== TWILIO.account_sid) {
    log.error(`Incorrect account SID in Twilio req (${req.body.AccountSid})`)
    return res.status(403).end()
  }
  log.info('SMS received.')

  res.type('text/plain')

  return redis.sismember('blocks', req.body.From, (err, reply) => {
    if (reply)
      return log.info(`Ignoring message from blocked number ${req.body.From}`)

    const blockNumber = req.body.Body.match(/^\s*block\ \+?(\d{11})\s*$/i)
    const unblockNumber = req.body.Body.match(/^\s*unblock\ \+?(\d{11})\s*$/i)
    const blocksList = req.body.Body.match(/^\s*blocks\s*/i)

    const fromResponder = RESPONDERS.some(num => { return num === req.body.From })
    const adminCommand = blockNumber || unblockNumber || blocksList
    // We don't want to go down this branch for actual reports from
    // our responders
    if (fromResponder && adminCommand) {
      if (blockNumber)
        block(blockNumber[1], (err) => {
          if (err) {
            log.error(err)
            return res.send(`An error occurred; failed to block ${blockNumber[1]}.`)
          }
          return res.send(`Blocked ${blockNumber[1]}.`)
        })

      else if (unblockNumber)
        unblock(unblockNumber[1], (err) => {
          if (err) {
            log.error(err)
            return res.send(`An error occurred; failed to unblock ${unblockNumber[1]}.`)
          }
          return res.send(`Unblocked ${unblockNumber[1]}.`)
        })

      else listBlocks((err, list) => {
        if (err)
          return log.error(err)

        const blocks = list.join('\n')
        return res.send(`Blocked numbers:\n${blocks}`)
      })

    } else {
      parseReport(req, (err, reply) => {
        if (err)
          return log.error(err)

        if (reply)
          return res.send(reply)
        else
          return res.end()
      })
    }
  })
}
