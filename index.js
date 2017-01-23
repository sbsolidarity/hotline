const PORT = 3030

// configuration settings for the Twilio API
const TWILIO = require('./config/twilio.json')

const express = require('express')
const app = express()
app.set('view engine', 'ejs');

// http://expressjs.com/en/4x/api.html#req.body
const bodyParser = require('body-parser')
const multer = require('multer')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))

const handle = require('./lib/handlers.js')
app.get('/', handle.root)
app.post(TWILIO.audio_callback, multer().array(), handle.audio)
app.post(TWILIO.confirmation_callback, multer().array(), handle.confirmation)
app.post(TWILIO.select_lang_callback, multer().array(), handle.select_lang)
app.post(TWILIO.sms_callback, multer().array(), handle.sms)
app.post(TWILIO.voice_callback, multer().array(), handle.welcome)

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
});
