import { createInfiniteHitsSessionStorageCache } from 'instantsearch-core';

import InstantSearch from './lib/InstantSearch';
import version from './lib/version';
import * as templates from './templates/index';
import * as connectors from './umd/connectors';
import * as middlewares from './umd/middlewares';
import * as routers from './umd/routers';
import * as stateMappings from './umd/stateMappings';
import * as widgets from './widgets/index';

import type { InstantSearchOptions } from 'instantsearch-core';
import type { Expand, UiState } from 'instantsearch-core';

type InstantSearchModule = {
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
const instantsearch: InstantSearchModule = (options) =>
  new InstantSearch(options);

instantsearch.version = version;

instantsearch.connectors = connectors;
instantsearch.widgets = widgets;
instantsearch.middlewares = middlewares;

instantsearch.routers = routers;
instantsearch.stateMappings = stateMappings;
instantsearch.templates = templates;

instantsearch.createInfiniteHitsSessionStorageCache =
  createInfiniteHitsSessionStorageCache;

export default instantsearch;
