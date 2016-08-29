import {PropTypes} from 'react';

import createConnector from '../../core/createConnector';

function getHitsPerPage(props, state) {
  if (typeof state[props.id] !== 'undefined') {
    if (typeof state[props.id] === 'string') {
      return parseInt(state[props.id], 10);
    }
    return state[props.id];
  }
  return props.defaultHitsPerPage;
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
    defaultHitsPerPage: PropTypes.number.isRequired,
  },

  defaultProps: {
    id: 'hPP',
  },

  getProps(props, state) {
    return {
      hitsPerPage: getHitsPerPage(props, state),
    };
  },

  refine(props, state, nextHitsPerPage) {
    return {
      ...state,
      [props.id]: nextHitsPerPage,
    };
  },

  getSearchParameters(searchParameters, props, state) {
    return searchParameters.setHitsPerPage(getHitsPerPage(props, state));
  },

  getMetadata(props) {
    return {id: props.id};
  },
});
