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

const request = require('request')

// @param {String} url
// @param {Function} callback
// @return {Buffer}
module.exports = function (url, callback) {
  let data = [];
  return request(url)
    .on('error', (err) => {
      return callback(err)
    })
    .on('data', (chunk) => {
      data = data.concat(chunk)
    })
    .on('end', (err) => {
      if (err)
        return callback(err)

      return callback(null, Buffer.concat(data))
    })
}
