import { AlgoliaSearchHelper } from 'algoliasearch-helper';

/**
 * Clears the refinements of a SearchParameters object based on rules provided.
 * The included attributes list is applied before the excluded attributes list. If the list
 * is not provided, this list of all the currently refined attributes is used as included attributes.
 * @param {object} $0 parameters
 * @param {Helper} $0.helper instance of the Helper
 * @param {string[]} [$0.attributesToClear = []] list of parameters to clear
 * @returns {SearchParameters} search parameters with refinements cleared
 */
function clearRefinements({
  helper,
  attributesToClear = [],
}: {
  helper: AlgoliaSearchHelper;
  attributesToClear?: string[];
}) {
  let finalState = helper.state.setPage(0);

  attributesToClear.forEach(attribute => {
    if (
      finalState.isHierarchicalFacet(attribute) &&
      // `removeHierarchicalFacetRefinement` throws an error if the hierarchical facet is not refined
      // https://github.com/algolia/algoliasearch-helper-js/blob/f4dab89dcce68d46596d5b8a5e88f18f28b13330/src/SearchParameters/index.js#L1324
      finalState.isHierarchicalFacetRefined(attribute)
    ) {
      finalState = finalState.removeHierarchicalFacetRefinement(attribute);
    } else if (finalState.isDisjunctiveFacet(attribute)) {
      finalState = finalState.removeDisjunctiveFacetRefinement(attribute);
    } else if (finalState.isConjunctiveFacet(attribute)) {
      finalState = finalState.removeFacetRefinement(attribute);
      // @ts-ignore: error is TS definition file, `operator` attribute is optional
    } else if (finalState.isNumericRefined(attribute)) {
      finalState = finalState.removeNumericRefinement(attribute);
    }
  });

  if (attributesToClear.indexOf('query') !== -1) {
    finalState = finalState.setQuery('');
  }

  return finalState;
}

export default clearRefinements;
