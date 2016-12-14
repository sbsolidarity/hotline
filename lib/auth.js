const GOOGLE = require('../config/google.json')
const google = require('googleapis')

const auth = new google.auth.OAuth2(
  GOOGLE.client_id,
  GOOGLE.client_secret
)

auth.setCredentials({
  access_token: GOOGLE.access_token,
  refresh_token: GOOGLE.refresh_token,
  expiry_date: GOOGLE.expiry_date
});

module.exports = auth;
