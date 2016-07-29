import {PropTypes} from 'react';

import createHOC from '../createHOC';

export default createHOC({
  displayName: 'AlgoliaHitsPerPage',

  propTypes: {
    defaultValue: PropTypes.number,
  },

  mapStateToProps(state) {
    return {
      hitsPerPage: state.searchParameters.hitsPerPage,
    };
  },

  configure(state, props) {
    if (typeof state.hitsPerPage !== 'undefined') {
      return state;
    }
    return state.setQueryParameter('hitsPerPage', props.defaultValue);
  },

  refine(state, props, hitsPerPage) {
    return state.setQueryParameter('hitsPerPage', hitsPerPage);
  },
});
