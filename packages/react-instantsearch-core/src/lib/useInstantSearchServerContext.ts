import { useContext } from 'react';

import { InstantSearchServerContext } from '../components/InstantSearchServerContext';

import type { InstantSearchServerContextApi } from '../components/InstantSearchServerContext';
import type { UiState } from 'instantsearch-core';
import type { Context } from 'react';

export function useInstantSearchServerContext<
  TUiState extends UiState,
  TRouteState = TUiState
>() {
  return useContext(
    InstantSearchServerContext as Context<InstantSearchServerContextApi<
      TUiState,
      TRouteState
    > | null>
  );
}
