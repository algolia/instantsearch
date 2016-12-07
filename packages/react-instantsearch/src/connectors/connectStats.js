import createConnector from '../core/createConnector';

/**
 * connectStats connector provides the logic to build a widget that will
 *  displays algolia search statistics (hits number and processing time).
 * @name connectStats
 * @kind connector
 * @providedPropType {number} nbHits - number of hits returned by Algolia.
 * @providedPropType {number} processingTimeMS - the time in ms took by Algolia to search for results.
 */
export default createConnector({
  displayName: 'AlgoliaStats',

  getProvidedProps(props, searchState, searchResults) {
    if (!searchResults.results) {
      return null;
    }
    return {
      nbHits: searchResults.results.nbHits,
      processingTimeMS: searchResults.results.processingTimeMS,
    };
  },
});
