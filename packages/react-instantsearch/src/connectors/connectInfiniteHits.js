import createConnector from '../core/createConnector';
import {
  getIndex,
  getCurrentRefinementValue,
  refineValue,
  getResults,
} from '../core/indexUtils';

function getId() {
  return 'page';
}

function getCurrentRefinement(props, searchState, context) {
  const id = getId();
  const page = 1;
  return getCurrentRefinementValue(
    props,
    searchState,
    context,
    id,
    page,
    currentRefinement => {
      if (typeof currentRefinement === 'string') {
        currentRefinement = parseInt(currentRefinement, 10);
      }
      return currentRefinement;
    }
  );
}

/**
 * InfiniteHits connector provides the logic to create connected
 * components that will render an continuous list of results retrieved from
 * Algolia. This connector provides a function to load more results.
 * @name connectInfiniteHits
 * @kind connector
 * @providedPropType {array.<object>} hits - the records that matched the search state
 * @providedPropType {boolean} hasMore - indicates if there are more pages to load
 * @providedPropType {function} refine - call to load more results
 */
export default createConnector({
  displayName: 'AlgoliaInfiniteHits',

  getProvidedProps(props, searchState, searchResults) {
    const index = getIndex(this.context);
    const results = getResults(searchResults, this.context);

    if (!results) {
      this._allResults = [];
      return {
        hits: this._allResults,
        hasMore: false,
      };
    }

    const { hits, page, nbPages, hitsPerPage } = results;

    if (page === 0) {
      this._allResults = hits;
    } else {
      const previousPage = this._allResults.length / hitsPerPage - 1;

      if (page > previousPage) {
        this._allResults = [...this._allResults, ...hits];
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
    return searchParameters.setQueryParameters({
      page: getCurrentRefinement(props, searchState, this.context) - 1,
    });
  },

  refine(props, searchState) {
    const id = getId();
    const nextPage = getCurrentRefinement(props, searchState, this.context) + 1;
    const nextValue = { [id]: nextPage };
    const resetPage = false;
    return refineValue(searchState, nextValue, this.context, resetPage);
  },
});
