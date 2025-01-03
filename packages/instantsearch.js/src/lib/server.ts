import { walkIndex } from './utils';

import type {
  IndexWidget,
  InitialResults,
  InstantSearch,
  SearchOptions,
} from '../types';

/**
 * Waits for the results from the search instance to coordinate the next steps
 * in `getServerState()`.
 */
export function waitForResults(
  search: InstantSearch,
  skipRecommend: boolean = false
): Promise<SearchOptions[]> {
  const helper = search.mainHelper!;

  // Extract search parameters from the search client to use them
  // later during hydration.
  let requestParamsList: SearchOptions[];
  const client = helper.getClient();
  helper.setClient({
    ...client,
    search(queries) {
      requestParamsList = search.compositionID
        ? [(queries as any).requestBody.params]
        : queries.map(({ params }) => params);
      return client.search(queries);
    },
  });

  if (search._hasSearchWidget) {
    if (search.compositionID) {
      helper.searchWithComposition();
    } else {
      helper.searchOnlyWithDerivedHelpers();
    }
  }
  !skipRecommend && search._hasRecommendWidget && helper.recommend();

  return new Promise((resolve, reject) => {
    let searchResultsReceived = !search._hasSearchWidget;
    let recommendResultsReceived = !search._hasRecommendWidget || skipRecommend;
    // All derived helpers resolve in the same tick so we're safe only relying
    // on the first one.
    helper.derivedHelpers[0].on('result', () => {
      searchResultsReceived = true;
      if (recommendResultsReceived) {
        resolve(requestParamsList!);
      }
    });
    helper.derivedHelpers[0].on('recommend:result', () => {
      recommendResultsReceived = true;
      if (searchResultsReceived) {
        resolve(requestParamsList!);
      }
    });

    // However, we listen to errors that can happen on any derived helper because
    // any error is critical.
    helper.on('error', (error) => {
      reject(error);
    });
    search.on('error', (error) => {
      reject(error);
    });
    helper.derivedHelpers.forEach((derivedHelper) =>
      derivedHelper.on('error', (error) => {
        reject(error);
      })
    );
  });
}

/**
 * Walks the InstantSearch root index to construct the initial results.
 */
export function getInitialResults(
  rootIndex: IndexWidget,
  /**
   * Search parameters sent to the search client,
   * returned by `waitForResults()`.
   */
  requestParamsList?: SearchOptions[]
): InitialResults {
  const initialResults: InitialResults = {};

  let requestParamsIndex = 0;
  walkIndex(rootIndex, (widget) => {
    const searchResults = widget.getResults();
    const recommendResults = widget.getHelper()?.lastRecommendResults;
    if (searchResults || recommendResults) {
      const resultsCount = searchResults?._rawResults?.length || 0;
      const requestParams = resultsCount
        ? requestParamsList?.slice(
            requestParamsIndex,
            requestParamsIndex + resultsCount
          )
        : [];
      requestParamsIndex += resultsCount;
      initialResults[widget.getIndexId()] = {
        // We convert the Helper state to a plain object to pass parsable data
        // structures from server to client.
        ...(searchResults && {
          state: {
            ...searchResults._state,
            clickAnalytics: requestParams?.[0]?.clickAnalytics,
            userToken: requestParams?.[0]?.userToken,
          },
          results: searchResults._rawResults,
        }),
        ...(recommendResults && {
          recommendResults: {
            // We have to stringify + parse because of some explicitly undefined values.
            params: JSON.parse(JSON.stringify(recommendResults._state.params)),
            results: recommendResults._rawResults,
          },
        }),
        ...(requestParams && { requestParams }),
      };
    }
  });

  if (Object.keys(initialResults).length === 0) {
    throw new Error(
      'The root index does not have any results. Make sure you have at least one widget that provides results.'
    );
  }

  return initialResults;
}
