/**
 * @module widgets/InfiniteHits
 */
import {PropTypes} from 'react';

import createConnector from '../core/createConnector';

/**
 * InfiniteHits connector provides the logic to create connected
 * components that will render an continuous list of results retrieved from
 * Algolia. This connector provides a function to load more results.
 * @name connectInfiniteHits
 * @kind connector
 * @category connector
 * @propType {number} hitsPerPage - How many hits should be displayed for every page.
 *   Ignored when a `HitsPerPage` component is also present.
 * @providedPropType {array.<object>} hits - the records that matched the search state
 * @providedPropType {boolean} hasMore - indicates if there are more pages to load
 */
export default createConnector({
  displayName: 'AlgoliaInfiniteHits',

  propTypes: {
    hitsPerPage: PropTypes.number,
  },

  defaultProps: {
    id: 'infinityPagesOfThe1000hits',
  },

  getProps(componentProps, allWidgetsState, resultsStruct) {
    if (!resultsStruct.results) {
      this._allResults = [];
      return {
        hits: this._allResults,
        hasMore: false,
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
      } else if (page < previousPage) {
        this._allResults = hits;
      }
      // If it is the same page we do not touch the page result list
    }

    const lastPageIndex = nbPages - 1;
    const hasMore = page < lastPageIndex;
    return {
      hits: this._allResults,
      hasMore,
    };
  },

  getSearchParameters(searchParameters, props, widgetsState) {
    const currentPage = widgetsState[props.id] ?
      widgetsState[props.id].page :
      0;
    const isHitsPerPageDefined = typeof searchParameters.hitsPerPage !== 'undefined';

    return searchParameters.setQueryParameters({
      page: currentPage,
      hitsPerPage: isHitsPerPageDefined ? searchParameters.hitsPerPage : props.hitsPerPage,
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
