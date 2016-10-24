/**
 * @module widgets/Hits
 */
import {PropTypes} from 'react';

import createConnector from '../core/createConnector';

/**
 * Hits connector provides the logic to create connected
 * components that will render the results retrived from
 * Algolia.
 * @name Hits
 * @kind HOC
 * @category connector
 * @propType {number} hitsPerPage - How many hits should be displayed for every page.
 *   Ignored when a `HitsPerPage` component is also present.
 * @propType {Component} itemComponent - Component used for rendering each hit from
 *   the results. If it is not provided the rendering defaults to displaying the
 *   hit in its JSON form. The component will be called with a `hit` prop.
 * @providedPropType {array.<object>} hits - the records that matched the search state
 */
export default createConnector({
  displayName: 'AlgoliaHits',

  propTypes: {
    hitsPerPage: PropTypes.number,
    itemComponent: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func,
    ]),
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
