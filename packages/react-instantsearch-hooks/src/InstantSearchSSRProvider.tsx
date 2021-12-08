import React from 'react';

import { InstantSearchSSRContext } from './InstantSearchSSRContext';

import type { InitialResults } from 'instantsearch.js';
import type { ReactNode } from 'react';

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
export function InstantSearchSSRProvider({
  children,
  ...props
}: InstantSearchSSRProviderProps) {
  return (
    <InstantSearchSSRContext.Provider value={props}>
      {children}
    </InstantSearchSSRContext.Provider>
  );
}
