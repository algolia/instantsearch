import { createContext } from 'react';

import type { InstantSearch, UiState } from 'instantsearch-core';

export type InstantSearchServerContextApi<
  TUiState extends UiState,
  TRouteState = TUiState
> = {
  /**
   * Fowards search internals to the server execution context to access them
   * in `getServerState()`.
   */
  notifyServer: (params: {
    search: InstantSearch<TUiState, TRouteState>;
  }) => void;
};

export const InstantSearchServerContext =
  createContext<InstantSearchServerContextApi<UiState, UiState> | null>(null);

if (__DEV__) {
  InstantSearchServerContext.displayName = 'InstantSearchServer';
}
