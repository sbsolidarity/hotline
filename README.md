# SBS

SBS is a simple web application for running a phone-based reporting
system.  Voicemails and texts are saved and sorted into Google Drive
for processing and followup.

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
       _Within_ that folder, create two more for audio recordings and
       media attachments.  Copy their IDs to `recordings_folder_id`
       and `attachments_folder_id`.

1. Install a localhost tunnelling application like ngrok (`brew cask
   install ngrok`) and start it (i.e., `nkgrok http 3000`).

1. Copy `config/application.json.template` to
   `config/application.json` and add the hostname assigned by ngrok.

1. Copy `config/responders.json.template` to `config/responders.json`
   and add the phone numbers that should be notified when new reports
   are added.

1. In the Twilio phone number management page, set the Voice Webhook
   to be the ngrok hostname plus the value of `voice_callback` in
   `config/twilio.json`.  Set the Messaging Webhook to be the ngrok
   hostname plus the value of `sms_callback` in `config/twilio.json`.

1. Start the application locally with `node index.js`

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

#### responders.json

An array of phone numbers (with `+1` or other country code, plus area
code) that should be notified upon receipt of new reports.

## Running in production

The `provisioning` subdirectory contains an Ansible playbook for
setting up a CentOS/RedHat server with everything necessary to deploy
SBS in a production environment.

1. `brew install ansible` or equivalent (requires version 2.2 or
   higher, with [passlib](http://pypi.python.org/pypi/passlib)
   available).

3. Edit `playbook/inventory` and set `ansible_ssh_host` to the
   hostname of your SBS instance.

2. `cd provisioning && ansible-playbook -i inventory sbs.yml`

    Ansible will prompt you for three pieces of information:

      1. The location of the SSH public key that Capistrano will use
         to deploy with;

      2. The name of a non-root user to deploy with (defaults to
         `deploy`);

      3. The password for the deploy user.

If all goes well, Ansible will install and configure the software
needed to run SBS, as well as creating a TLS certificate for the
hostname you specified.

After Ansible finishes, you’ll want to add the production values to
the config files in `/var/www/shared/config/` on the remote server.
Then you can deploy SBS to your server with Capistrano:

```shell
bundle install
export SERVER=sbs-instance.com # replace this value with the hostname of your server
bundle exec cap production deploy
```
