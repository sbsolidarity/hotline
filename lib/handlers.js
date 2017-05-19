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

module.exports = {
  audio_processed: require('./handlers/audio_callback.js'),
  message_left: require('./handlers/message_callback.js'),
  web_root: require('./handlers/web_root.js'),
  language_selected: require('./handlers/voice_instructions.js'),
  sms_received: require('./handlers/sms.js'),
  call_received: require('./handlers/voice_welcome.js')
}
