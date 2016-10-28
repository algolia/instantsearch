/**
 * @module widgets/Hits
 */
import {PropTypes} from 'react';

import createConnector from '../core/createConnector';

/**
 * InfiniteHits connector provides the logic to create connected
 * components that will render an continuous list of results retrieved from
 * Algolia. This connector provides a function to load more results.
 * @name InfiniteHits
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
  displayName: 'Algolia1000HitsDragon',

  propTypes: {
    hitsPerPage: PropTypes.number,
    itemComponent: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func,
    ]),
  },

  defaultProps: {
    id: 'infinityPagesOfThe1000hits',
  },

  getProps(componentProps, allWidgetsState, resultsStruct) {
    if (!resultsStruct.results) {
      this._allResults = [];
      return {
        hits: [],
        isLastPage: true,
      };
    }

    const {hits, page, nbPages, hitsPerPage} = resultsStruct.results;

    if (page === 0) {
      this._allResults = hits;
    } else {
      const previousPage = this._allResults.length / hitsPerPage - 1;

      if (page > previousPage) {
        this._allResults = [
          ...this._allResults,
          ...hits,
        ];
      } else {
        this._allResults = hits;
      }
    }

    return {
      hits: this._allResults,
      isLastPage: nbPages === page + 1,
    };
  },

  getSearchParameters(searchParameters, props, widgetsState) {
    const currentPage = widgetsState[props.id] ?
      widgetsState[props.id].page :
      0;
    const isHitsPerPageDefined = typeof props.hitsPerPage !== 'undefined';

    return searchParameters.setQueryParameters({
      page: currentPage,
      hitsPerPage: isHitsPerPageDefined ? props.hitsPerPage : searchParameters.hitsPerPage,
    });
  },

  refine(props, widgetsState) {
    const nextPage = widgetsState[props.id] ?
      widgetsState[props.id].page + 1 :
      1;
    return {
      ...widgetsState,
      [props.id]: {
        page: nextPage,
      },
    };
  },

  transitionState(props, prevState, nextState) {
    if (prevState[props.id] === nextState[props.id]) {
      return {
        ...nextState,
        [props.id]: {
          page: 0,
        },
      };
    }
    return nextState;
  },
});
