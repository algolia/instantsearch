import {PropTypes} from 'react';

import createHOC from '../createHOC';

export default createHOC({
  displayName: 'AlgoliaHits',

  propTypes: {
    hitsPerPage: PropTypes.number,
  },

  configure(state, props) {
    if (typeof props.hitsPerPage === 'undefined') {
      return state;
    }
    return state.setQueryParameters({
      hitsPerPage: props.hitsPerPage,
    });
  },

  mapStateToProps(state) {
    return {
      hits: state.searchResults && state.searchResults.hits,
    };
  },
});
