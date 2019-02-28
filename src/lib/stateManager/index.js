const AlgoliaSearchHelper = require('./src/algoliasearch.helper');

const SearchParameters = require('./src/SearchParameters');
const SearchResults = require('./src/SearchResults');

function algoliasearchHelper(client, index, opts) {
  return new AlgoliaSearchHelper(client, index, opts);
}

/**
 * The version currently used
 * @member module:algoliasearchHelper.version
 * @type {number}
 */
algoliasearchHelper.version = require('./src/version.js');

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
algoliasearchHelper.SearchParametersWithoutDefaults = SearchParameters;

/**
 * Constructor for the object containing the results of the search.
 * @member module:algoliasearchHelper.SearchResults
 * @type {SearchResults}
 */
algoliasearchHelper.SearchResults = SearchResults;

/**
 * URL tools to generate query string and parse them from/into
 * SearchParameters
 * @member module:algoliasearchHelper.url
 * @type {object} {@link url}
 *
 */
algoliasearchHelper.url = require('./src/url');

module.exports = algoliasearchHelper;
