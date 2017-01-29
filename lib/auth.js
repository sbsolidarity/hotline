// This file is part of SBS.
//
// SBS is free software: you can redistribute it and/or modify it
// under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// SBS is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
// or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General
// Public License for more details.
//
// You should have received a copy of the GNU Affero General Public
// License along with SBS.  If not, see
// <http://www.gnu.org/licenses/>.

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
