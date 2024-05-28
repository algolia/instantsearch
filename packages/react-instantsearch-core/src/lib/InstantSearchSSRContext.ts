import { createContext } from 'react';

import type { InstantSearchServerState } from '../components/InstantSearchSSRProvider';
import type { InternalInstantSearch } from './useInstantSearchApi';
import type { UiState } from 'instantsearch.js';
import type { MutableRefObject } from 'react';

export type InstantSearchSSRContextApi<
  TUiState extends UiState,
  TRouteState = TUiState
> = InstantSearchServerState & {
  ssrSearchRef: MutableRefObject<InternalInstantSearch<
    TUiState,
    TRouteState
  > | null>;
  recommendIdx: MutableRefObject<number>;
};

export const InstantSearchSSRContext = createContext<Partial<
  InstantSearchSSRContextApi<UiState, UiState>
> | null>(null);

if (__DEV__) {
  InstantSearchSSRContext.displayName = 'InstantSearchSSR';
}
