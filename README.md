# Response Network Router

## Development

1. `brew install node redis` (or equivalent).

1. `brew services redis start` (or equivalent).

1. Create a Twilio account and generate a phone number with SMS and
   Voice capabilities

    `cp config/twilio.json.template config/twilio.json`

    And fill it in with your Twilio Account SID, Auth Token, and phone
    number (including the `+` and country code).

1. Create a Google account and a project at
   <https://console.developers.google.com/apis/credentials>.

    1. In the API Library, active the Sheets and Drive API.

    2. In “Authorized redirect URIs”, add `http://127.0.0.1:3000/callback`.

    2. Create an OAuth client ID and download the credentials.

    3. `cp config/google.json.template config/google.json` and add the
       client ID and client secret.

    4. `brew install coffeescript`

    5. `git clone https://github.com/cage1016/google-access-token.git sandbox/access`

    6. `cd sandbox/access && npm i && make build && bin/gtoken`

    7. `gtoken` will prompt you for your Google API client ID and
       client secret, as well as the scopes you need
       (`drive,spreadsheets`).  Then it starts a server; go to it and
       it will authorize the application to use your Google account.
       Copy the JSON returned by the successful authorization and add
       it to `config/google.json`.

    8. In Google Drive, create a primary folder, and copy its ID (from
       the URL) to `reports_folder_id` in `config/google.json`.
       _Within_ that folder, create another for the audio recordings.
       Copy its ID to `recordings_folder_id`.

1. Install a localhost tunnelling application like ngrok (`brew cask
   install ngrok`) and start it (i.e., `nkgrok http 3000`).

1. Copy `config/application.json.template` to
   `config/application.json` and add the hostname assigned by ngrok.

1. In the Twilio phone number management page,

### Config files

#### application.json

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

#### lang.json

Localized strings for automated SMS and Voice replies.

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
