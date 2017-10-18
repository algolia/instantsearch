'use strict';

/**
 * Functions to manipulate refinement lists
 *
 * The RefinementList is not formally defined through a prototype but is based
 * on a specific structure.
 *
 * @module SearchParameters.refinementList
 *
 * @typedef {string[]} SearchParameters.refinementList.Refinements
 * @typedef {Object.<string, SearchParameters.refinementList.Refinements>} SearchParameters.refinementList.RefinementList
 */

var isUndefined = require('lodash/isUndefined');
var isString = require('lodash/isString');
var isFunction = require('lodash/isFunction');
var isEmpty = require('lodash/isEmpty');
var defaults = require('lodash/defaults');

var reduce = require('lodash/reduce');
var filter = require('lodash/filter');
var omit = require('lodash/omit');

var lib = {
  /**
   * Adds a refinement to a RefinementList
   * @param {RefinementList} refinementList the initial list
   * @param {string} attribute the attribute to refine
   * @param {string} value the value of the refinement, if the value is not a string it will be converted
   * @return {RefinementList} a new and updated refinement list
   */
  addRefinement: function addRefinement(refinementList, attribute, value) {
    if (lib.isRefined(refinementList, attribute, value)) {
      return refinementList;
    }

    var valueAsString = '' + value;

    var facetRefinement = !refinementList[attribute] ?
      [valueAsString] :
      refinementList[attribute].concat(valueAsString);

    var mod = {};

    mod[attribute] = facetRefinement;

    return defaults({}, mod, refinementList);
  },
  /**
   * Removes refinement(s) for an attribute:
   *  - if the value is specified removes the refinement for the value on the attribute
   *  - if no value is specified removes all the refinements for this attribute
   * @param {RefinementList} refinementList the initial list
   * @param {string} attribute the attribute to refine
   * @param {string} [value] the value of the refinement
   * @return {RefinementList} a new and updated refinement lst
   */
  removeRefinement: function removeRefinement(refinementList, attribute, value) {
    if (isUndefined(value)) {
      return lib.clearRefinement(refinementList, attribute);
    }

    var valueAsString = '' + value;

    return lib.clearRefinement(refinementList, function(v, f) {
      return attribute === f && valueAsString === v;
    });
  },
  /**
   * Toggles the refinement value for an attribute.
   * @param {RefinementList} refinementList the initial list
   * @param {string} attribute the attribute to refine
   * @param {string} value the value of the refinement
   * @return {RefinementList} a new and updated list
   */
  toggleRefinement: function toggleRefinement(refinementList, attribute, value) {
    if (isUndefined(value)) throw new Error('toggleRefinement should be used with a value');

    if (lib.isRefined(refinementList, attribute, value)) {
      return lib.removeRefinement(refinementList, attribute, value);
    }

    return lib.addRefinement(refinementList, attribute, value);
  },
  /**
   * Clear all or parts of a RefinementList. Depending on the arguments, three
   * kinds of behavior can happen:
   *  - if no attribute is provided: clears the whole list
   *  - if an attribute is provided as a string: clears the list for the specific attribute
   *  - if an attribute is provided as a function: discards the elements for which the function returns true
   * @param {RefinementList} refinementList the initial list
   * @param {string} [attribute] the attribute or function to discard
   * @param {string} [refinementType] optional parameter to give more context to the attribute function
   * @return {RefinementList} a new and updated refinement list
   */
  clearRefinement: function clearRefinement(refinementList, attribute, refinementType) {
    if (isUndefined(attribute)) {
      if (isEmpty(refinementList)) return refinementList;
      return {};
    } else if (isString(attribute)) {
      if (isEmpty(refinementList[attribute])) return refinementList;
      return omit(refinementList, attribute);
    } else if (isFunction(attribute)) {
      var hasChanged = false;

      var newRefinementList = reduce(refinementList, function(memo, values, key) {
        var facetList = filter(values, function(value) {
          return !attribute(value, key, refinementType);
        });

        if (!isEmpty(facetList)) {
          if (facetList.length !== values.length) hasChanged = true;
          memo[key] = facetList;
        }
        else hasChanged = true;

        return memo;
      }, {});

      if (hasChanged) return newRefinementList;
      return refinementList;
    }
  },
  /**
   * Test if the refinement value is used for the attribute. If no refinement value
   * is provided, test if the refinementList contains any refinement for the
   * given attribute.
   * @param {RefinementList} refinementList the list of refinement
   * @param {string} attribute name of the attribute
   * @param {string} [refinementValue] value of the filter/refinement
   * @return {boolean}
   */
  isRefined: function isRefined(refinementList, attribute, refinementValue) {
    var indexOf = require('lodash/indexOf');

    var containsRefinements = !!refinementList[attribute] &&
      refinementList[attribute].length > 0;

    if (isUndefined(refinementValue) || !containsRefinements) {
      return containsRefinements;
    }

    var refinementValueAsString = '' + refinementValue;

    return indexOf(refinementList[attribute], refinementValueAsString) !== -1;
  }
};

module.exports = lib;
