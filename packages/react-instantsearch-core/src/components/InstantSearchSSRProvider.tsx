import React from 'react';

import { InstantSearchSSRContext } from '../lib/InstantSearchSSRContext';

import type { InternalInstantSearch } from '../lib/useInstantSearchApi';
import type { InitialResults, UiState, InstantSearch } from 'instantsearch.js';
import type { ReactNode } from 'react';
import {
  getInitialResults,
  waitForResults,
} from 'instantsearch.js/es/lib/server';

export type InstantSearchServerState = {
  initialResults: InitialResults;
};

export type InstantSearchSSRProviderProps =
  Partial<InstantSearchServerState> & {
    children?: ReactNode;
  };

/**
 * Provider to pass the server state retrieved from `getServerState()` to
 * <InstantSearch>.
 */
export function InstantSearchSSRProvider<
  TUiState extends UiState,
  TRouteState = TUiState
>({ children, ...props }: InstantSearchSSRProviderProps) {
  // This is used in `useInstantSearchApi()` to avoid creating and starting multiple instances of
  // `InstantSearch` on mount.
  const ssrSearchRef = React.useRef<InternalInstantSearch<
    UiState,
    TRouteState
  > | null>(null);

  // When <DynamicWidgets> is mounted, a second provider is used above the user-land
  // <InstantSearchSSRProvider> in `getServerState()`.
  // To avoid the user's provider overriding the context value with an empty object,
  // we skip this provider.
  if (Object.keys(props).length === 0) {
    return <>{children}</>;
  }

  return (
    <InstantSearchSSRContext.Provider value={{ ...props, ssrSearchRef }}>
      {children}
    </InstantSearchSSRContext.Provider>
  );
}

export type InstantSearchServerComponentsSSRProviderProps =
  Partial<InstantSearchServerState> & {
    children?: ReactNode;
    search: InstantSearch;
  };

export async function InstantSearchServerComponentsSSRProvider<
  TUiState extends UiState,
  TRouteState = TUiState
>({
  search,
  children,
  ...props
}: InstantSearchServerComponentsSSRProviderProps) {
  // This is used in `useInstantSearchApi()` to avoid creating and starting multiple instances of
  // `InstantSearch` on mount.
  const ssrSearchRef = React.useRef<InternalInstantSearch<
    UiState,
    TRouteState
  > | null>(null);

  // When <DynamicWidgets> is mounted, a second provider is used above the user-land
  // <InstantSearchSSRProvider> in `getServerState()`.
  // To avoid the user's provider overriding the context value with an empty object,
  // we skip this provider.
  if (Object.keys(props).length === 0) {
    return <>{children}</>;
  }

  let { initialResults } = props;

  if (search) {
    initialResults = await getServerStateFromSearch(search);
  }

  return (
    <InstantSearchSSRContext.Provider value={{ initialResults, ssrSearchRef }}>
      {children}
    </InstantSearchSSRContext.Provider>
  );
}

export async function getServerStateFromSearch(
  search: InstantSearch
): Promise<InitialResults> {
  search.start();

  await waitForResults(search);

  return getInitialResults(search.mainIndex);
}
