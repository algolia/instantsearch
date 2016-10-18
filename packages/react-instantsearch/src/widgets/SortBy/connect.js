import {PropTypes} from 'react';

import createConnector from '../../core/createConnector';

function getSelectedIndex(props, state) {
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
    const currentRefinement = getSelectedIndex(props, state);
    return {currentRefinement};
  },

  refine(props, state, nextSelectedIndex) {
    return {
      ...state,
      [props.id]: nextSelectedIndex,
    };
  },

  getSearchParameters(searchParameters, props, state) {
    const selectedIndex = getSelectedIndex(props, state);
    return searchParameters.setIndex(selectedIndex);
  },

  getMetadata(props) {
    return {id: props.id};
  },
});
