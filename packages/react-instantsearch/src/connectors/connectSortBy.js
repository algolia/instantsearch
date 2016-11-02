import {PropTypes} from 'react';

import createConnector from '../core/createConnector';

function getCurrentRefinement(props, state) {
  const {id} = props;
  if (state[id]) {
    return state[id];
  }
  if (props.defaultRefinement) {
    return props.defaultRefinement;
  }
  return null;
}

export default createConnector({
  displayName: 'AlgoliaSortBy',

  propTypes: {
    /**
     * URL state serialization key.
     * The state of this widget takes the form of a `string` (the current
     * selected index).
     * @public
     */
    id: PropTypes.string,

    /**
     * The default selected index.
     * @public
     */
    defaultRefinement: PropTypes.string,
  },

  defaultProps: {
    id: 'sort_by',
  },

  getProps(props, state) {
    const currentRefinement = getCurrentRefinement(props, state);
    return {currentRefinement};
  },

  refine(props, state, nextRefinement) {
    return {
      ...state,
      [props.id]: nextRefinement,
    };
  },

  getSearchParameters(searchParameters, props, state) {
    const selectedIndex = getCurrentRefinement(props, state);
    return searchParameters.setIndex(selectedIndex);
  },

  getMetadata(props) {
    return {id: props.id};
  },
});
