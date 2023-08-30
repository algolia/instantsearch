import {
  getInitialResults,
  waitForResults,
} from 'instantsearch.js/es/lib/server';
import React, { ReactNode } from 'react';
import { InstantSearchSSRProvider } from 'react-instantsearch-core';

import type { InitialResults, InstantSearch } from 'instantsearch.js';

export async function getServerStateFromSearch(
  search: InstantSearch
): Promise<InitialResults> {
  search.start();

  await waitForResults(search);

  return getInitialResults(search.mainIndex);
}

type InstantSearchNextJsSSRProviderProps = {
  children?: ReactNode;
  search: InstantSearch;
};

export async function InstantSearchNextJsSSRProvider({
  search,
  children,
}: InstantSearchNextJsSSRProviderProps) {
  const initialResults = await getServerStateFromSearch(search);

  // const searchClient = search.mainHelper!.getClient();
  // const indexName = search.mainIndex.getIndexName();

  const serverState = {
    initialResults,
    ssrSearchRef: search,
  };

  return (
    <InstantSearchSSRProvider {...serverState}>
      {children}
    </InstantSearchSSRProvider>
  );
}
