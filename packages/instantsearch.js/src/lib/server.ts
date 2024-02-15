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
  search: InstantSearch
): Promise<SearchOptions[]> {
  const helper = search.mainHelper!;

  // Extract search parameters from the search client to use them
  // later during hydration.
  let requestParamsList: SearchOptions[];
  const client = helper.getClient();
  helper.setClient({
    search(queries) {
      requestParamsList = queries.map(({ params }) => params!);
      return client.search(queries);
    },
  });

  helper.searchOnlyWithDerivedHelpers();

  return new Promise((resolve, reject) => {
    // All derived helpers resolve in the same tick so we're safe only relying
    // on the first one.
    helper.derivedHelpers[0].on('result', () => {
      resolve(requestParamsList);
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
    if (searchResults) {
      const requestParams = requestParamsList?.[requestParamsIndex++];
      initialResults[widget.getIndexId()] = {
        // We convert the Helper state to a plain object to pass parsable data
        // structures from server to client.
        state: { ...searchResults._state },
        results: searchResults._rawResults,
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
