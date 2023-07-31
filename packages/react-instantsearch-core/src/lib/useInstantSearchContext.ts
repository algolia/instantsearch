import { useContext } from 'react';

import { invariant } from '../lib/invariant';

import { InstantSearchContext } from './InstantSearchContext';

import type { InternalInstantSearch } from './useInstantSearchApi';
import type { UiState } from 'instantsearch.js';
import type { Context } from 'react';

export function useInstantSearchContext<
  TUiState extends UiState,
  TRouteState = TUiState
>() {
  const search = useContext(
    InstantSearchContext as Context<InternalInstantSearch<
      TUiState,
      TRouteState
    > | null>
  );

  invariant(
    search !== null,
    'Hooks must be used inside the <InstantSearch> component.\n\n' +
      'They are not compatible with the `react-instantsearch-core@6.x` and `react-instantsearch-dom` packages, so make sure to use the <InstantSearch> component from `react-instantsearch-core@7.x`.'
  );

  return search;
}
