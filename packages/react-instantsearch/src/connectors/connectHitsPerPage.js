import {PropTypes} from 'react';
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
 * @propType {number} defaultRefinement - The number of items selected by default
 * @propType {{value: number, label: string}[]} items - List of hits per page options.
 * @providedPropType {function} refine - a function to remove a single filter
 * @providedPropType {function} createURL - a function to generate a URL for the corresponding state
 * @providedPropType {string} currentRefinement - the refinement currently applied
 * @providedPropType {array.<{isRefined: boolean, label?: string, value: number}>} items - the list of items the HitsPerPage can display. If no label provided, the value will be displayed.
 */
export default createConnector({
  displayName: 'AlgoliaHitsPerPage',

  propTypes: {
    defaultRefinement: PropTypes.number.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.number.isRequired,
    })).isRequired,
  },

  getProvidedProps(props, state) {
    const currentRefinement = getCurrentRefinement(props, state);
    const items = props.items.map(item => item.value === currentRefinement
      ? {...item, isRefined: true} : {...item, isRefined: false});
    return {
      items,
      currentRefinement,
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
