'use strict';

var objectHasKeys = require('../functions/objectHasKeys');

/**
 * @param {any[]} filters
 */
function filterState(state, filters) {
  var partialState = {};
  var attributeFilters = filters.filter(function(f) { return f.indexOf('attribute:') !== -1; });
  var attributes = attributeFilters.map(function(aF) { return aF.split(':')[1]; });

  if (attributes.indexOf('*') === -1) {
    attributes.forEach(function(attr) {
      if (state.isConjunctiveFacet(attr) && state.isFacetRefined(attr)) {
        if (!partialState.facetsRefinements) partialState.facetsRefinements = {};
        partialState.facetsRefinements[attr] = state.facetsRefinements[attr];
      }

      if (state.isDisjunctiveFacet(attr) && state.isDisjunctiveFacetRefined(attr)) {
        if (!partialState.disjunctiveFacetsRefinements) partialState.disjunctiveFacetsRefinements = {};
        partialState.disjunctiveFacetsRefinements[attr] = state.disjunctiveFacetsRefinements[attr];
      }

      if (state.isHierarchicalFacet(attr) && state.isHierarchicalFacetRefined(attr)) {
        if (!partialState.hierarchicalFacetsRefinements) partialState.hierarchicalFacetsRefinements = {};
        partialState.hierarchicalFacetsRefinements[attr] = state.hierarchicalFacetsRefinements[attr];
      }

      var numericRefinements = state.getNumericRefinements(attr);
      if (objectHasKeys(numericRefinements)) {
        if (!partialState.numericRefinements) partialState.numericRefinements = {};
        partialState.numericRefinements[attr] = state.numericRefinements[attr];
      }
    });
  } else {
    if (objectHasKeys(state.numericRefinements)) {
      partialState.numericRefinements = state.numericRefinements;
    }
    if (objectHasKeys(state.facetsRefinements)) partialState.facetsRefinements = state.facetsRefinements;
    if (objectHasKeys(state.disjunctiveFacetsRefinements)) {
      partialState.disjunctiveFacetsRefinements = state.disjunctiveFacetsRefinements;
    }
    if (objectHasKeys(state.hierarchicalFacetsRefinements)) {
      partialState.hierarchicalFacetsRefinements = state.hierarchicalFacetsRefinements;
    }
  }

  var searchParameters = filters.filter(function(f) {
    return f.indexOf('attribute:') === -1;
  });

  searchParameters.forEach(function(parameterKey) {
    partialState[parameterKey] = state[parameterKey];
  });

  return partialState;
}

module.exports = filterState;
