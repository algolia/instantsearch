import isEqual from 'react-fast-compare';

import createConnector from '../core/createConnector';
import {
  getCurrentRefinementValue,
  refineValue,
  getResults,
} from '../core/indexUtils';
import { addAbsolutePositions, addQueryID } from '../core/utils';

function getId() {
  return 'page';
}

function getCurrentRefinement(props, searchState, context) {
  const id = getId();
  const page = 1;
  const currentRefinement = getCurrentRefinementValue(
    props,
    searchState,
    context,
    id,
    page
  );

  if (typeof currentRefinement === 'string') {
    return parseInt(currentRefinement, 10);
  }
  return currentRefinement;
}

function getStateWithoutPage(state) {
  const { page, ...rest } = state || {};
  return rest;
}

function getInMemoryCache() {
  let cachedHits = undefined;
  let cachedState = undefined;
  return {
    read({ state }) {
      return isEqual(cachedState, getStateWithoutPage(state))
        ? cachedHits
        : null;
    },
    write({ state, hits }) {
      cachedState = getStateWithoutPage(state);
      cachedHits = hits;
    },
  };
}

function extractHitsFromCachedHits(cachedHits) {
  return Object.keys(cachedHits)
    .map(Number)
    .sort((a, b) => a - b)
    .reduce((acc, page) => {
      return acc.concat(cachedHits[page]);
    }, []);
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
    const results = getResults(searchResults, {
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });

    if (!results) {
      return {
        hits: [],
        hasPrevious: false,
        hasMore: false,
        refine: () => {},
        refinePrevious: () => {},
        refineNext: () => {},
      };
    }

    const { page, hits, hitsPerPage, nbPages, _state: state } = results;

    this._cache = props.cache ? props.cache : this._cache || getInMemoryCache();
    const cachedHits = this._cache.read({ state }) || {};

    const hitsWithPositions = addAbsolutePositions(hits, hitsPerPage, page);
    const hitsWithPositionsAndQueryID = addQueryID(
      hitsWithPositions,
      results.queryID
    );

    cachedHits[page] = hitsWithPositionsAndQueryID;
    this._cache.write({ state, hits: cachedHits });

    /*
      Math.min() and Math.max() returns Infinity or -Infinity when no argument is given.
      But there is always something in this point because of `cachedHits[page]`.
    */
    const firstReceivedPage = Math.min(...Object.keys(cachedHits).map(Number));
    const lastReceivedPage = Math.max(...Object.keys(cachedHits).map(Number));

    const hasPrevious = firstReceivedPage > 0;
    const lastPageIndex = nbPages - 1;
    const hasMore = lastReceivedPage < lastPageIndex;
    const refinePrevious = (event) => this.refine(event, firstReceivedPage - 1);
    const refineNext = (event) => this.refine(event, lastReceivedPage + 1);

    return {
      hits: extractHitsFromCachedHits(cachedHits),
      hasPrevious,
      hasMore,
      refinePrevious,
      refineNext,
    };
  },

  getSearchParameters(searchParameters, props, searchState) {
    return searchParameters.setQueryParameters({
      page:
        getCurrentRefinement(props, searchState, {
          ais: props.contextValue,
          multiIndexContext: props.indexContextValue,
        }) - 1,
    });
  },

  refine(props, searchState, event, index) {
    const id = getId();
    const nextValue = { [id]: index + 1 };
    const resetPage = false;
    return refineValue(
      searchState,
      nextValue,
      { ais: props.contextValue, multiIndexContext: props.indexContextValue },
      resetPage
    );
  },
});
