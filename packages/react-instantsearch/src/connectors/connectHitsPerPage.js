import {PropTypes} from 'react';
import createConnector from '../core/createConnector';
import {omit} from 'lodash';

function getId() {
  return 'hitsPerPage';
}

function getCurrentRefinement(props, searchState) {
  const id = getId();
  if (typeof searchState[id] !== 'undefined') {
    if (typeof searchState[id] === 'string') {
      return parseInt(searchState[id], 10);
    }
    return searchState[id];
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
 * @propType {function} [transformItems] - If provided, this function can be used to modify the `items` provided prop of the wrapped component (ex: for filtering or sorting items). this function takes the `items` prop as a parameter and expects it back in return.
 * @providedPropType {function} refine - a function to remove a single filter
 * @providedPropType {function} createURL - a function to generate a URL for the corresponding search state
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
    transformItems: PropTypes.func,
  },

  getProvidedProps(props, searchState) {
    const currentRefinement = getCurrentRefinement(props, searchState);
    const items = props.items.map(item => item.value === currentRefinement
      ? {...item, isRefined: true} : {...item, isRefined: false});
    return {
      items: props.transformItems ? props.transformItems(items) : items,
      currentRefinement,
    };
  },

  refine(props, searchState, nextHitsPerPage) {
    const id = getId();
    return {
      ...searchState,
      [id]: nextHitsPerPage,
    };
  },

  cleanUp(props, searchState) {
    return omit(searchState, getId());
  },

  getSearchParameters(searchParameters, props, searchState) {
    return searchParameters.setHitsPerPage(getCurrentRefinement(props, searchState));
  },

  getMetadata() {
    return {id: getId()};
  },
});
