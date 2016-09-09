'use strict';
module.exports = function(algoliasearchHelper) {
  return function() {
    var helper = algoliasearchHelper(null, null, {
      disjunctiveFacets: ['categories']
    });
    helper.addDisjunctiveFacetRefinement('categories', 'phone')
          .addDisjunctiveFacetRefinement('categories', 'camera')
          .removeDisjunctiveFacetRefinement('categories', 'phone')
          .addDisjunctiveFacetRefinement('categories', 'bed')
          .removeDisjunctiveFacetRefinement('categories', 'camera')
          .addNumericRefinement('price', '>', 3)
          .addNumericRefinement('price', '<', '7')
          .removeNumericRefinement('price', '>', '3')
          .removeNumericRefinement('price');
  };
};
