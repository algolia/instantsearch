'use strict';

module.exports = generateTrees;

var find = require('lodash/collection/find');
var last = require('lodash/array/last');
var map = require('lodash/collection/map');
var reduce = require('lodash/collection/reduce');
var sortByOrder = require('lodash/collection/sortByOrder');
var trim = require('lodash/string/trim');

function generateTrees(state) {
  return function generate(hierarchicalFacetResult, hierarchicalFacetIndex) {
    var hierarchicalFacet = state.hierarchicalFacets[hierarchicalFacetIndex];
    var hierarchicalFacetRefinement = state.hierarchicalFacetsRefinements[hierarchicalFacet.name] || '';
    var hierarchicalSeparator = state.getHierarchicalFacetSeparator(hierarchicalFacet);

    return reduce(hierarchicalFacetResult, generateHierarchicalTree(hierarchicalSeparator, hierarchicalFacetRefinement), {
      name: state.hierarchicalFacets[hierarchicalFacetIndex].name,
      count: null, // root level, no count
      isRefined: true, // root level, always refined
      path: null, // root level, no path
      data: null
    });
  };
}

function generateHierarchicalTree(hierarchicalSeparator, currentRefinement) {
  return function generateTree(hierarchicalTree, hierarchicalFacetResult, currentHierarchicalLevel) {
    var parent = hierarchicalTree;

    if (currentHierarchicalLevel > 0) {
      var level = 0;

      parent = hierarchicalTree;

      while (level < currentHierarchicalLevel) {
        parent = parent && find(parent.data, {isRefined: true});
        level++;
      }
    }

    // we found a refined parent, let's add current level data under it
    if (parent) {
      parent.data = sortByOrder(
        map(
          hierarchicalFacetResult.data,
          formatHierarchicalFacetValue(hierarchicalSeparator, currentRefinement)
        ),
        ['isRefined', 'name', 'count'], ['desc', 'asc', 'desc']
      );
    }

    return hierarchicalTree;
  };
}

function formatHierarchicalFacetValue(hierarchicalSeparator, currentRefinement) {
  return function format(facetCount, facetValue) {
    return {
      name: trim(last(facetValue.split(hierarchicalSeparator))),
      path: facetValue,
      count: facetCount,
      isRefined: currentRefinement === facetValue || currentRefinement.indexOf(facetValue + hierarchicalSeparator) === 0,
      data: null
    };
  };
}
