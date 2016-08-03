import {PropTypes} from 'react';

import createConnector from '../createConnector';

export default createConnector({
  displayName: 'AlgoliaHits',

  propTypes: {
    hitsPerPage: PropTypes.number,
  },

  mapStateToProps(state) {
    return {
      hits: state.searchResults && state.searchResults.hits,
    };
  },

  configure(state, props) {
    if (typeof props.hitsPerPage === 'undefined') {
      return state;
    }
    return state.setQueryParameters({
      hitsPerPage: props.hitsPerPage,
    });
  },
});
