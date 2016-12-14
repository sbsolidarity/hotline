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
