import { useContext } from 'react';

import { InstantSearchSSRContext } from './InstantSearchSSRContext';

import type { InstantSearchSSRContextApi } from './InstantSearchSSRContext';
import type { UiState } from 'instantsearch.js';
import type { Context } from 'react';

export function useInstantSearchSSRContext<
  TUiState extends UiState,
  TRouteState = TUiState
>() {
  return useContext(
    InstantSearchSSRContext as Context<InstantSearchSSRContextApi<
      TUiState,
      TRouteState
    > | null>
  );
}
