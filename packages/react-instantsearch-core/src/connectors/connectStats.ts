import createConnector from '../core/createConnector';
import { getResults } from '../core/indexUtils';

/**
 * connectStats connector provides the logic to build a widget that will
 *  displays algolia search statistics (hits number and processing time).
 * @name connectStats
 * @kind connector
 * @providedPropType {number} nbHits - number of hits returned by Algolia.
 * @providedPropType {number} nbSortedHits - number of sorted hits returned by Algolia.
 * @providedPropType {number} processingTimeMS - the time in ms took by Algolia to search for results.
 */
export default createConnector({
  displayName: 'AlgoliaStats',

  getProvidedProps(props, _searchState, searchResults) {
    const results = getResults(searchResults, {
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });

    if (!results) {
      return null;
    }

    return {
      areHitsSorted:
        results.appliedRelevancyStrictness !== undefined &&
        results.appliedRelevancyStrictness > 0 &&
        results.nbHits !== results.nbSortedHits,
      nbHits: results.nbHits,
      nbSortedHits: results.nbSortedHits,
      processingTimeMS: results.processingTimeMS,
    };
  },
});
