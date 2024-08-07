import {
  snippet,
  reverseSnippet,
  highlight,
  reverseHighlight,
  insights,
  getInsightsAnonymousUserToken,
} from './helpers';
import { createInfiniteHitsSessionStorageCache } from './lib/infiniteHitsCache';
import InstantSearch from './lib/InstantSearch';
import { deprecate } from './lib/utils';
import version from './lib/version';

import type { InstantSearchOptions } from './lib/InstantSearch';
import type { Expand, UiState } from './types';

type InstantSearchModule = {
  <TUiState = Record<string, unknown>, TRouteState = TUiState>(
    options: InstantSearchOptions<Expand<UiState & TUiState>, TRouteState>
  ): InstantSearch<Expand<UiState & TUiState>, TRouteState>;
  version: string;

  // @major remove these in favour of the exports
  /** @deprecated import { createInfiniteHitsSessionStorageCache } from 'instantsearch.js/es/lib/infiniteHitsCache' */
  createInfiniteHitsSessionStorageCache: typeof createInfiniteHitsSessionStorageCache;
  /** @deprecated import { highlight } from 'instantsearch.js/es/helpers' */
  highlight: typeof highlight;
  /** @deprecated import { reverseHighlight } from 'instantsearch.js/es/helpers' */
  reverseHighlight: typeof reverseHighlight;
  /** @deprecated import { snippet } from 'instantsearch.js/es/helpers' */
  snippet: typeof snippet;
  /** @deprecated import { reverseSnippet } from 'instantsearch.js/es/helpers' */
  reverseSnippet: typeof reverseSnippet;
  /**
   * @deprecated use createInsightsMiddleware
   * @link https://www.algolia.com/doc/api-reference/widgets/insights/js/
   */
  insights: typeof insights;
  /**
   * @deprecated use createInsightsMiddleware
   * @link https://www.algolia.com/doc/api-reference/widgets/insights/js/
   */
  getInsightsAnonymousUserToken: typeof getInsightsAnonymousUserToken;
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

instantsearch.createInfiniteHitsSessionStorageCache = deprecate(
  createInfiniteHitsSessionStorageCache,
  "import { createInfiniteHitsSessionStorageCache } from 'instantsearch.js/es/lib/infiniteHitsCache'"
);
instantsearch.highlight = deprecate(
  highlight,
  "import { highlight } from 'instantsearch.js/es/helpers'"
);
instantsearch.reverseHighlight = deprecate(
  reverseHighlight,
  "import { reverseHighlight } from 'instantsearch.js/es/helpers'"
);
instantsearch.snippet = deprecate(
  snippet,
  "import { snippet } from 'instantsearch.js/es/helpers'"
);
instantsearch.reverseSnippet = deprecate(
  reverseSnippet,
  "import { reverseSnippet } from 'instantsearch.js/es/helpers'"
);
instantsearch.insights = insights;
instantsearch.getInsightsAnonymousUserToken = getInsightsAnonymousUserToken;

Object.defineProperty(instantsearch, 'widgets', {
  get() {
    throw new ReferenceError(
      `"instantsearch.widgets" are not available from the ES build.

To import the widgets:

import { searchBox } from 'instantsearch.js/es/widgets'`
    );
  },
});

Object.defineProperty(instantsearch, 'connectors', {
  get() {
    throw new ReferenceError(
      `"instantsearch.connectors" are not available from the ES build.

To import the connectors:

import { connectSearchBox } from 'instantsearch.js/es/connectors'`
    );
  },
});

Object.defineProperty(instantsearch, 'templates', {
  get() {
    throw new ReferenceError(
      `"instantsearch.templates" are not available from the ES build.

To import the templates:

import { carousel } from 'instantsearch.js/es/templates'`
    );
  },
});

export default instantsearch;

export * from './types';
