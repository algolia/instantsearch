import {PropTypes} from 'react';
import {omit} from 'lodash';

import createConnector from '../core/createConnector';

function getId() {
  return 'sortBy';
}

function getCurrentRefinement(props, searchState) {
  const id = getId();
  if (searchState[id]) {
    return searchState[id];
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
 * @providedPropType {function} createURL - a function to generate a URL for the corresponding search state
 * @providedPropType {string[]} currentRefinement - the refinement currently applied
 * @providedPropType {array.<{isRefined: boolean, label?: string, value: string}>} items - the list of items the HitsPerPage can display.  If no label provided, the value will be displayed.
 */
export default createConnector({
  displayName: 'AlgoliaSortBy',

  propTypes: {
    defaultRefinement: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string.isRequired,
    })).isRequired,
  },

  getProvidedProps(props, searchState) {
    const currentRefinement = getCurrentRefinement(props, searchState);
    const items = props.items.map(item => item.value === currentRefinement
      ? {...item, isRefined: true} : {...item, isRefined: false});
    return {
      items,
      currentRefinement,
    };
  },

  refine(props, searchState, nextRefinement) {
    const id = getId();
    return {
      ...searchState,
      [id]: nextRefinement,
    };
  },

  cleanUp(props, searchState) {
    return omit(searchState, getId());
  },

  getSearchParameters(searchParameters, props, searchState) {
    const selectedIndex = getCurrentRefinement(props, searchState);
    return searchParameters.setIndex(selectedIndex);
  },

  getMetadata() {
    return {id: getId()};
  },
});
