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
 * @providedPropType {array.<object>} hits - the records that matched the search state
 * @providedPropType {boolean} hasMore - indicates if there are more pages to load
 */
export default createConnector({
  displayName: 'AlgoliaInfiniteHits',

  getProvidedProps(props, searchState, searchResults) {
    if (!searchResults.results) {
      this._allResults = [];
      return {
        hits: this._allResults,
        hasMore: false,
      };
    }

    const {hits, page, nbPages, hitsPerPage} = searchResults.results;

    if (page === 0) {
      this._allResults = hits;
    } else {
      const previousPage = this._allResults.length - 1 / hitsPerPage;

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

  getSearchParameters(searchParameters, props, searchState) {
    const id = getId();
    const currentPage = searchState[id] ?
      searchState[id] :
      0;

    return searchParameters.setQueryParameters({
      page: currentPage,
    });
  },

  refine(props, searchState) {
    const id = getId();
    const nextPage = searchState[id] ?
      Number(searchState[id]) + 1 :
      1;
    return {
      ...searchState,
      [id]: nextPage,
    };
  },

  transitionState(props, prevSearchState, nextSearchState) {
    const id = getId();
    if (prevSearchState[id] === nextSearchState[id]) {
      return {
        ...nextSearchState,
        [id]: 0,
      };
    }
    return nextSearchState;
  },
});
