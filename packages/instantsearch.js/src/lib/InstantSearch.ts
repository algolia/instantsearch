export { INSTANTSEARCH_FUTURE_DEFAULTS } from 'instantsearch-core';
import { InstantSearch as _InstantSearchClass } from 'instantsearch-core';

import version from './version';

import type { InstantSearchOptions, UiState } from 'instantsearch-core';

export default class InstantSearch<
  TUiState extends UiState = UiState,
  TRouteState = TUiState
> extends _InstantSearchClass<TUiState, TRouteState> {
  constructor(options: InstantSearchOptions<TUiState, TRouteState>) {
    super(options);
    this.client.addAlgoliaAgent?.(`instantsearch.js (${version})`);
  }
}
