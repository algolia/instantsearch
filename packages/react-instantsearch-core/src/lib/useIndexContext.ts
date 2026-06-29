import { useContext } from 'react';

import { IndexContext } from './IndexContext';
import { invariant } from './invariant';

import type { IndexWidget, UiState } from 'instantsearch-core';
import type { Context } from 'react';

export function useIndexContext<TUiState extends UiState = UiState>() {
  const context = useContext(
    IndexContext as Context<IndexWidget<TUiState> | null>
  );

  invariant(
    context !== null,
    'The <Index> component must be used within <InstantSearch>.'
  );

  return context;
}
