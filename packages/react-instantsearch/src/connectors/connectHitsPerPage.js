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

export default createConnector({
  displayName: 'AlgoliaHitsPerPage',

  propTypes: {
    /**
     * URL State serialization key.
     * @public
     */
    id: PropTypes.string,
    /**
     * Default state of the widget.
     * @public
     */
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
