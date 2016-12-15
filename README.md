# Santa Barbara Solidarity Reporting Service

## Development

1. Create a Twilio account
   - `cp config/twilio.json.template config/twilio.json` and fill in
     the fields

2. Create a Google account and create an OAuth credential at
   <https://console.developers.google.com/apis/credentials>
   - `cp config/google.json.template config/google.json` and add the
     client ID and client secret.
   - `brew install coffeescript`
   - `git clone https://github.com/cage1016/google-access-token.git sandbox/access`
   - `cd sandbox/access && npm i && make build && bin/gtoken`
   - `gtoken` will prompt you for your Google API client ID and client
     secret, as well as the scopes you need (`drive,spreadsheets`).
     Then it starts a server; go to it and it will authorize the
     application to use your Google account.  Copy the JSON returned
     by the successful authorization and add it to `config/google.json`.

### Config files

#### application.json

##### email

The email address users are instructed to use when the system is down.

##### hostname

The hostname of the server receiving Twilio requests.

##### timezone

The timezone set in Google Sheets for new spreadsheets.

#### google.json

##### access_token

The token received through the OAuth process described above.  Used
for making authenticated requests; do not share.

##### client_id

The ID of the Google API application.

##### client_secret

The token used to initiate the OAuth flow.

##### expiry_date

The time (in Unix) when the `access_token` will expire.  When this is
included in the Google `auth` object, the `access_token` will be
automatically renewed when necessary.

##### recordings_folder_id

The ID of the “Recordings” folder in Google Drive, where the voice
reports are saved to.

##### refresh_token

Used by the Google OAuth client to renew the `access_token`.

##### reports_folder_id

The ID of the “Recordings” folder in Google Drive, where the reports
spreadsheets are saved.

##### token_type

Currently unused.

#### twilio.json

##### account_sid

The ID of the Twilio user.

##### audio_callback

The path Twilio will send `recordingStatusCallback` to.  See <https://www.twilio.com/docs/api/twiml/record>.

##### auth_token

The authentication token for the Twilio user.  Must remain secret.

##### confirmation_callback

The path Twilio will send `action` to.  See <https://www.twilio.com/docs/api/twiml/record>.

##### phone_number

The Twilio phone number used by the application.

##### sms_callback

The path Twilio will send its initial SMS requests to.  See
<https://www.twilio.com/docs/api/twiml/sms/twilio_request>.

##### voice_callback

The path Twilio will send its initial Voice requests to.  See
<https://www.twilio.com/docs/api/twiml/twilio_request>.
