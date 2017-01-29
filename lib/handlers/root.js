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

const accept = require('accept-language-parser')
const util = require('util')

const APP = require('../../config/application.json')
const LANG = require('../../config/lang.json')

// @param {object} req Incoming HTTP request via Express
// @param {object} res The outgoing HTTP response
module.exports = function(req, res) {
  const languages = accept.parse(
    req.headers['accept-language']
  ).filter(value => {
    return value.code.match(/^es-?/) || value.code.match(/^en-?/)
  })

  const lang = languages[0].code.replace(/-[a-z]*$/i, '') === "es"
        ? "spa"
        : "eng"

  return res.render(
    `${__dirname}/../../views/index`,
    {
      instructions: LANG.website.instructions[lang],
      homepage: APP.hostname,
      lang: lang,
      long_desc: LANG.website.long_desc[lang],
      short_desc: LANG.website.short_desc[lang],
      title: LANG.website.title[lang]
    }
  )
}
