import {
  getContainerNode,
} from '../../lib/utils.js';
import defaultTemplates from './defaultTemplates.js';

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

const usage = `Usage:
searchBox({
  container,
  [ placeholder ],
  [ cssClasses.{input,poweredBy} ],
  [ poweredBy=false || poweredBy.{template, cssClasses.{root,link}} ],
  [ wrapInput ],
  [ autofocus ],
  [ searchOnEnterKeyPressOnly ],
  [ queryHook ]
})`;
const connectSearchBox = searchBoxRendering => ({
  container,
  placeholder = '',
  cssClasses = {},
  poweredBy = false,
  wrapInput = true,
  autofocus = 'auto',
  searchOnEnterKeyPressOnly = false,
  queryHook,
}) => {
  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  // Only possible values are 'auto', true and false
  if (typeof autofocus !== 'boolean') {
    autofocus = 'auto';
  }

  // Convert to object if only set to true
  if (poweredBy === true) {
    poweredBy = {};
  }

  return {
    init({state, helper, onHistoryChange}) {
      searchBoxRendering({
        query: state.query,
        containerNode,
        onHistoryChange,
        poweredBy,
        helper,
        wrapInput,
        autofocus,
        queryHook,
        searchOnEnterKeyPressOnly,
        placeholder,
        cssClasses,
        templates: defaultTemplates,
      }, true);
    },
    render({helper}) {
      searchBoxRendering({
        query: helper.state.query,
        containerNode,
        onHistoryChange: () => {},
        poweredBy,
        helper,
        wrapInput,
        autofocus,
        queryHook,
        searchOnEnterKeyPressOnly,
        placeholder,
        cssClasses,
        templates: defaultTemplates,
      }, false);
    },
  };
};

export default connectSearchBox;
