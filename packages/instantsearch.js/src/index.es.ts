import InstantSearch from './lib/InstantSearch';

import type { InstantSearchOptions } from 'instantsearch-core';
import type { Expand, UiState } from 'instantsearch-core';

export * from 'instantsearch-core';
export {
  highlight,
  reverseHighlight,
  snippet,
  reverseSnippet,
  insights,
} from 'instantsearch-core/internal';
export { default as version } from './lib/version';
export * from './helpers/components';
export * from './widgets';
export * from './templates';
export * from './types';

/**
 * InstantSearch is the main component of InstantSearch.js. This object
 * manages the widget and lets you add new ones.
 *
 * Two parameters are required to get you started with InstantSearch.js:
 *  - `indexName`: the main index that you will use for your new search UI
 *  - `searchClient`: the search client to plug to InstantSearch.js
 *
 * The [search client provided by Algolia](algolia.com/doc/api-client/getting-started/what-is-the-api-client/javascript/)
 * needs an `appId` and an `apiKey`. Those parameters can be found in your
 * [Algolia dashboard](https://www.algolia.com/api-keys).
 *
 * If you want to get up and running quickly with InstantSearch.js, have a
 * look at the [getting started](https://www.algolia.com/doc/guides/building-search-ui/getting-started/js/).
 */
export function instantsearch<
  TUiState = Record<string, unknown>,
  TRouteState = TUiState,
>(
  options: InstantSearchOptions<Expand<UiState & TUiState>, TRouteState>
): InstantSearch<Expand<UiState & TUiState>, TRouteState> {
  return new InstantSearch(options);
}
