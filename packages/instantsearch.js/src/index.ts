import * as connectors from './connectors/index';
import { createInfiniteHitsSessionStorageCache } from './lib/infiniteHitsCache/index';
import InstantSearch from './lib/InstantSearch';
import * as routers from './lib/routers/index';
import * as stateMappings from './lib/stateMappings/index';
import version from './lib/version';
import * as middlewares from './middlewares/index';
import * as templates from './templates/index';
import * as widgets from './widgets/index';

import type { Expand, UiState, InstantSearchOptions } from 'instantsearch-core';

type InstantSearchUMDModule = {
  <TUiState = Record<string, unknown>, TRouteState = TUiState>(
    options: InstantSearchOptions<Expand<UiState & TUiState>, TRouteState>
  ): InstantSearch<Expand<UiState & TUiState>, TRouteState>;
  version: string;

  connectors: typeof connectors;
  widgets: typeof widgets;
  middlewares: typeof middlewares;

  routers: typeof routers;
  stateMappings: typeof stateMappings;
  templates: typeof templates;

  createInfiniteHitsSessionStorageCache: typeof createInfiniteHitsSessionStorageCache;
};

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
const instantsearchUmd: InstantSearchUMDModule = function instantsearch(
  options
) {
  return new InstantSearch(options);
};
instantsearchUmd.version = version;
instantsearchUmd.connectors = connectors;
instantsearchUmd.widgets = widgets;
instantsearchUmd.middlewares = middlewares;
instantsearchUmd.routers = routers;
instantsearchUmd.stateMappings = stateMappings;
instantsearchUmd.templates = templates;
instantsearchUmd.createInfiniteHitsSessionStorageCache =
  createInfiniteHitsSessionStorageCache;

export default instantsearchUmd;
