import { createContext } from 'react';

import type { InstantSearch } from 'instantsearch.js';

export type InstantSearchServerContextApi = {
  /**
   * Fowards search internals to the server execution context to access them
   * in `getServerState()`.
   */
  notifyServer(params: { search: InstantSearch }): void;
};

export const InstantSearchServerContext =
  createContext<InstantSearchServerContextApi | null>(null);

if (__DEV__) {
  InstantSearchServerContext.displayName = 'InstantSearchServer';
}
