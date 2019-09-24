import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
} from '../../lib/utils';

const withUsage = createDocumentationMessageGenerator({
  name: 'search-box',
  connector: true,
});

/**
 * @typedef {Object} CustomSearchBoxWidgetOptions
 * @property {function(string, function(string))} [queryHook = undefined] A function that will be called every time
 * a new value for the query is set. The first parameter is the query and the second is a
 * function to actually trigger the search. The function takes the query as the parameter.
 *
 * This queryHook can be used to debounce the number of searches done from the searchBox.
 */

/**
 * @typedef {Object} SearchBoxRenderingOptions
 * @property {string} query The query from the last search.
 * @property {function(string)} refine Sets a new query and searches.
 * @property {function()} clear Remove the query and perform search.
 * @property {Object} widgetParams All original `CustomSearchBoxWidgetOptions` forwarded to the `renderFn`.
 * @property {boolean} isSearchStalled `true` if the search results takes more than a certain time to come back
 * from Algolia servers. This can be configured on the InstantSearch constructor with the attribute
 * `stalledSearchDelay` which is 200ms, by default.
 */

/**
 * **SearchBox** connector provides the logic to build a widget that will let the user search for a query.
 *
 * The connector provides to the rendering: `refine()` to set the query. The behaviour of this function
 * may be impacted by the `queryHook` widget parameter.
 * @type {Connector}
 * @param {function(SearchBoxRenderingOptions, boolean)} renderFn Rendering function for the custom **SearchBox** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(CustomSearchBoxWidgetOptions)} Re-usable widget factory for a custom **SearchBox** widget.
 * @example
 * // custom `renderFn` to render the custom SearchBox widget
 * function renderFn(SearchBoxRenderingOptions, isFirstRendering) {
 *   if (isFirstRendering) {
 *     SearchBoxRenderingOptions.widgetParams.containerNode.html('<input type="text" />');
 *     SearchBoxRenderingOptions.widgetParams.containerNode
 *       .find('input')
 *       .on('keyup', function() {
 *         SearchBoxRenderingOptions.refine($(this).val());
 *       });
 *     SearchBoxRenderingOptions.widgetParams.containerNode
 *       .find('input')
 *       .val(SearchBoxRenderingOptions.query);
 *   }
 * }
 *
 * // connect `renderFn` to SearchBox logic
 * var customSearchBox = instantsearch.connectors.connectSearchBox(renderFn);
 *
 * // mount widget on the page
 * search.addWidgets([
 *   customSearchBox({
 *     containerNode: $('#custom-searchbox'),
 *   })
 * ]);
 */
export default function connectSearchBox(renderFn, unmountFn = noop) {
  checkRendering(renderFn, withUsage());

  return (widgetParams = {}) => {
    const { queryHook } = widgetParams;

    function clear(helper) {
      return function() {
        helper.setQuery('');
        helper.search();
      };
    }

    return {
      $$type: 'ais.searchBox',

      _clear() {},

      _cachedClear() {
        this._clear();
      },

      init({ helper, instantSearchInstance }) {
        this._cachedClear = this._cachedClear.bind(this);
        this._clear = clear(helper);

        const setQueryAndSearch = query => {
          if (query !== helper.state.query) {
            helper.setQuery(query).search();
          }
        };

        this._refine = query => {
          if (queryHook) {
            queryHook(query, setQueryAndSearch);
            return;
          }

          setQueryAndSearch(query);
        };

        renderFn(
          {
            query: helper.state.query || '',
            refine: this._refine,
            clear: this._cachedClear,
            widgetParams,
            instantSearchInstance,
          },
          true
        );
      },

      render({ helper, instantSearchInstance, searchMetadata }) {
        this._clear = clear(helper);

        renderFn(
          {
            query: helper.state.query || '',
            refine: this._refine,
            clear: this._cachedClear,
            widgetParams,
            instantSearchInstance,
            isSearchStalled: searchMetadata.isSearchStalled,
          },
          false
        );
      },

      dispose({ state }) {
        unmountFn();

        return state.setQueryParameter('query', undefined);
      },

      getWidgetState(uiState, { searchParameters }) {
        const query = searchParameters.query || '';

        if (query === '' || (uiState && uiState.query === query)) {
          return uiState;
        }

        return {
          ...uiState,
          query,
        };
      },

      getWidgetSearchParameters(searchParameters, { uiState }) {
        return searchParameters.setQueryParameter('query', uiState.query || '');
      },
    };
  };
}
