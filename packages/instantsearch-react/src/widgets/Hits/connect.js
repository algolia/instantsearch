import {PropTypes} from 'react';

import createConnector from '../../core/createConnector';

export default createConnector({
  displayName: 'AlgoliaHits',

  propTypes: {
    /**
     * How many hits should be displayed for every page.
     * Ignored when a `HitsPerPage` component is also present.
     * @public
     */
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
    if (
      typeof props.hitsPerPage !== 'undefined' &&
      typeof searchParameters.hitsPerPage === 'undefined'
    ) {
      return searchParameters.setHitsPerPage(props.hitsPerPage);
    }
    return searchParameters;
  },
});
