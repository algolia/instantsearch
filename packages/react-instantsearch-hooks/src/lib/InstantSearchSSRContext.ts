import { createContext } from 'react';

import type { InstantSearchServerState } from '../components/InstantSearchSSRProvider';
import type { UiState, InstantSearch } from 'instantsearch.js';
import type { MutableRefObject } from 'react';

export type InstantSearchSSRContextApi<
  TUiState extends UiState,
  TRouteState = TUiState
> = InstantSearchServerState & {
  ssrSearchRef: MutableRefObject<InstantSearch<TUiState, TRouteState> | null>;
};

export const InstantSearchSSRContext = createContext<Partial<
  InstantSearchSSRContextApi<UiState, UiState>
> | null>(null);

if (__DEV__) {
  InstantSearchSSRContext.displayName = 'InstantSearchSSR';
}
