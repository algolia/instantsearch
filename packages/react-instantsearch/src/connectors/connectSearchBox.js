import createConnector from '../core/createConnector';
import {omit} from 'lodash';

function getId() {
  return 'q';
}

function getCurrentRefinement(props, state) {
  const id = getId();
  if (typeof state[id] !== 'undefined') {
    return state[id];
  }
  return '';
}

/**
 * connectSearchBox connector provides the logic to build a widget that will
 * let the user search for a query.
 * @name connectSearchBox
 * @kind connector
 * @category connector
 * @propType {string} [id="q"] - URL state serialization key. The state of this widget takes the form of a `string`.
 * @propType {string[]} [focusShortcuts=['s','/']] - List of keyboard shortcuts that focus the search box. Accepts key names and key codes.
 * @propType {boolean} [autoFocus=false] - Should the search box be focused on render?
 * @propType {boolean} [searchAsYouType=true] - Should we search on every change to the query? If you disable this option, new searches will only be triggered by clicking the search button or by pressing the enter key while the search box is focused.
 * @providedPropType {function} refine - a function to remove a single filter
 * @providedPropType {function} createURL - a function to generate a URL for the corresponding state
 * @providedPropType {string} query - the query to search for.
 */
export default createConnector({
  displayName: 'AlgoliaSearchBox',

  getProps(props, state) {
    return {
      query: getCurrentRefinement(props, state),
    };
  },

  refine(props, state, nextQuery) {
    const id = getId();
    return {
      ...state,
      [id]: nextQuery,
    };
  },

  cleanUp(props, state) {
    return omit(state, getId());
  },

  getSearchParameters(searchParameters, props, state) {
    return searchParameters.setQuery(getCurrentRefinement(props, state));
  },
});
