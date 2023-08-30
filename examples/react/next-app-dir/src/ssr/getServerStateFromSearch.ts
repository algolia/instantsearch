import {
  getInitialResults,
  waitForResults,
} from 'instantsearch.js/es/lib/server';

import type { InitialResults, InstantSearch } from 'instantsearch.js';

export async function getServerStateFromSearch(
  search: InstantSearch
): Promise<InitialResults> {
  if (!search.started) {
    search.start();
  }

  await waitForResults(search);

  return getInitialResults(search.mainIndex);
}
