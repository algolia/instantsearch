'use strict';

/**
 * Replaces a leading - with \-
 * @private
 * @param {string} value the facet value to replace
 * @returns string
 */
function escapeFacetValue(value) {
  return value.replace(/^-/, '\\-');
}

/**
 * Replaces a leading \- with -
 * @private
 * @param {string} value the escaped facet value
 * @returns string
 */
function unescapeFacetValue(value) {
  return value.replace(/^\\-/, '-');
}

module.exports = {
  escapeFacetValue: escapeFacetValue,
  unescapeFacetValue: unescapeFacetValue
};
