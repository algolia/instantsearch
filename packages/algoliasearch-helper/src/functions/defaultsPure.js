'use strict';

// NOTE: this behaves like lodash/defaults, but doesn't mutate the target
// it also preserve keys order
module.exports = function defaultsPure() {
  var sources = Array.prototype.slice.call(arguments);
  return sources.reduce(function(acc, source) {
    Object.keys(Object(source)).forEach(function(key) {
      if (source[key] !== undefined && !Object.hasOwnProperty.call(acc, key)) {
        acc[key] = source[key];
      }
    });
    return acc;
  }, {});
};
