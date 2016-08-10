import {PropTypes} from 'react';

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

  getMetadata(props) {
    return {
      id: props.id,
      clearOnChange: true,
    };
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
});
