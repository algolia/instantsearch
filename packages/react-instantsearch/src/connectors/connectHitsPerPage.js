import createConnector from '../core/createConnector';
import {omit} from 'lodash';

function getId() {
  return 'hitsPerPage';
}

function getCurrentRefinement(props, state) {
  const id = getId();
  if (typeof state[id] !== 'undefined') {
    if (typeof state[id] === 'string') {
      return parseInt(state[id], 10);
    }
    return state[id];
  }
  return props.defaultRefinement;
}

/**
 * connectHitsPerPage connector provides the logic to create connected
 * components that will allow a user to choose to display more or less results from Algolia.
 * @name connectHitsPerPage
 * @kind connector
 * @category connector
 * @propType {number} defaultRefinement - The number of items selected by default
 * @propType {{value, label}[]|number[]} items - List of hits per page options. Passing a list of numbers [n] is a shorthand for [{value: n, label: n}].
 * @providedPropType {function} refine - a function to remove a single filter
 * @providedPropType {function} createURL - a function to generate a URL for the corresponding state
 * @providedPropType {string} currentRefinement - the refinement currently applied
 */
export default createConnector({
  displayName: 'AlgoliaHitsPerPage',

  getProps(props, state) {
    return {
      currentRefinement: getCurrentRefinement(props, state),
    };
  },

  refine(props, state, nextHitsPerPage) {
    const id = getId();
    return {
      ...state,
      [id]: nextHitsPerPage,
    };
  },

  cleanUp(props, state) {
    return omit(state, getId());
  },

  getSearchParameters(searchParameters, props, state) {
    return searchParameters.setHitsPerPage(getCurrentRefinement(props, state));
  },

  getMetadata() {
    return {id: getId()};
  },
});
