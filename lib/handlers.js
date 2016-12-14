const util = require('util')

function twilio(request, response) {
  console.log(request.body)
  return response.send('i got it')
}

module.exports = { twilio }
