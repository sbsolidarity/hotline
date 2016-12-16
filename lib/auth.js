const GOOGLE = require('../config/google.json')
const google = require('googleapis')

// See https://github.com/google/google-api-nodejs-client
const auth = new google.auth.OAuth2(
  GOOGLE.client_id,
  GOOGLE.client_secret
)

// See the {README.md} for ways of creating access tokens
auth.setCredentials({
  access_token: GOOGLE.access_token,
  refresh_token: GOOGLE.refresh_token,
  // This field is required to ensure automatic refreshing of the
  // access_token:
  // https://github.com/google/google-api-nodejs-client#making-authenticated-requests
  expiry_date: GOOGLE.expiry_date
});

module.exports = auth;
