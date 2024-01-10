import { walkIndex } from './utils';

import type {
  IndexWidget,
  InitialResults,
  InstantSearch,
  SearchClient,
} from '../types';

type RequestParams = Parameters<SearchClient['search']>[0];

/**
 * Waits for the results from the search instance to coordinate the next steps
 * in `getServerState()`.
 */
export function waitForResults(search: InstantSearch): Promise<RequestParams> {
  const helper = search.mainHelper!;

  // Extract search parameters from the search client to use them
  // later during hydration.
  let requestParams: RequestParams;
  const client = helper.getClient();
  helper.setClient({
    search(queries, requestOptions) {
      requestParams = queries;
      return client.search(queries, requestOptions);
    },
  });

  helper.searchOnlyWithDerivedHelpers();

  return new Promise((resolve, reject) => {
    // All derived helpers resolve in the same tick so we're safe only relying
    // on the first one.
    helper.derivedHelpers[0].on('result', () => {
      resolve(requestParams);
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
   * Search parameters sent to the search client, usually
   * returned by `waitForResults()`.
   */
  requestParams?: RequestParams
): InitialResults {
  const initialResults: InitialResults = {};

  walkIndex(rootIndex, (widget) => {
    const searchResults = widget.getResults();
    if (searchResults) {
      const indexId = widget.getIndexId();
      initialResults[indexId] = {
        // We convert the Helper state to a plain object to pass parsable data
        // structures from server to client.
        state: { ...searchResults._state },
        results: searchResults._rawResults,
        requestParams: requestParams?.find(
          ({ indexName }) => indexName === indexId
        )?.params,
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
