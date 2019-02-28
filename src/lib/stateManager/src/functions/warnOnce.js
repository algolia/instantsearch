'use strict';
var bind = require('lodash/bind');

try {
  var warn;

  if (typeof window !== 'undefined') warn = window.console && bind(window.console.warn, console);
  else warn = bind(console.warn, console); // eslint-disable-line no-console

  var warnOnce = (function(w) {
    var previousMessages = [];
    return function warnOnlyOnce(m) {
      if (previousMessages.indexOf(m) === -1) {
        w(m);
        previousMessages.push(m);
      }
    };
  })(warn);

  module.exports = warnOnce;
} catch (e) {
  module.exports = function() {};
}
