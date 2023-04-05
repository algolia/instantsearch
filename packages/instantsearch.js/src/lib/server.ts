import { walkIndex } from './utils';

import type { IndexWidget, InitialResults, InstantSearch } from '../types';

/**
 * Waits for the results from the search instance to coordinate the next steps
 * in `getServerState()`.
 */
export function waitForResults(search: InstantSearch): Promise<void> {
  const helper = search.mainHelper!;

  helper.searchOnlyWithDerivedHelpers();

  return new Promise((resolve, reject) => {
    // All derived helpers resolve in the same tick so we're safe only relying
    // on the first one.
    helper.derivedHelpers[0].on('result', () => {
      resolve();
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
export function getInitialResults(rootIndex: IndexWidget): InitialResults {
  const initialResults: InitialResults = {};

  walkIndex(rootIndex, (widget) => {
    const searchResults = widget.getResults()!;
    initialResults[widget.getIndexId()] = {
      // We convert the Helper state to a plain object to pass parsable data
      // structures from server to client.
      state: { ...searchResults._state },
      results: searchResults._rawResults,
    };
  });

  return initialResults;
}
