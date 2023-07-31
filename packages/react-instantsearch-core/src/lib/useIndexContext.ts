import { useContext } from 'react';

import { invariant } from '../lib/invariant';

import { IndexContext } from './IndexContext';

import type { IndexWidget, UiState } from 'instantsearch.js';
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
