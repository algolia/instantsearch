'use strict';

// NOTE: this behaves like lodash/defaults, but doesn't mutate the target
// it also keeps the highest numeric value, and the order of the keys of the
// last source: a key that already exists is updated in place, not moved
function mergeNumericMax() {
  var sources = Array.prototype.slice.call(arguments);

  return sources.reduceRight(function (acc, source) {
    Object.keys(Object(source)).forEach(function (key) {
      var accValue = typeof acc[key] === 'number' ? acc[key] : 0;
      var sourceValue = source[key];

      if (sourceValue === undefined) {
        return;
      }

      if (sourceValue >= accValue) {
        acc[key] = sourceValue;
      }
    });
    return acc;
  }, {});
}

module.exports = mergeNumericMax;
