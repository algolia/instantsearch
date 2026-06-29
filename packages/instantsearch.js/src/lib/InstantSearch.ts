import {
  InstantSearch as CoreInstantSearch,
  INSTANTSEARCH_FUTURE_DEFAULTS,
} from 'instantsearch-core';

import createHelpers from './createHelpers';
import version from './version';

import type {
  InstantSearchOptions,
  InstantSearchStatus,
  UiState,
} from 'instantsearch-core';

export { INSTANTSEARCH_FUTURE_DEFAULTS };
export type { InstantSearchOptions, InstantSearchStatus };

class InstantSearch<
  TUiState extends UiState = UiState,
  TRouteState = TUiState
> extends CoreInstantSearch<TUiState, TRouteState> {
  constructor(options: InstantSearchOptions<TUiState, TRouteState>) {
    super({
      ...options,
      _internalHelpers: createHelpers({ numberLocale: options.numberLocale }),
    });

    const { searchClient } = options;
    if (
      searchClient &&
      typeof (searchClient as { addAlgoliaAgent?: unknown })
        .addAlgoliaAgent === 'function'
    ) {
      (
        searchClient as { addAlgoliaAgent: (agent: string) => void }
      ).addAlgoliaAgent(`instantsearch.js (${version})`);
    }
  }
}

export default InstantSearch;
