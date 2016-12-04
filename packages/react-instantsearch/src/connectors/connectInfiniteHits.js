import {PropTypes} from 'react';

import createConnector from '../core/createConnector';

function getId() {
  return 'page';
}

/**
 * InfiniteHits connector provides the logic to create connected
 * components that will render an continuous list of results retrieved from
 * Algolia. This connector provides a function to load more results.
 * @name connectInfiniteHits
 * @kind connector
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
    const id = getId();
    const currentPage = widgetsState[id] ?
      widgetsState[id] :
      0;
    const isHitsPerPageDefined = typeof searchParameters.hitsPerPage !== 'undefined';

    return searchParameters.setQueryParameters({
      page: currentPage,
      hitsPerPage: isHitsPerPageDefined ? searchParameters.hitsPerPage : props.hitsPerPage,
    });
  },

  refine(props, widgetsState) {
    const id = getId();
    const nextPage = widgetsState[id] ?
      Number(widgetsState[id]) + 1 :
      1;
    return {
      ...widgetsState,
      [id]: nextPage,
    };
  },

  transitionState(props, prevState, nextState) {
    const id = getId();
    if (prevState[id] === nextState[id]) {
      return {
        ...nextState,
        [id]: 0,
      };
    }
    return nextState;
  },
});
