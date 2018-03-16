import { checkRendering } from '../../lib/utils.js';

const usage = `Usage:
var customSearchBox = connectSearchBox(function render(params, isFirstRendering) {
  // params = {
  //   query,
  //   onHistoryChange,
  //   refine,
  //   instantSearchInstance,
  //   widgetParams,
  //   clear,
  // }
});
search.addWidget(
  customSearchBox({
    [ queryHook ],
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/v2/connectors/connectSearchBox.html
`;

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
 * @property {function(SearchParameters)} onHistoryChange Registers a callback when the browser history changes.
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
 * search.addWidget(
 *   customSearchBox({
 *     containerNode: $('#custom-searchbox'),
 *   })
 * );
 */
export default function connectSearchBox(renderFn, unmountFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const { queryHook } = widgetParams;

    function clear(helper) {
      return function() {
        helper.setQuery('');
        helper.search();
      };
    }

    return {
      _clear() {},
      _cachedClear() {
        this._clear();
      },

      init({ helper, onHistoryChange, instantSearchInstance }) {
        this._cachedClear = this._cachedClear.bind(this);
        this._clear = clear(helper);

        this._refine = (() => {
          let previousQuery;

          const setQueryAndSearch = (q, doSearch = true) => {
            if (q !== helper.state.query) {
              previousQuery = helper.state.query;
              helper.setQuery(q);
            }
            if (doSearch && previousQuery !== undefined && previousQuery !== q)
              helper.search();
          };

          return queryHook
            ? q => queryHook(q, setQueryAndSearch)
            : setQueryAndSearch;
        })();

        this._onHistoryChange = onHistoryChange;

        renderFn(
          {
            query: helper.state.query,
            onHistoryChange: this._onHistoryChange,
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
            query: helper.state.query,
            onHistoryChange: this._onHistoryChange,
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
        return state.setQuery('');
      },

      getWidgetState(fullState, { state }) {
        const query = state.query;

        if (query === '' || (fullState && fullState.query === query)) {
          return fullState;
        }

        return {
          ...fullState,
          query,
        };
      },

      getWidgetSearchParameters(searchParam, { uiState }) {
        return searchParam.setQuery(uiState.query || '');
      },
    };
  };
}
