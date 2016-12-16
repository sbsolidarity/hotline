const accept = require('accept-language-parser')
const util = require('util')

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
        ? "esp"
        : "eng"

  return res.render(
    'index',
    {
      lang: lang,
      title: LANG.website.title[lang],
      description: LANG.website.description[lang],
      instructions: LANG.website.instructions[lang]
    }
  )
}
