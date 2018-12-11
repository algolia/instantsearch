/** @module module:instantsearch */

import toFactory from 'to-factory';

import InstantSearch from './InstantSearch.js';
import version from './version.js';

import * as connectors from '../connectors/index.js';
import * as widgets from '../widgets/index.js';
import * as helpers from '../helpers/index.js';

import * as routers from './routers/index.js';
import * as stateMappings from './stateMappings/index.js';

/**
 * @external SearchParameters
 * @see https://www.algolia.com/doc/api-reference/search-api-parameters/
 */

/**
 * @external InstantSearch
 * @see /instantsearch.html
 */

/**
 * @typedef {Object|boolean} RoutingOptions
 * @property {Router} [router=HistoryRouter()] The router is the part that will save the UI State.
 * By default, it uses an instance of the `HistoryRouter` with the default parameters.
 * @property {StateMapping} [stateMapping=SimpleStateMapping()] This object transforms the UI state into
 * the object that willl be saved by the router.
 */

/**
 * The state mapping is a way to customize the structure before sending it to the router. It can transform
 * and filter out the properties. To work correctly, for any state ui S, the following should be valid:
 * `S = routeToState(stateToRoute(S))`.
 * @typedef {Object} StateMapping
 * @property {function} stateToRoute Transforms a UI state representation into a route object.
 * It receives an object that contains the UI state of all the widgets in the page. It should
 * return an object of any form as long as this form can be read by the `routeToState`.
 * @property {function} routeToState Transforms route object into a UI state representation.
 * It receives an object that contains the UI state stored by the router. The format is the output
 * of `stateToRoute`.
 */

/**
 * The router is the part that saves and reads the object from the storage (most of the time the URL).
 * @typedef {Object} Router
 * @property {function} onUpdate Sets an event listener that is triggered when the storage is updated.
 * The function should accept a callback to trigger when the update happens. In the case of the history
 * / URL in a browser, the callback will be called by `onPopState`.
 * @property {function} read Reads the storage and gets a route object. It does not take parameters,
 * and should return an object.
 * @property {function} write Pushes a route object into a storage. Takes the UI state mapped by the state
 * mapping configured in the mapping.
 * @property {function} createURL Transforms a route object into a URL. It receives an object and should
 * return a string. It may return an empty string.
 * @property {function} dispose Cleans up any event listeners.
 */

/**
 * @typedef {Object} SearchClient
 * @property {function} search Performs the requests in the hits.
 * @property {function} searchForFacetValues Performs the requests in the facet values.
 */

/**
 * @typedef {Object} InstantSearchOptions
 * @property {string} indexName The name of the main index
 * @property {SearchClient} searchClient The search client to plug to InstantSearch.js
 *
 * Usage:
 * ```javascript
 * // Using the default Algolia search client
 * instantsearch({
 *   indexName: 'indexName',
 *   searchClient: algoliasearch('appId', 'apiKey')
 * });
 *
 * // Using a custom search client
 * instantsearch({
 *   indexName: 'indexName',
 *   searchClient: {
 *     search(requests) {
 *       // fetch response based on requests
 *       return response;
 *     },
 *     searchForFacetValues(requests) {
 *       // fetch response based on requests
 *       return response;
 *     }
 *   }
 * });
 * ```
 * @property {string} [numberLocale] The locale used to display numbers. This will be passed
 * to [`Number.prototype.toLocaleString()`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString)
 * @property {function} [searchFunction] A hook that will be called each time a search needs to be done, with the
 * helper as a parameter. It's your responsibility to call `helper.search()`. This option allows you to avoid doing
 * searches at page load for example.
 * @property {object} [searchParameters] Additional parameters to pass to
 * the Algolia API ([see full documentation](https://community.algolia.com/algoliasearch-helper-js/reference.html#searchparameters)).
 * @property {number} [stalledSearchDelay=200] Time before a search is considered stalled.
 * @property {RoutingOptions} [routing] Router configuration used to save the UI State into the URL or
 * any client side persistence.
 */

/**
 * InstantSearch is the main component of InstantSearch.js. This object
 * manages the widget and lets you add new ones.
 *
 * Two parameters are required to get you started with InstantSearch.js:
 *  - `indexName`: the main index that you will use for your new search UI
 *  - `searchClient`: the search client to plug to InstantSearch.js
 *
 * The [search client provided by Algolia](https://github.com/algolia/algoliasearch-client-javascript)
 * needs an `appId` and an `apiKey`. Those parameters can be found in your
 * [Algolia dashboard](https://www.algolia.com/api-keys).
 *
 * If you want to get up and running quickly with InstantSearch.js, have a
 * look at the [getting started](getting-started.html).
 * @function instantsearch
 * @param {InstantSearchOptions} $0 The options
 * @return {InstantSearch} the instantsearch instance
 */
const instantsearch = toFactory(InstantSearch);

instantsearch.routers = routers;
instantsearch.stateMappings = stateMappings;
instantsearch.connectors = connectors;
instantsearch.widgets = widgets;
instantsearch.version = version;
instantsearch.highlight = helpers.highlight;
instantsearch.snippet = helpers.snippet;

export default instantsearch;
