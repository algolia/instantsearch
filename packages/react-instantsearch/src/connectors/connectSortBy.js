import {PropTypes} from 'react';
import {omit} from 'lodash';

import createConnector from '../core/createConnector';

function getId() {
  return 'sortBy';
}

function getCurrentRefinement(props, state) {
  const id = getId();
  if (state[id]) {
    return state[id];
  }
  if (props.defaultRefinement) {
    return props.defaultRefinement;
  }
  return null;
}

/**
 * connectSortBy connector provides the logic to build a widget that will
 *  displays a list of indexes allowing a user to change the hits are sorting.
 * @name connectSortBy
 * @kind connector
 * @propType {string} defaultRefinement - The default selected index.
 * @propType {{value, label}[]} items - The list of indexes to search in.
 * @providedPropType {function} refine - a function to remove a single filter
 * @providedPropType {function} createURL - a function to generate a URL for the corresponding state
 * @providedPropType {string[]} currentRefinement - the refinement currently applied
 * @providedPropType {array.<{label: string, value: string}>} items - the list of indexes the SortBy can display.
 */
export default createConnector({
  displayName: 'AlgoliaSortBy',

  propTypes: {
    defaultRefinement: PropTypes.string,
  },

  getProvidedProps(props, state) {
    const currentRefinement = getCurrentRefinement(props, state);
    return {currentRefinement};
  },

  refine(props, state, nextRefinement) {
    const id = getId();
    return {
      ...state,
      [id]: nextRefinement,
    };
  },

  cleanUp(props, state) {
    return omit(state, getId());
  },

  getSearchParameters(searchParameters, props, state) {
    const selectedIndex = getCurrentRefinement(props, state);
    return searchParameters.setIndex(selectedIndex);
  },

  getMetadata() {
    return {id: getId()};
  },
});
