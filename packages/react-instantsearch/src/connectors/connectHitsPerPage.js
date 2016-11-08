import {PropTypes} from 'react';

import createConnector from '../core/createConnector';

function getCurrentRefinement(props, state) {
  if (typeof state[props.id] !== 'undefined') {
    if (typeof state[props.id] === 'string') {
      return parseInt(state[props.id], 10);
    }
    return state[props.id];
  }
  return props.defaultRefinement;
}

/**
 * connectHitsPerPage connector provides the logic to create connected
 * components that will allow a user to choose to display more or less results from Algolia.
 * @name connectHitsPerPage
 * @kind connector
 * @category connector
 * @propType {string} [id="hPP"] - The id of the widget.
 * @propType {number} defaultRefinement - The number of items selected by default
 * @propType {{value, label}[]|number[]} items - List of hits per page options. Passing a list of numbers [n] is a shorthand for [{value: n, label: n}].
 * @providedPropType {function} refine - a function to remove a single filter
 * @providedPropType {function} createURL - a function to generate a URL for the corresponding state
 * @providedPropType {string} currentRefinement - the refinement currently applied
 */
export default createConnector({
  displayName: 'AlgoliaHitsPerPage',

  propTypes: {
    id: PropTypes.string,
    defaultRefinement: PropTypes.number.isRequired,
  },

  defaultProps: {
    id: 'hPP',
  },

  getProps(props, state) {
    return {
      currentRefinement: getCurrentRefinement(props, state),
    };
  },

  refine(props, state, nextHitsPerPage) {
    return {
      ...state,
      [props.id]: nextHitsPerPage,
    };
  },

  getSearchParameters(searchParameters, props, state) {
    return searchParameters.setHitsPerPage(getCurrentRefinement(props, state));
  },

  getMetadata(props) {
    return {id: props.id};
  },
});
