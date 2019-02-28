'use strict';

/**
 * Module containing the functions to serialize and deserialize
 * {SearchParameters} in the query string format
 * @module algoliasearchHelper.url
 */

var shortener = require('./SearchParameters/shortener');
var SearchParameters = require('./SearchParameters');

var qs = require('qs');

var bind = require('lodash/bind');
var forEach = require('lodash/forEach');
var pick = require('lodash/pick');
var map = require('lodash/map');
var mapKeys = require('lodash/mapKeys');
var mapValues = require('lodash/mapValues');
var isString = require('lodash/isString');
var isPlainObject = require('lodash/isPlainObject');
var isEmpty = require('lodash/isEmpty');
var invert = require('lodash/invert');

var encode = require('qs/lib/utils').encode;

function recursiveEncode(input) {
  if (isPlainObject(input)) {
    return mapValues(input, recursiveEncode);
  }
  if (Array.isArray(input)) {
    return map(input, recursiveEncode);
  }
  if (isString(input)) {
    return encode(input);
  }
  return input;
}

var refinementsParameters = ['dFR', 'fR', 'nR', 'hFR', 'tR'];
var stateKeys = shortener.ENCODED_PARAMETERS;
function sortQueryStringValues(prefixRegexp, invertedMapping, a, b) {
  if (prefixRegexp !== null) {
    a = a.replace(prefixRegexp, '');
    b = b.replace(prefixRegexp, '');
  }

  a = invertedMapping[a] || a;
  b = invertedMapping[b] || b;

  if (stateKeys.indexOf(a) !== -1 || stateKeys.indexOf(b) !== -1) {
    if (a === 'q') return -1;
    if (b === 'q') return 1;

    var isARefinements = refinementsParameters.indexOf(a) !== -1;
    var isBRefinements = refinementsParameters.indexOf(b) !== -1;
    if (isARefinements && !isBRefinements) {
      return 1;
    } else if (isBRefinements && !isARefinements) {
      return -1;
    }
  }

  return a.localeCompare(b);
}

/**
 * Read a query string and return an object containing the state
 * @param {string} queryString the query string that will be decoded
 * @param {object} [options] accepted options :
 *   - prefix : the prefix used for the saved attributes, you have to provide the
 *     same that was used for serialization
 *   - mapping : map short attributes to another value e.g. {q: 'query'}
 * @return {object} partial search parameters object (same properties than in the
 * SearchParameters but not exhaustive)
 */
exports.getStateFromQueryString = function(queryString, options) {
  var prefixForParameters = options && options.prefix || '';
  var mapping = options && options.mapping || {};
  var invertedMapping = invert(mapping);

  var partialStateWithPrefix = qs.parse(queryString);
  var prefixRegexp = new RegExp('^' + prefixForParameters);
  var partialState = mapKeys(
    partialStateWithPrefix,
    function(v, k) {
      var hasPrefix = prefixForParameters && prefixRegexp.test(k);
      var unprefixedKey = hasPrefix ? k.replace(prefixRegexp, '') : k;
      var decodedKey = shortener.decode(invertedMapping[unprefixedKey] || unprefixedKey);
      return decodedKey || unprefixedKey;
    }
  );

  var partialStateWithParsedNumbers = SearchParameters._parseNumbers(partialState);

  return pick(partialStateWithParsedNumbers, SearchParameters.PARAMETERS);
};

/**
 * Retrieve an object of all the properties that are not understandable as helper
 * parameters.
 * @param {string} queryString the query string to read
 * @param {object} [options] the options
 *   - prefixForParameters : prefix used for the helper configuration keys
 *   - mapping : map short attributes to another value e.g. {q: 'query'}
 * @return {object} the object containing the parsed configuration that doesn't
 * to the helper
 */
exports.getUnrecognizedParametersInQueryString = function(queryString, options) {
  var prefixForParameters = options && options.prefix;
  var mapping = options && options.mapping || {};
  var invertedMapping = invert(mapping);

  var foreignConfig = {};
  var config = qs.parse(queryString);
  if (prefixForParameters) {
    var prefixRegexp = new RegExp('^' + prefixForParameters);
    forEach(config, function(v, key) {
      if (!prefixRegexp.test(key)) foreignConfig[key] = v;
    });
  } else {
    forEach(config, function(v, key) {
      if (!shortener.decode(invertedMapping[key] || key)) foreignConfig[key] = v;
    });
  }

  return foreignConfig;
};

/**
 * Generate a query string for the state passed according to the options
 * @param {SearchParameters} state state to serialize
 * @param {object} [options] May contain the following parameters :
 *  - prefix : prefix in front of the keys
 *  - mapping : map short attributes to another value e.g. {q: 'query'}
 *  - moreAttributes : more values to be added in the query string. Those values
 *    won't be prefixed.
 *  - safe : get safe urls for use in emails, chat apps or any application auto linking urls.
 *  All parameters and values will be encoded in a way that it's safe to share them.
 *  Default to false for legacy reasons ()
 * @return {string} the query string
 */
exports.getQueryStringFromState = function(state, options) {
  var moreAttributes = options && options.moreAttributes;
  var prefixForParameters = options && options.prefix || '';
  var mapping = options && options.mapping || {};
  var safe = options && options.safe || false;
  var invertedMapping = invert(mapping);

  var stateForUrl = safe ? state : recursiveEncode(state);

  var encodedState = mapKeys(
    stateForUrl,
    function(v, k) {
      var shortK = shortener.encode(k);
      return prefixForParameters + (mapping[shortK] || shortK);
    }
  );

  var prefixRegexp = prefixForParameters === '' ? null : new RegExp('^' + prefixForParameters);
  var sort = bind(sortQueryStringValues, null, prefixRegexp, invertedMapping);
  if (!isEmpty(moreAttributes)) {
    var stateQs = qs.stringify(encodedState, {encode: safe, sort: sort});
    var moreQs = qs.stringify(moreAttributes, {encode: safe});
    if (!stateQs) return moreQs;
    return stateQs + '&' + moreQs;
  }

  return qs.stringify(encodedState, {encode: safe, sort: sort});
};
