import {checkRendering} from '../../lib/utils.js';

const usage = `Usage:
var customSearchBox = connectMenu(function render(params, isFirstRendering) {
  // params = {
  //   query,
  //   onHistoryChange,
  //   search,
  // }
});
search.addWidget(
  customSearchBox({
    [ onQueryHook ]
  });
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectSearchBox.html
`;

/**
 * Instantiate a searchbox
 * @function searchBox
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} [options.placeholder] Input's placeholder [*]
 * @param  {boolean|Object} [options.poweredBy=false] Define if a "powered by Algolia" link should be added near the input
 * @param  {function|string} [options.poweredBy.template] Template used for displaying the link. Can accept a function or a Hogan string.
 * @param  {number} [options.poweredBy.cssClasses] CSS classes to add
 * @param  {string|string[]} [options.poweredBy.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.poweredBy.cssClasses.link] CSS class to add to the link element
 * @param  {boolean} [options.wrapInput=true] Wrap the input in a `div.ais-search-box`
 * @param  {boolean|string} [autofocus='auto'] autofocus on the input
 * @param  {boolean} [options.searchOnEnterKeyPressOnly=false] If set, trigger the search
 * once `<Enter>` is pressed only
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the
 * wrapping div (if `wrapInput` set to `true`)
 * @param  {string|string[]} [options.cssClasses.input] CSS class to add to the input
 * @param  {function} [options.queryHook] A function that will be called every time a new search would be done. You
 * will get the query as first parameter and a search(query) function to call as the second parameter.
 * This queryHook can be used to debounce the number of searches done from the searchBox.
 * @return {Object}
 */

export default function connectSearchBox(renderFn) {
  checkRendering(renderFn, usage);

  return ({queryHook}) => ({
    init({helper, onHistoryChange}) {
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
      }, true);
    },

    render({helper}) {
      renderFn({
        query: helper.state.query,
        onHistoryChange: this._onHistoryChange,
        search: this._search,
      }, false);
    },
  });
}
