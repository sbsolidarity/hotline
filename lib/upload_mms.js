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

const async = require('async')
const fetch = require('./fetch_file.js')
const google = require('googleapis')
const log = require('./log.js')
const util = require('util')

const GOOGLE = require('../config/google.json')
const LANG = require('../config/lang.json')

const drive = google.drive({
  version: 'v3',
  auth: require('./auth.js')
}).files

// @param {object} report An object with `From', `Body', and either
//   `MessageSid' or `CallSid'; usually this is the body of a Twilio
//   response
// @param {Buffer} file
// @param {function} callback
module.exports = function (report, callback) {
  let media = []
  let n = parseInt(report.NumMedia)
  for (let i = n; i > 0; i--)
    media.push(report[`MediaUrl${i - 1}`])

  // TODO: there's probably a better way to do this
  //
  // If there's more than one media attachment, create a folder in
  // Google Drive to hold them
  return async.whilst(
    function () {
      const createFolder = n > 1
      // So that we only create this folder once
      n = 0
      return createFolder
    },

    (callback) => {
      // https://developers.google.com/drive/v3/web/folder#creating_a_folder
      const folderParams = {
        resource: {
          name: `Media for ${report.MessageSid}`,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [GOOGLE.attachments_folder_id]
        }
      }
      drive.create(folderParams, (err, response) => {
        if (err)
          return callback(err)

        // return the ID of the newly created folder
        return callback(null, response.id)
      })
    },

    (err, folder) => {
      async.map(media, fetch, (err, results) => {
        if (err)
          return callback(err)

        const driveParams = results.map((value, index, array) => {
          return {
            media: {
              mimeType: report[`MediaContentType${index}`],
              body: value
            },
            resource: {
              description: report.Body,
              name: report.MessageSid,
              parents: [(folder || GOOGLE.attachments_folder_id)]
            }
          }
        })

        return async.map(driveParams, drive.create, (err, results) => {
          if (err)
            return callback(err)

          // If there are multiple attachments we'll just link to the folder
          if (results.length === 1) {
            report.mediaUrl = `https://drive.google.com/file/d/${results[0].id}/view`
          } else if (results.length > 1) {
            report.mediaUrl = `https://drive.google.com/drive/folders/${folder}`
          }

          return callback(null, report)
        })
      })
    }
  )
}
