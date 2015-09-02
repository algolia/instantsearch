'use strict';

var reduce = require('lodash/collection/reduce');

/**
 * Transform sort format from user friendly notation to lodash format
 * @param {string[]} sortBy array of predicate of the form "attribute:order"
 * @return {array.<string[]>} array containing 2 elements : attributes, orders
 */
module.exports = function formatSort(sortBy) {
  return reduce(sortBy, function preparePredicate(out, sortInstruction) {
    var sortInstructions = sortInstruction.split(':');
    out[0].push(sortInstructions[0]);
    out[1].push(sortInstructions[1]);
    return out;
  }, [[], []]);
};
