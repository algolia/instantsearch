'use client';

import React from 'react';
import { InstantSearch, InstantSearchProps } from 'react-instantsearch';
import { InstantSearchSSRProvider } from 'react-instantsearch-core';

import type {
  InitialResults,
  InstantSearch as InstantSearchJS,
} from 'instantsearch.js';

type InstantSearchNextJsSSRProviderProps = InstantSearchProps & {
  initialResults: InitialResults;
  search: InstantSearchJS;
};

export function InstantSearchNextJsSSRProvider({
  initialResults,
  search,
  children,
  ...instantSearchProps
}: InstantSearchNextJsSSRProviderProps) {
  const serverState = {
    initialResults,
    ssrSearchRef: search,
  };

  return (
    <InstantSearchSSRProvider {...serverState}>
      <InstantSearch {...instantSearchProps}>{children}</InstantSearch>
    </InstantSearchSSRProvider>
  );
}
