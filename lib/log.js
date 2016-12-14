module.exports = {
  error: function (message) {
    'use strict';
    const t = new Date();
    console.log('[ERROR] ' + t + ': ' + message);
  },
  info: function (message) {
    'use strict';
    const t = new Date();
    console.log(t + ': ' + message);
  }
};
