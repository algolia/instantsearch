import {checkRendering} from '../../lib/utils.js';

const usage = `Usage:
var customSearchBox = connectMenu(function render(params, isFirstRendering) {
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
    [ onQueryHook ],
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectSearchBox.html
`;

/**
 * @typedef {Object} CustomSearchBoxWidgetOptions
 * @param {function} queryHook A function that will be called every time a new search would be done. You
 * will get the query as first parameter and a search(query) function to call as the second parameter.
 * This queryHook can be used to debounce the number of searches done from the searchBox.
 */

/**
 * @typedef {Object} SearchBoxRenderingOptions
 * @property {string} query the query from the last search
 * @property {function} onHistoryChange set a callback when the browser history changes
 * @property {function} search triggers the search with a `query` as parameter
 * @property {Object} widgetParams all original options forwarded to rendering
 * @property {InstantSearch} instantSearchInstance the instance of instantsearch on which the widget is attached
 */

 /**
  * Connects a rendering function with the search box business logic.
  * @param {function(SearchBoxRenderingOptions, boolean)} renderFn function that renders the search box widget
  * @return {function(CustomSearchBoxWidgetOptions)} a widget factory for search box widget
  */
export default function connectSearchBox(renderFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const {queryHook} = widgetParams;

    return {
      init({helper, onHistoryChange, instantSearchInstance}) {
        this._search = (() => {
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
          search: this._search,
          widgetParams,
          instantSearchInstance,
        }, true);
      },

      render({helper, instantSearchInstance}) {
        renderFn({
          query: helper.state.query,
          onHistoryChange: this._onHistoryChange,
          search: this._search,
          widgetParams,
          instantSearchInstance,
        }, false);
      },
    };
  };
}
