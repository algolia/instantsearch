import AlgoliaSearchHelper from './src/algoliasearch.helper.js';
import RecommendParameters from './src/RecommendParameters/index.js';
import RecommendResults from './src/RecommendResults/index.js';
import SearchParameters from './src/SearchParameters/index.js';
import SearchResults from './src/SearchResults/index.js';

/**
 * The algoliasearchHelper module is the function that will let its
 * contains everything needed to use the Algoliasearch
 * Helper. It is a also a function that instanciate the helper.
 * To use the helper, you also need the Algolia JS client v3.
 * @example
 * //using the UMD build
 * var client = algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76');
 * var helper = algoliasearchHelper(client, 'bestbuy', {
 *   facets: ['shipping'],
 *   disjunctiveFacets: ['category']
 * });
 * helper.on('result', function(event) {
 *   console.log(event.results);
 * });
 * helper
 *   .toggleFacetRefinement('category', 'Movies & TV Shows')
 *   .toggleFacetRefinement('shipping', 'Free shipping')
 *   .search();
 * @example
 * // The helper is an event emitter using the node API
 * helper.on('result', updateTheResults);
 * helper.once('result', updateTheResults);
 * helper.removeListener('result', updateTheResults);
 * helper.removeAllListeners('result');
 * @module algoliasearchHelper
 * @param  {AlgoliaSearch} client an AlgoliaSearch client
 * @param  {string} index the name of the index to query
 * @param  {SearchParameters|object} opts an object defining the initial config of the search. It doesn't have to be a {SearchParameters}, just an object containing the properties you need from it.
 * @param {SearchResultsOptions|object} searchResultsOptions an object defining the options to use when creating the search results.
 * @return {AlgoliaSearchHelper} The helper instance
 */

function algoliasearchHelper(client, index, opts, searchResultsOptions) {
  return new AlgoliaSearchHelper(client, index, opts, searchResultsOptions);
}

import version from './src/version.js';
algoliasearchHelper.version = version;

/**
 * Constructor for the Helper.
 * @member module:algoliasearchHelper.AlgoliaSearchHelper
 * @type {AlgoliaSearchHelper}
 */
algoliasearchHelper.AlgoliaSearchHelper = AlgoliaSearchHelper;

/**
 * Constructor for the object containing all the parameters of the search.
 * @member module:algoliasearchHelper.SearchParameters
 * @type {SearchParameters}
 */
algoliasearchHelper.SearchParameters = SearchParameters;

/**
 * Constructor for the object containing all the parameters for Recommend.
 * @member module:algoliasearchHelper.RecommendParameters
 * @type {RecommendParameters}
 */
algoliasearchHelper.RecommendParameters = RecommendParameters;

/**
 * Constructor for the object containing the results of the search.
 * @member module:algoliasearchHelper.SearchResults
 * @type {SearchResults}
 */
algoliasearchHelper.SearchResults = SearchResults;

/**
 * Constructor for the object containing the results for Recommend.
 * @member module:algoliasearchHelper.RecommendResults
 * @type {RecommendResults}
 */
algoliasearchHelper.RecommendResults = RecommendResults;

export default algoliasearchHelper;
