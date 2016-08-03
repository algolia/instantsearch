import {PropTypes} from 'react';

import createConnector from '../createConnector';

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
    id: PropTypes.string,
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
});
