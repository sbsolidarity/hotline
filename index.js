////

const PORT = 3030
const TWILIO = require('./config/twilio.json')
// handlers
const handle = require('./lib/handlers.js')

const express = require('express')
const app = express()
// http://expressjs.com/en/4x/api.html#req.body
const bodyParser = require('body-parser')
const multer = require('multer')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))

app.post(TWILIO.audio_callback, multer().array(), handle.audio)
app.post(TWILIO.confirmation_callback, multer().array(), handle.confirmation)
app.post(TWILIO.sms_callback, multer().array(), handle.sms)
app.post(TWILIO.voice_callback, multer().array(), handle.voice)

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
});