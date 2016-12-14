////

const PORT = 3030
const SETTINGS = require('./config/twilio.json')
// handlers
const handle = require('./lib/handlers.js')

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const multer = require('multer')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))

app.post(SETTINGS.callback_url, multer().array(), handle.twilio)

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
});
