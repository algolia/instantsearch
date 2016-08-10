import {PropTypes} from 'react';

import createConnector from '../createConnector';

export default createConnector({
  displayName: 'AlgoliaHits',

  propTypes: {
    hitsPerPage: PropTypes.number,
  },

  getProps(props, state, search) {
    if (!search.results) {
      return null;
    }

    return {
      hits: search.results.hits,
    };
  },

  getSearchParameters(searchParameters, props) {
    if (typeof props.hitsPerPage !== 'undefined') {
      return searchParameters.setHitsPerPage(props.hitsPerPage);
    }
    return searchParameters;
  },
});
