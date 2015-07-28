'use strict';

module.exports = generateTrees;

var last = require('lodash/array/last');
var map = require('lodash/collection/map');
var reduce = require('lodash/collection/reduce');
var sortByOrder = require('lodash/collection/sortByOrder');
var trim = require('lodash/string/trim');
var find = require('lodash/collection/find');
var pick = require('lodash/object/pick');

function generateTrees(state) {
  return function generate(hierarchicalFacetResult, hierarchicalFacetIndex) {
    var hierarchicalFacet = state.hierarchicalFacets[hierarchicalFacetIndex];
    var hierarchicalFacetRefinement = state.hierarchicalFacetsRefinements[hierarchicalFacet.name] &&
      state.hierarchicalFacetsRefinements[hierarchicalFacet.name][0] || '';
    var hierarchicalSeparator = state._getHierarchicalFacetSeparator(hierarchicalFacet);
    var sortBy = prepareHierarchicalFacetSortBy(state._getHierarchicalFacetSortBy(hierarchicalFacet));
    var alwaysGetRootLevel = hierarchicalFacet.alwaysGetRootLevel;

    return reduce(hierarchicalFacetResult, generateHierarchicalTree(sortBy, hierarchicalSeparator, hierarchicalFacetRefinement, alwaysGetRootLevel), {
      name: state.hierarchicalFacets[hierarchicalFacetIndex].name,
      count: null, // root level, no count
      isRefined: true, // root level, always refined
      path: null, // root level, no path
      data: null
    });
  };
}

function generateHierarchicalTree(sortBy, hierarchicalSeparator, currentRefinement, alwaysGetRootLevel) {
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
          // filter values in case an object has:
          //   {
          //     categories: {
          //       level0: ['beers', 'bières'],
          //       level1: ['beers > IPA', 'bières > Belges']
          //     }
          //   }
          //
          // If parent refinement is `beers`, then we do not want to have `bières > Belges`
          // showing up
          pick(hierarchicalFacetResult.data, filterFacetValues(parent.path, currentRefinement, hierarchicalSeparator, alwaysGetRootLevel)),
          formatHierarchicalFacetValue(hierarchicalSeparator, currentRefinement)
        ),
        sortBy[0], sortBy[1]
      );
    }

    return hierarchicalTree;
  };
}

function filterFacetValues(parentPath, currentRefinement, hierarchicalSeparator, alwaysGetRootLevel) {
  return function(facetCount, facetValue) {
    // we always want root levels and facetValue is a root level
    return alwaysGetRootLevel === true && facetValue.indexOf(hierarchicalSeparator === -1) ||
      // if current refinement is a root level and current facetValue is a root level,
      // keep the facetValue
      facetValue.indexOf(hierarchicalSeparator) === -1 &&
      currentRefinement.indexOf(hierarchicalSeparator) === -1 ||
      // currentRefinement is a child of the facet value
      currentRefinement.indexOf(facetValue + hierarchicalSeparator) === 0 ||
      // facetValue is a child of the current parent, add it
      facetValue.indexOf(parentPath + hierarchicalSeparator) === 0;
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

// ['isRefined:desc', 'count:asc'] => [['isRefined', 'count'], ['desc', 'asc']] (lodash sortByOrder format)
function prepareHierarchicalFacetSortBy(sortBy) {
  return reduce(sortBy, function prepare(out, sortInstruction) {
    var sortInstructions = sortInstruction.split(':');
    out[0].push(sortInstructions[0]);
    out[1].push(sortInstructions[1]);
    return out;
  }, [[], []]);
}
