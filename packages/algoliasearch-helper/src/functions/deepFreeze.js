'use strict';

var forEach = require('lodash/collection/forEach');
var identity = require('lodash/utility/identity');
var isObject = require('lodash/lang/isObject');

/**
 * Recursively freeze the parts of an object that are not frozen.
 * @private
 * @param {object} obj object to freeze
 * @return {object} the object frozen
 */
var deepFreeze = function(obj) {
  if (!isObject(obj)) return obj;

  forEach(obj, deepFreeze);
  if (!Object.isFrozen(obj)) {
    Object.freeze(obj);
  }

  return obj;
};

module.exports = Object.freeze ? deepFreeze : identity;
