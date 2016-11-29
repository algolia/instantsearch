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
