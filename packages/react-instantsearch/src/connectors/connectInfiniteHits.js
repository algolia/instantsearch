import createConnector from '../core/createConnector';
import {
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
    const results = getResults(searchResults, this.context);

    this._allResults = this._allResults || [];
    this._previousPage = this._previousPage || 0;

    if (!results) {
      return {
        hits: [],
        hasMore: false,
      };
    }

    const { hits, page, nbPages } = results;

    if (page === 0) {
      this._allResults = hits;
    } else if (page > this._previousPage) {
      this._allResults = [...this._allResults, ...hits];
    } else if (page < this._previousPage) {
      this._allResults = hits;
    }

    const lastPageIndex = nbPages - 1;
    const hasMore = page < lastPageIndex;

    this._previousPage = page;

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
