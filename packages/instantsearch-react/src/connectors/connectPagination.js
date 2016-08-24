import {PropTypes} from 'react';
import {omit} from 'lodash';

import createConnector from '../createConnector';

function getPage(props, state) {
  let page = state[props.id];
  if (typeof page === 'undefined') {
    page = 0;
  } else if (typeof page === 'string') {
    page = parseInt(page, 10);
  }
  return page;
}

export default createConnector({
  displayName: 'AlgoliaPagination',

  propTypes: {
    id: PropTypes.string,
  },

  defaultProps: {
    id: 'p',
  },

  getProps(props, state, search) {
    if (!search.results) {
      return null;
    }
    return {
      nbPages: search.results.nbPages,
      page: getPage(props, state),
    };
  },

  refine(props, state, nextPage) {
    return {
      ...state,
      [props.id]: nextPage,
    };
  },

  getSearchParameters(searchParameters, props, state) {
    return searchParameters.setPage(getPage(props, state));
  },

  transitionState(props, prevState, nextState) {
    if (prevState[props.id] === nextState[props.id]) {
      return omit(nextState, props.id);
    }
    return nextState;
  },

  getMetadata(props) {
    return {
      id: props.id,
    };
  },
});
