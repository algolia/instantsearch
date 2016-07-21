'use strict';

var map = require('lodash/map');
var isArray = require('lodash/isArray');
var isNumber = require('lodash/isNumber');
var isString = require('lodash/isString');
function valToNumber(v) {
  if (isNumber(v)) {
    return v;
  } else if (isString(v)) {
    return parseFloat(v);
  } else if (isArray(v)) {
    return map(v, valToNumber);
  }

  throw new Error('The value should be a number, a parseable string or an array of those.');
}

module.exports = valToNumber;
