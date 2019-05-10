'use strict';

// NOTE: this behaves like lodash/defaults, but doesn't mutate the target
module.exports = function defaultsPure() {
  var sources = Array.prototype.slice.call(arguments);
  return sources.reduceRight(function(acc, source) {
    Object.keys(Object(source)).forEach(function(key) {
      if (source[key] !== undefined) {
        acc[key] = source[key];
      }
    });
    return acc;
  }, {});
};
