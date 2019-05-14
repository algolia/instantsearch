'use strict';

function clone(value) {
  if (typeof value === 'object' && value !== null) {
    return merge(Array.isArray(value) ? [] : {}, value);
  }
  return value;
}

/**
 * This method is like Object.assign, but recursively merges own and inherited
 * enumerable keyed properties of source objects into the destination object.
 *
 * NOTE: this behaves like lodash/merge, but:
 * - does mutate functions if they are a source
 * - treats non-plain objects as plain
 * - does not work for circular objects
 * - treats sparse arrays as sparse
 * - does not convert Array-like objects to arrays
 *
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 */
function merge() {
  var sources = Array.prototype.slice.call(arguments);
  var target = sources.shift();

  return sources.reduce(function(acc, source) {
    if (acc === source) {
      return acc;
    }

    if (source === undefined) {
      return acc;
    }

    if (acc === undefined) {
      return clone(source);
    }

    if (typeof acc !== 'object' && typeof acc !== 'function') {
      return clone(source);
    }

    if (typeof source !== 'object' && typeof source !== 'function') {
      return acc;
    }

    Object.keys(source).forEach(function(key) {
      acc[key] = merge(acc[key], source[key]);
    });

    return acc;
  }, target);
}

module.exports = merge;
