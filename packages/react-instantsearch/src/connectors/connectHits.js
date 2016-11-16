/**
 * @module widgets/Hits
 */
import {PropTypes} from 'react';

import createConnector from '../core/createConnector';

/**
 * connectHits connector provides the logic to create connected
 * components that will render the results retrived from
 * Algolia.
 * @name connectHits
 * @kind connector
 * @category connector
 * @propType {number} hitsPerPage - How many hits should be displayed for every page.
 *   Ignored when a `HitsPerPage` component is also present.
 * @providedPropType {array.<object>} hits - the records that matched the search state
 */
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
    if (
      typeof props.hitsPerPage !== 'undefined' &&
      typeof searchParameters.hitsPerPage === 'undefined'
    ) {
      return searchParameters.setHitsPerPage(props.hitsPerPage);
    }
    return searchParameters;
  },
});
