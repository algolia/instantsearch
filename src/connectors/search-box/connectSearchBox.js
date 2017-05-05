import {checkRendering} from '../../lib/utils.js';

const usage = `Usage:
var customSearchBox = connectSearchBox(function render(params, isFirstRendering) {
  // params = {
  //   query,
  //   onHistoryChange,
  //   search,
  //   instantSearchInstance,
  //   widgetParams,
  // }
});
search.addWidget(
  customSearchBox({
    [ queryHook ],
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectSearchBox.html
`;

/**
 * @typedef {Object} CustomSearchBoxWidgetOptions
 * @property {function} [queryHook = undefined] A function that will be called every time a new search would be done. You will get the query as first parameter and a search(query) function to call as the second parameter.
 * This queryHook can be used to debounce the number of searches done from the searchBox.
 */

/**
 * @typedef {Object} SearchBoxRenderingOptions
 * @property {string} query The query from the last search.
 * @property {function} onHistoryChange Register a callback when the browser history changes.
 * @property {function(query)} refine Action to trigger the search with a `query` as parameter.
 * @property {Object} widgetParams All original `CustomSearchBoxWidgetOptions` forwarded to the `renderFn`.
 */

/**
 * **SearchBox** connector provides the logic to build a widget that will let the user search for a query.
 * @type {Connector}
 * @param {function(SearchBoxRenderingOptions, boolean)} renderFn Rendering function for the custom **SearchBox** widget.
 * @return {function(CustomSearchBoxWidgetOptions)} Re-usable widget factory for a custom **SearchBox** widget.
 * @example
 * // custom `renderFn` to render the custom SearchBox widget
 * function renderFn(SearchBoxRenderingOptions, isFirstRendering) {
 *   if (isFirstRendering) {
 *     SearchBoxRenderingOptions.widgetParams.inputNode.on('keyup', function() {
 *       SearchBoxRenderingOptions.refine($(this).val());
 *     });
 *     SearchBoxRenderingOptions.widgetParams.inputNode.val(SearchBoxRenderingOptions.query);
 *   }
 * }
 *
 * // connect `renderFn` to SearchBox logic
 * var customSearchBox = instantsearch.connectors.connectSearchBox(renderFn);
 *
 * // mount widget on the page
 * search.addWidget(
 *   customSearchBox({
 *     inputNode: $('input#custom-searchbox'),
 *   })
 * );
 */
export default function connectSearchBox(renderFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const {queryHook} = widgetParams;

    return {
      init({helper, onHistoryChange, instantSearchInstance}) {
        this._refine = (() => {
          let previousQuery;

          const setQueryAndSearch = (q, doSearch = true) => {
            if (q !== helper.state.query) {
              previousQuery = helper.state.query;
              helper.setQuery(q);
            }
            if (doSearch && previousQuery !== undefined && previousQuery !== q) helper.search();
          };

          return queryHook ?
            q => queryHook(q, setQueryAndSearch) :
            setQueryAndSearch;
        })();

        this._onHistoryChange = onHistoryChange;

        renderFn({
          query: helper.state.query,
          onHistoryChange: this._onHistoryChange,
          refine: this._refine,
          widgetParams,
          instantSearchInstance,
        }, true);
      },

      render({helper, instantSearchInstance}) {
        renderFn({
          query: helper.state.query,
          onHistoryChange: this._onHistoryChange,
          refine: this._refine,
          widgetParams,
          instantSearchInstance,
        }, false);
      },
    };
  };
}
